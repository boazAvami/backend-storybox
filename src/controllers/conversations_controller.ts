import { Request, Response } from "express";
import { conversationModel, IConversation } from "../models/conversations_model";
import BaseController, { authenticatedRequest } from "./base_controller";

class ConversationsController extends BaseController<IConversation> {
  constructor() {
    super(conversationModel);
  }

  // Create a new conversation
  async create(req: authenticatedRequest, res: Response): Promise<void> {
    try {
      const currUserId = req.params.userId
      const { recipientId } = req.body;

      console.log("boazzzzzzz: " + currUserId + " vvvv  " + recipientId)
      if (!currUserId || ! recipientId) {
        res.status(400).json({ error: "Both user IDs are required" });
        return;
      }

      let conversation = await conversationModel.findOne({
        participants: { $all: [currUserId , recipientId] },
      });

      if (!conversation) {
        conversation = new conversationModel({
          participants: [currUserId, recipientId],
          messages: [],
        });
        await conversation.save();
      }

      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all conversations for a user
  async getAll(req: authenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const conversations = await conversationModel.find({
        participants: userId,
      });

      res.status(200).json(conversations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get a specific conversation by ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const conversation = await super.getByIdInternal(req.params.id);
      res.status(200).json(conversation);
    } catch (error) {
      res.status(404).json({ error: "Conversation not found" });
    }
  }

  // Add a message to a conversation
  async addMessage(req: authenticatedRequest, res: Response): Promise<void> {
    try {
      const { senderId, text } = req.body;
      const { id: conversationId } = req.params;

      if (!senderId || !text) {
        res.status(400).json({ error: "Sender ID and text are required" });
        return;
      }

      const conversation = await conversationModel.findById(conversationId);
      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }

      conversation.messages.push({ senderId, text, timestamp: new Date(), isRead: false });
      conversation.lastUpdated = new Date();

      await conversation.save();
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  
}

export default new ConversationsController();
