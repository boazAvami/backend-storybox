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

dotenv.config();
const port = process.env.PORT;
const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/users', usersRouter);
app.use('/conversations', conversationsRouter);

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "REST API - Sagi&Yael Backend",
            version: "1.0.0",
            description: "REST server including authentication using JWT",
        },
        servers: [{ url: `http://localhost:${port}`, },],
    },
    apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));


const db = mongoose.connection;
db.on("error", (error: Error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

export const initApp = () => {
    return new Promise<Express>((resolve, reject) => {
        if (!process.env.DB_CONNECTION) {
            reject("DB_CONNECTION is not defined in .env file");
        } else {
            local_mongoose
            .connect(process.env.DB_CONNECTION)
            .then(() => {
                    resolve(app);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};