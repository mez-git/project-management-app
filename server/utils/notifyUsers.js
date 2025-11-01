const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (userId, message, projectId, taskId, type) => {
  await Notification.create({
    user: userId,
    message,
    project: projectId,
    task: taskId,
    type
  });
};

exports.createTaskNotifications = async (task, project, action, details) => {
  try {
    const admins = await User.find({ role: 'Admin' });
    const manager = await User.findById(project.projectManager);
    const assignedUser = task.assignedTo ? await User.findById(task.assignedTo) : null;

    const message = `Task "${task.title}" (${action}): ${details}`;

    // 🔹 Admins – all notifications
    for (const admin of admins) {
      await createNotification(admin._id, message, project._id, task._id, action);
    }

    // 🔹 Project Manager – for tasks in their project
    if (manager) {
      await createNotification(manager._id, message, project._id, task._id, action);
    }

    // 🔹 Assigned Team Member – for their task
    if (assignedUser) {
      await createNotification(assignedUser._id, message, project._id, task._id, action);
    }

    console.log(`🔔 Notifications created for task "${task.title}" (${action})`);
  } catch (err) {
    console.error('❌ Error creating notifications:', err.message);
  }
};
