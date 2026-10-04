import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    workspaceId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'kanban',
    },
    filter: {
      type: String,
      default: 'all',
    },
  },
  {
    timestamps: true,
  }
);

const Board = mongoose.model('Board', boardSchema);
export default Board;
