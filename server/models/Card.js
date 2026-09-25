import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  done: { type: Boolean, default: false },
});

const commentSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  author: { type: String, required: true },
  initials: { type: String, default: '' },
  time: { type: String, default: 'Just now' },
  text: { type: String, required: true },
});

const userRefSchema = new mongoose.Schema({
  name: { type: String },
  initials: { type: String },
  email: { type: String },
}, { _id: false });

const cardSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    listId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'To Do',
    },
    iconType: {
      type: String,
      default: 'check',
    },
    dueDate: {
      type: String,
      default: '',
    },
    startDate: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Urgent', 'Highest', 'High', 'Medium', 'Low', 'Lowest', 'None'],
      default: 'Medium',
    },
    parent: {
      type: String,
      default: '',
    },
    team: {
      type: String,
      default: '',
    },
    labels: {
      type: [String],
      default: [],
    },
    assignedTo: {
      type: userRefSchema,
      default: null,
    },
    reporter: {
      type: userRefSchema,
      default: null,
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
    attachments: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    watchers: {
      type: Number,
      default: 1,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance profiling & search engine
cardSchema.index({ key: 1 });
cardSchema.index({ listId: 1, order: 1 });
cardSchema.index({ status: 1 });
cardSchema.index({ 'assignedTo.name': 1 });
cardSchema.index({ priority: 1 });
cardSchema.index({ title: 'text', description: 'text' });

const Card = mongoose.model('Card', cardSchema);
export default Card;
