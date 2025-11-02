const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const ErrorResponse = require('../utils/errorResponse');

exports.getDashboardOverview = async (req, res, next) => {
  try {
    const { id: userId, role: userRole, name, email } = req.user;

    let projects = [];
    let tasks = [];
    let recentActivities = [];

  
    if (userRole === 'Admin') {
     
      projects = await Project.find()
        .populate('projectManager', 'name')
        .populate('teamMembers', 'name');

      tasks = await Task.find().populate('project', 'name');
      recentActivities = await ActivityLog.find()
        .populate('user', 'name')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(10);
    } 
    
    else if (userRole === 'Project Manager') {
   
      projects = await Project.find({
        $or: [
          { projectManager: userId },
          { teamMembers: userId }
        ]
      })
        .populate('projectManager', 'name')
        .populate('teamMembers', 'name');

      const projectIds = projects.map(p => p._id);
      tasks = await Task.find({ project: { $in: projectIds } }).populate('project', 'name');

      recentActivities = await ActivityLog.find({ project: { $in: projectIds } })
        .populate('user', 'name')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(10);
    } 
    
    else {
  
      projects = await Project.find({ teamMembers: userId })
        .populate('projectManager', 'name')
        .populate('teamMembers', 'name');

      tasks = await Task.find({ assignedTo: userId }).populate('project', 'name');

      const projectIds = projects.map(p => p._id);
      recentActivities = await ActivityLog.find({ project: { $in: projectIds }, user: userId })
        .populate('user', 'name')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(10);
    }


    const projectCount = projects.length;
    const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;

    res.status(200).json({
      success: true,
      data: {
        user: { id: userId, name, email, role: userRole },
        projectCount,
        pendingTasks,
        completedTasks,
        projectsSummary: projects.map(p => ({
          id: p._id,
          name: p.name,
          status: p.status
        })),
        tasksSummary: tasks.map(t => ({
          id: t._id,
          title: t.title,
          status: t.status,
          projectName: t.project?.name
        })),
        recentActivities
      }
    });
  } catch (err) {
    next(err);
  }
};
exports.getProjectActivityLogs = async (req, res, next) => {
        try {
            const project = await Project.findById(req.params.projectId);

            if (!project) {
                return next(new ErrorResponse(`No project with the id of ${req.params.projectId}`, 404));
            }

      
            const isAssigned = project.teamMembers.some(member => member._id.toString() === req.user.id.toString());
            const isManager = project.projectManager.toString() === req.user.id.toString();
            const isAdmin = req.user.role === 'Admin';

            if (!isAssigned && !isManager && !isAdmin) {
                return next(new ErrorResponse(`User ${req.user.id} is not authorized to view activity logs for project ${req.params.projectId}`, 403));
            }

            const activities = await ActivityLog.find({ project: req.params.projectId })
                                                .populate('user', 'name email')
                                                .sort({ createdAt: -1 });

            res.status(200).json({ success: true, count: activities.length, data: activities });
        } catch (err) {
            next(err);
        }
    };
    