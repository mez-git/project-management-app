const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Please add a task title'] },
  description: { type: String },
  project: { type: mongoose.Schema.ObjectId, ref: 'Project', required: true },
  assignedTo: { type: mongoose.Schema.ObjectId, ref: 'User' },
  status: { type: String, enum: ['To Do', 'In Progress', 'Done', 'Blocked'], default: 'To Do' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Task', TaskSchema);