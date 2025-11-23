import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

let User: Model<IUser>;

if (mongoose.models.User) {
  User = mongoose.models.User as Model<IUser>;
} else {
  const UserSchema = new mongoose.Schema<IUser>({
    firstName: {
      type: String,
      required: function(this: IUser) {
        return !this.googleId;
      },
    },
    lastName: {
      type: String,
      required: function(this: IUser) {
        return !this.googleId;
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function(this: IUser) {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  UserSchema.methods.comparePassword = async function(
    this: IUser,
    candidatePassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password || "");
  };

  User = mongoose.model<IUser>("User", UserSchema);
}

export default User;