import mongoose from "mongoose";

export interface IMessage {
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

export interface IConversation {
  participants: string[];
  messages: IMessage[];
  lastUpdated: Date;
}

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  messages: [messageSchema],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

export const conversationModel = mongoose.model<IConversation>(
  "Conversations",
  conversationSchema
);
