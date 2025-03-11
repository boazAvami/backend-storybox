import { Request, Response } from "express";
import {userModel, IUser} from "../models/users_model";
import BaseController from "./base_controller";
// import bcrypt from 'bcrypt';
import { authenticatedRequest } from "./base_controller";
import { hashPassword } from "./auth_controller";
import mongoose from "mongoose";

class UsersController extends BaseController<IUser> {
    constructor() {
        super(userModel);
    }

    async getAll(req: Request, res: Response) {
        try {
            const users = await userModel.find();
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async delete(req: authenticatedRequest, res: Response) {
        try {
            const userId = req.params.id // User id
            await super.delete(req, res, userId);
        } catch (err) {
            if (!res.headersSent) {
                res.status(500).json({ error: err.message });
            }
        }
    };

    async update(req: authenticatedRequest, res: Response) {
        try {
            const userId = req.params.id // User id

            // Check if the password is being updated
            if (req.body.password) {
                req.body.password = await hashPassword(req.body.password);
            }

            await super.update(req, res, userId);
        } catch (err) {
            // Handle duplicate key error (MongoDB unique constraint)
            if (typeof err === "object" && err !== null && "code" in err && (err).code === 11000) {
                const field = Object.keys((err).keyPattern)[0];
                
                // Mapping MongoDB field names to human-friendly labels
                const fieldLabels: Record<string, string> = {
                    userName: "User Name",
                    email: "Email",
                    phone_number: "Phone Number",
                    firstName: "First Name",
                    lastName: "Last Name",
                };
                
                const prettyField = fieldLabels[field] || field; // Default to field name if not mapped
                res.status(400).json({ message: `${prettyField} already exists` });
                return;
            }
            
            // Handle Mongoose validation errors
            if (err instanceof mongoose.Error.ValidationError) {
                const errors = Object.values(err.errors).map((e) => (e as mongoose.Error.ValidatorError).message);
                res.status(400).json({ message: errors.join(", ") });
                return;
            }
            
            // Handle unexpected errors
            res.status(500).json({ message: "Something went wrong. Please try again later." });
        }
    };
}

export default new UsersController();