import { Request, Response } from "express";
import {userModel, IUser} from "../models/users_model";
import BaseController from "./base_controller";
import { authenticatedRequest } from "./base_controller";
import { hashPassword } from "./auth_controller";

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
            res.status(500).json({ error: err.message });
        }
    };


    async getMe(req: authenticatedRequest, res: Response) {
        try {
            const userId =  req.params.userId; // User id from auth middleware
            const user = await userModel.findById(userId);
 
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
 
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default new UsersController();