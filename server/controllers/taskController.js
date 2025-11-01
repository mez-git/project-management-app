const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail'); 
const { createTaskNotifications } = require('../utils/notifyUsers');

const notifyUsersAboutTask = async (task, project, action, details) => {
  try {
    const manager = await User.findById(project.projectManager);
    const assignedUser = task.assignedTo ? await User.findById(task.assignedTo) : null;
    const admins = await User.find({ role: 'Admin' });

    // Collect unique recipient emails
    const recipients = new Set();
    if (manager) recipients.add(manager.email);
    if (assignedUser) recipients.add(assignedUser.email);
    admins.forEach(a => recipients.add(a.email));

    const subject = `Task Update: "${task.title}" (${action})`;
    const html = `
      <h2>📢 Task Notification</h2>
      <p><b>Project:</b> ${project.name}</p>
      <p><b>Action:</b> ${action}</p>
      <p><b>Details:</b> ${details}</p>
      <p><b>Status:</b> ${task.status}</p>
      <p><b>Priority:</b> ${task.priority}</p>
      <p><b>Assigned To:</b> ${assignedUser ? assignedUser.name : 'Unassigned'}</p>
      <p><b>Due Date:</b> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
      <hr />
      <p>This is an automated notification from <b>Project Management App</b>.</p>
    `;

    for (const email of recipients) {
      await sendEmail({ to: email, subject, html });
    }

    console.log(`📧 Notifications sent for task "${task.title}" (${action})`);
  } catch (err) {
    console.error('❌ Error sending notifications:', err.message);
  }
};


exports.getProjectTasks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return next(new ErrorResponse(`No project found with ID ${req.params.projectId}`, 404));
    }

    const isAssigned = project.teamMembers.some(member => member._id.toString() === req.user.id);
    const isManager = project.projectManager.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';

    if (!isAssigned && !isManager && !isAdmin) {
      return next(new ErrorResponse(`Not authorized to view tasks for project ${req.params.projectId}`, 403));
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};


exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate({
        path: 'project',
        select: 'name projectManager teamMembers',
        populate: [
          { path: 'projectManager', select: 'name email' },
          { path: 'teamMembers', select: 'name email' },
        ],
      });

    if (!task) return next(new ErrorResponse(`No task found with ID ${req.params.id}`, 404));

    const project = task.project;
    const isAssigned = project.teamMembers.some(m => m._id.toString() === req.user.id);
    const isManager = project.projectManager._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    const isAssignedToUser = task.assignedTo && task.assignedTo._id.toString() === req.user.id;

    if (!isAssigned && !isManager && !isAdmin && !isAssignedToUser) {
      return next(new ErrorResponse(`Not authorized to view this task`, 403));
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};


exports.createTask = async (req, res, next) => {
  req.body.project = req.params.projectId;

  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return next(new ErrorResponse(`No project found with ID ${req.params.projectId}`, 404));

    if (project.projectManager.toString() !== req.user.id && req.user.role !== 'Admin') {
      return next(new ErrorResponse(`Not authorized to add tasks to this project`, 403));
    }

    if (req.body.assignedTo) {
      const assignedUser = await User.findById(req.body.assignedTo);
      if (!assignedUser) return next(new ErrorResponse(`Assigned user not found`, 404));
      if (!project.teamMembers.includes(req.body.assignedTo)) {
        return next(new ErrorResponse(`User is not a team member of this project`, 400));
      }
    }

    const task = await Task.create(req.body);

    const details = `Task "${task.title}" created and assigned to ${task.assignedTo ? (await User.findById(task.assignedTo)).name : 'Unassigned'}.`;
    await ActivityLog.create({ project: project._id, user: req.user.id, action: 'Task Created', details });

    await notifyUsersAboutTask(task, project, 'Task Created', details);

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id).populate('project', 'projectManager teamMembers');
    if (!task) return next(new ErrorResponse(`No task found with ID ${req.params.id}`, 404));

    const project = task.project;
    const isManager = project.projectManager.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    const isAssignedToUser = task.assignedTo && task.assignedTo.toString() === req.user.id;

    if (!isManager && !isAdmin && !isAssignedToUser) {
      return next(new ErrorResponse(`Not authorized to update this task`, 403));
    }

 
    if (req.user.role === 'Team Member' && !isAdmin && !isManager) {
      const allowedUpdates = ['status', 'description'];
      const filtered = {};
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) filtered[key] = req.body[key];
      });
      req.body = filtered;
    }

    if (req.body.assignedTo && (isManager || isAdmin)) {
      const assignedUser = await User.findById(req.body.assignedTo);
      if (!assignedUser) return next(new ErrorResponse(`Assigned user not found`, 404));
      if (!project.teamMembers.includes(req.body.assignedTo)) {
        return next(new ErrorResponse(`User is not a team member of this project`, 400));
      }
    }

    const oldStatus = task.status;
    const oldAssignee = task.assignedTo ? (await User.findById(task.assignedTo))?.name : 'Unassigned';

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email');

    let details = `Task "${task.title}" updated.`;
    if (req.body.status && req.body.status !== oldStatus)
      details += ` Status changed from ${oldStatus} to ${task.status}.`;
    if (req.body.assignedTo && task.assignedTo?.name !== oldAssignee)
      details += ` Assigned from ${oldAssignee} to ${task.assignedTo?.name || 'Unassigned'}.`;
    if (req.body.priority) details += ` Priority set to ${task.priority}.`;
    if (req.body.dueDate) details += ` Due date set to ${new Date(task.dueDate).toLocaleDateString()}.`;

    await ActivityLog.create({ project: project._id, user: req.user.id, action: 'Task Updated', details });

    await notifyUsersAboutTask(task, project, 'Task Updated', details);
await createTaskNotifications(task, task.project, 'Task Deleted', details);
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'projectManager');
    if (!task) return next(new ErrorResponse(`No task found with ID ${req.params.id}`, 404));

    const isManager = task.project.projectManager.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';

    if (!isManager && !isAdmin) {
      return next(new ErrorResponse(`Not authorized to delete this task`, 403));
    }

    await Task.findByIdAndDelete(req.params.id);

    const details = `Task "${task.title}" was deleted.`;
    await ActivityLog.create({ project: task.project._id, user: req.user.id, action: 'Task Deleted', details });

    await notifyUsersAboutTask(task, task.project, 'Task Deleted', details);
await createTaskNotifications(task, task.project, 'Task Deleted', details);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
