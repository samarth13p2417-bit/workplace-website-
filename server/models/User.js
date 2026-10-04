import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    role: {
      type: String,
      default: 'Member',
    },
    workTypeTitle: {
      type: String,
      default: 'Software Development',
    },
    avatar: {
      type: String,
      default: null,
    },
    initials: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      default: 'email',
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
