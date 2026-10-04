import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'Member', 'Viewer'],
    default: 'Member',
  },
  initials: {
    type: String,
    default: '',
  },
  avatarColor: {
    type: String,
    default: '#0052CC',
  },
  status: {
    type: String,
    enum: ['Active', 'Invited'],
    default: 'Active',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const workspaceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
    },
    key: {
      type: String,
      required: [true, 'Workspace key is required'],
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Software',
    },
    type: {
      type: String,
      default: 'Team-managed',
    },
    description: {
      type: String,
      default: '',
    },
    plan: {
      type: String,
      default: 'Standard',
    },
    ownerId: {
      type: String,
      required: true,
    },
    members: [memberSchema],
  },
  {
    timestamps: true,
  }
);

const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;
