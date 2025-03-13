import { Request, Response } from "express";
import { conversationModel, IConversation } from "../models/conversations_model";
import BaseController, { authenticatedRequest } from "./base_controller";
import { userModel } from "../models/users_model"; // Ensure User model is imported

class ConversationsController extends BaseController<IConversation> {
  constructor() {
    super(conversationModel);
  }

  // Create a new conversation
  async create(req: authenticatedRequest, res: Response): Promise<void> {
    try {
      const currUserId = req.params.userId
      const { recipientId } = req.body;

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

  async getAll(req: authenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const conversations = await conversationModel
        .find({ participants: userId })
        .populate({
          path: "participants",
          select: "userName profile_picture_uri",
        })
        .sort({ lastUpdated: -1 });

      // Format response: include only latest message
      const formattedConversations = conversations.map((conversation) => ({
        _id: conversation._id,
        participants: conversation.participants,
        lastMessage: conversation.messages.length
          ? conversation.messages[conversation.messages.length - 1]
          : null,
        lastUpdated: conversation.lastUpdated,
      }));

      res.status(200).json(formattedConversations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get a specific conversation by ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const conversation = await conversationModel
        .findById(req.params.id)
        .populate({
          path: "participants",
          select: "userName profile_picture_uri",
        });

      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }

      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ error: error.message });
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
  // DELETE: Remove a conversation by ID
  async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const { id: conversationId } = req.params;
      
      const deletedConversation = await conversationModel.findByIdAndDelete(conversationId);

      if (!deletedConversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }

      res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }  
}

export default new ConversationsController();
