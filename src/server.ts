import express, { Express } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import { postsRouter } from './routes/posts_route';
import { commentsRouter } from './routes/comments_route';
import local_mongoose from "mongoose";
import { authRouter } from './routes/auth_route';
import { usersRouter } from './routes/users_route';
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { conversationsRouter } from './routes/conversations_router';
import { genresRouter } from './routes/genres_route';
import likesRouter from './routes/likes_route';
import { filesRouter } from './routes/files_route';

// Socket.IO imports
import { createServer } from 'http';
import { Server } from 'socket.io';
import { conversationModel } from "./models/conversations_model"; // Ensure the model exists

dotenv.config();
const port = process.env.PORT;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

app.use('/genres', genresRouter);
app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/users', usersRouter);
app.use("/likes", likesRouter);
app.use('/conversations', conversationsRouter);
app.use("/public", express.static("public"));
app.use('/files', filesRouter);

// Swagger setup
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "REST API - Yael&Shirin&Boaz StoryBox Backend",
            version: "1.0.0",
            description: "The StoryBox REST server including authentication using JWT",
        },
        servers: [{ url: `http://localhost:${port}` }],
    },
    apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// Database connection
const db = mongoose.connection;
db.on("error", (error: Error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

// Socket.IO Chat Logic
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (conversationId) => {
        socket.join(conversationId);
        console.log(`User joined conversation: ${conversationId}`);
    });

    socket.on("sendMessage", async ({ conversationId, senderId, text }) => {
        try {
            const conversation = await conversationModel.findById(conversationId);
            if (!conversation) {
                socket.emit("error", "Conversation not found");
                return;
            }

            const message = {
                senderId,
                text,
                timestamp: new Date(),
                isRead: false,
            };

            conversation.messages.push(message);
            conversation.lastUpdated = new Date();
            await conversation.save();

            io.to(conversationId).emit("receiveMessage", message);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", "Failed to send message");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Function to initialize app with Socket.IO server
export const initApp = () => {
    return new Promise<{ app: Express; server: any }>((resolve, reject) => {
        if (!process.env.DB_CONNECTION) {
            reject("DB_CONNECTION is not defined in .env file");
        } else {
            local_mongoose
                .connect(process.env.DB_CONNECTION)
                .then(() => {
                    resolve({ app, server });
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

export default initApp;
