const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog'); // For bonus
const ErrorResponse = require('../utils/errorResponse');


exports.getProjectTasks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return next(new ErrorResponse(`No project with the id of ${req.params.projectId}`, 404));
    }

 
    const isAssigned = project.teamMembers.some(member => member._id.toString() === req.user.id.toString());
    const isManager = project.projectManager.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isAssigned && !isManager && !isAdmin) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to view tasks for project ${req.params.projectId}`, 403));
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

    if (!task) {
      return next(new ErrorResponse(`No task with the id of ${req.params.id}`, 404));
    }

    const project = task.project;

    const isAssigned = project.teamMembers.some(
      member => member._id.toString() === req.user.id.toString()
    );
    const isManager = project.projectManager._id.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'Admin';
    const isAssignedToUser =
      task.assignedTo && task.assignedTo._id.toString() === req.user.id.toString();

    if (!isAssigned && !isManager && !isAdmin && !isAssignedToUser) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view task ${req.params.id}`,
          403
        )
      );
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

    if (!project) {
      return next(new ErrorResponse(`No project with the id of ${req.params.projectId}`, 404));
    }

  
    if (project.projectManager.toString() !== req.user.id && req.user.role !== 'Admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to add tasks to project ${req.params.projectId}`, 403));
    }


    if (req.body.assignedTo) {
      const assignedUser = await User.findById(req.body.assignedTo);
      if (!assignedUser) {
        return next(new ErrorResponse(`Assigned user with id ${req.body.assignedTo} not found`, 404));
      }
      if (!project.teamMembers.includes(req.body.assignedTo)) {
        return next(new ErrorResponse(`User ${assignedUser.name} is not a member of project "${project.name}" and cannot be assigned tasks in it.`, 400));
      }
    }

    const task = await Task.create(req.body);

    await ActivityLog.create({
      project: project._id,
      user: req.user.id,
      action: 'Task Created',
      details: `Task "${task.title}" was created and assigned to ${task.assignedTo ? (await User.findById(task.assignedTo)).name : 'Unassigned'}.`
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);}
    };

  
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id).populate('project', 'projectManager teamMembers');

    if (!task) {
      return next(new ErrorResponse(`No task with the id of ${req.params.id}`, 404));
    }

    const project = task.project;

    const isManager = project.projectManager.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'Admin';
    const isAssignedToUser = task.assignedTo && task.assignedTo.toString() === req.user.id.toString();

    if (!isManager && !isAdmin && !isAssignedToUser) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to update task ${req.params.id}`, 403));
    }

 
    if (req.user.role === 'Team Member' && !isAdmin && !isManager) {
      const allowedUpdates = ['status', 'description'];
      const filteredBody = {};

      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) filteredBody[key] = req.body[key];
      });

      req.body = filteredBody; 
    }

  
    if (req.body.assignedTo && (isManager || isAdmin)) {
      const assignedUser = await User.findById(req.body.assignedTo);
      if (!assignedUser) {
        return next(new ErrorResponse(`Assigned user with id ${req.body.assignedTo} not found`, 404));
      }
      if (!project.teamMembers.includes(req.body.assignedTo)) {
        return next(new ErrorResponse(`User ${assignedUser.name} is not a member of project "${project.name}" and cannot be assigned tasks in it.`, 400));
      }
    }

    const oldTaskStatus = task.status;
    const oldAssignedTo = task.assignedTo ? (await User.findById(task.assignedTo))?.name : 'Unassigned';

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email');

   
    let details = `Task "${task.title}" updated.`;
    if (req.body.status && req.body.status !== oldTaskStatus) {
      details += ` Status changed from ${oldTaskStatus} to ${task.status}.`;
    }
    if (req.body.assignedTo && task.assignedTo?.name !== oldAssignedTo) {
      details += ` Assigned from ${oldAssignedTo} to ${task.assignedTo?.name || 'Unassigned'}.`;
    }
    if (req.body.priority) {
      details += ` Priority set to ${task.priority}.`;
    }
    if (req.body.dueDate) {
      details += ` Due date set to ${new Date(task.dueDate).toLocaleDateString()}.`;
    }

    await ActivityLog.create({
      project: project._id,
      user: req.user.id,
      action: 'Task Updated',
      details: details
    });

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};


  
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'projectManager');

    if (!task) {
      return next(new ErrorResponse(`No task with the id of ${req.params.id}`, 404));
    }

    const isManager = task.project.projectManager.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isManager && !isAdmin) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete task ${req.params.id}`, 403));
    }


    await Task.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      project: task.project._id,
      user: req.user.id,
      action: 'Task Deleted',
      details: `Task "${task.title}" was deleted.`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
