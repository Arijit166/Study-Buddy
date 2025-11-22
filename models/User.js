import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

let User;

if (mongoose.models.User) {
  User = mongoose.models.User;
} else {
  const UserSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: function() { return !this.googleId; }
    },
    lastName: {
      type: String,
      required: function() { return !this.googleId; }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function() { return !this.googleId; }
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    avatar: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User = mongoose.model('User', UserSchema);
}

export default User;