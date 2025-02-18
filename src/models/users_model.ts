import mongoose from "mongoose";

export interface IUser {
  _id?: string;
  userName: string;
  password: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone_number?: string | null;
  date_of_birth?: Date | null;
  gender?: string | null;
  refreshToken?: string[];
}

const userSchema = new mongoose.Schema<IUser>({
  userName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    default: null,
  },
  phone_number: {
    type: String,
    default: null,
  },
  date_of_birth: {
    type: Date,
    default: null,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', null], // Restrict to valid gender values
    default: null,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure that emails are unique
    trim: true,
  },
  refreshToken: {
    type: [String],
    default: [],
  }
});

export const userModel = mongoose.model<IUser>("Users", userSchema);