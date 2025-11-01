const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a project name'], unique: true },
  description: { type: String },
  projectManager: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  teamMembers: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'], default: 'Not Started' },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


ProjectSchema.pre('remove', async function (next) {
  console.log(`Tasks being removed from project ${this._id}`);
  await this.model('Task').deleteMany({ project: this._id });
  next();
});


ProjectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  justOne: false,
});

module.exports = mongoose.model('Project', ProjectSchema);