import { Request, Response } from "express";
import mongoose, { Model } from "mongoose";

export interface authenticatedRequest extends Request {
    userId: string
}

abstract class BaseController<T> {
    model: Model<T>;
    constructor(model: Model<T>) {
        this.model = model;
    }

    abstract getAll(req: Request, res: Response): Promise<void>;

    async getByIdInternal(itemId) {
        // eslint-disable-next-line no-useless-catch
        try {
            const item = await this.model.findById(itemId);
            if (item != null) {
                return item;
            } else {
                throw new Error('Item Not Found');
            }
        } catch (error) {
            throw error
        }
    };

    async getById(req: Request, res: Response) {
        const id = req.params.id;

        try {
            const item = await this.getByIdInternal(id);
            if (item) {
                res.send(item);
            }
        } catch (error) {
            if (error.message == 'Item Not Found') {
                res.status(404).send({ error: 'Item Not Found'});
            } else {
                res.status(400).send({ error: error.message });
            }
        }
    };

    async create(req: Request, res: Response) {
        const body = req.body;
        const authenticatedUserId = req.params.userId; // ID of the logged-in user
        const itemToCreate = {
            ...body,
            ownerId: authenticatedUserId
        }
        
        try {
            const item = await this.model.create(itemToCreate);
            res.status(201).send(item);
        } catch {
            res.status(400).send("Validation failed: One or more Required fields are missing.");
        }
    };

    async update(req: authenticatedRequest, res: Response, userId) {
        try {
            const authenticatedUserId = req.params.userId; // ID of the logged-in user

            if (authenticatedUserId !== userId){
                res.status(403).send('Forbbiden');
            } else {
                const updatedItem = await this.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
                if (!updatedItem) {
                    res.status(404).json({ message: 'Not found' });
                } else {
                    res.status(200).json(updatedItem);
                }
            }
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

    async delete(req: authenticatedRequest, res: Response, ownerId) {
        try {
            const authenticatedUserId = req.params.userId; // ID of the logged-in user

            // Ensure that only the authenticated user can delete their Items
            if (authenticatedUserId !== ownerId){
                res.status(403).send('Forbbiden');
            } else {
                const deletedItem = await this.model.findOneAndDelete({_id: req.params.id});

                if (!deletedItem) res.status(404).json({ message: 'Not found' });
                res.status(200).json({_id: deletedItem._id});
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
}

export default BaseController