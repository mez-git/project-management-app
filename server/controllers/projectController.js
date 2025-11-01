const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User'); // To add/remove team members
const ActivityLog = require('../models/ActivityLog'); // For bonus
const ErrorResponse = require('../utils/errorResponse');


exports.getProjects = async (req, res, next) => {
  try {
    let query;

  
    if (req.user.role === 'Team Member') {
      query = Project.find({ 'teamMembers': req.user.id }).populate('projectManager', 'name email');
    }

    else if (req.user.role === 'Project Manager') {
      query = Project.find({
        $or: [
          { projectManager: req.user.id },
          { teamMembers: req.user.id }
        ]
      }).populate('projectManager', 'name email');
    }

    else {
      query = Project.find().populate('projectManager', 'name email');
    }

    const projects = await query.populate('teamMembers', 'name email');

    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    next(err);
  }
};


exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('projectManager', 'name email')
      .populate('teamMembers', 'name email');

    if (!project) {
      return next(new ErrorResponse(`No project with the id of ${req.params.id}`, 404));
    }

 
    const isAssigned = project.teamMembers.some(member => member._id.toString() === req.user.id.toString());
    const isManager = project.projectManager._id.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isAssigned && !isManager && !isAdmin) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to view project ${req.params.id}`, 403));
    }

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

exports.createProject = async (req, res, next) => {
  try {

    if (req.user.role === 'Admin') {
      if (!req.body.projectManager) {
        return next(new ErrorResponse('Admin must specify a project manager.', 400));
      }

      const manager = await User.findById(req.body.projectManager);
      if (!manager || manager.role !== 'Project Manager') {
        return next(new ErrorResponse('Invalid Project Manager selected.', 400));
      }
    } else {
   
      req.body.projectManager = req.user.id;
    }

    const project = await Project.create(req.body);

    await ActivityLog.create({
      project: project._id,
      user: req.user.id,
      action: 'Project Created',
      details: `Project "${project.name}" was created.`
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};



exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse(`No project with the id of ${req.params.id}`, 404));
    }

    if (project.projectManager.toString() !== req.user.id && req.user.role !== 'Admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to update project ${req.params.id}`, 403));
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await ActivityLog.create({
      project: project._id,
      user: req.user.id,
      action: 'Project Updated',
      details: `Project "${project.name}" details updated.`
    });

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};


exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse(`No project with the id of ${req.params.id}`, 404));
    }

    if (project.projectManager.toString() !== req.user.id && req.user.role !== 'Admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete project ${req.params.id}`, 403));
    }

    await project.remove(); 

    await ActivityLog.create({
      project: project._id, 
      user: req.user.id,
      action: 'Project Deleted',
      details: `Project "${project.name}" and all its tasks were deleted.`
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};


exports.addTeamMember = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    const { userId } = req.body;

    if (!project) {
      return next(new ErrorResponse(`No project with the id of ${req.params.id}`, 404));
    }

    if (project.projectManager.toString() !== req.user.id && req.user.role !== 'Admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to modify project ${req.params.id}`, 403));
    }

   
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return next(new ErrorResponse(`User with id ${userId} not found`, 404));
    }

   
    if (project.teamMembers.includes(userId)) {
      return next(new ErrorResponse(`User ${userToAdd.name} is already a member of this project`, 400));
    }

    project.teamMembers.push(userId);
    await project.save();

    await ActivityLog.create({
      project: project._id,
      user: req.user.id,
      action: 'Team Member Added',
      details: `${userToAdd.name} was added to project "${project.name}".`
    });

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};


exports.removeTeamMember = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    const { userId } = req.body;

    if (!project) {
      return next(new ErrorResponse(`No project with the id of ${req.params.id}`, 404));
    }

    if (project.projectManager.toString() !== req.user.id && req.user.role !== 'Admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to modify project ${req.params.id}`, 403));
    }

   
    if (!project.teamMembers.includes(userId)) {
      return next(new ErrorResponse(`User with id ${userId} is not a member of this project`, 400));
    }

    await Task.updateMany(
      { project: project._id, assignedTo: userId },
      { $set: { assignedTo: null } } 
    );

    project.teamMembers = project.teamMembers.filter(memberId => memberId.toString() !== userId);
    await project.save();

    const removedUser = await User.findById(userId);
    await ActivityLog.create({
      project: project._id,
      user: req.user.id,
      action: 'Team Member Removed',
      details: `${removedUser ? removedUser.name : 'A user'} was removed from project "${project.name}".`
    });

    res.status(200).json({ success: true, data: project });
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