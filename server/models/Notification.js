const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  project: { type: mongoose.Schema.ObjectId, ref: 'Project' },
  task: { type: mongoose.Schema.ObjectId, ref: 'Task' },
  type: { 
    type: String, 
    enum: ['Task Created', 'Task Updated', 'Task Deleted'], 
    default: 'Task Updated' 
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
