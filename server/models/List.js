import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    boardId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    cardIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const List = mongoose.model('List', listSchema);
export default List;
