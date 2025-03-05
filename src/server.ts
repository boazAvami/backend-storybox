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
import { genresRouter } from './routes/genres_route';
import { filesRouter } from './routes/files_route';

dotenv.config();
const port = process.env.PORT;
const app = express();

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

app.use("/public", express.static("public"));
app.use('/files', filesRouter);

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "REST API - Yael&Shirin&Boaz StoryBox Backend",
            version: "1.0.0",
            description: "The StoryBox REST server including authentication using JWT",
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

export default initApp;