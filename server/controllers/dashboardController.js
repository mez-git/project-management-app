 const Project = require('../models/Project');
 const ActivityLog = require('../models/ActivityLog'); 
    const Task = require('../models/Task');
    const User = require('../models/User');
    const ErrorResponse = require('../utils/errorResponse');

 
    exports.getDashboardOverview = async (req, res, next) => {
      try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let projects = [];
        let tasks = [];
        let projectCount = 0;
        let pendingTasks = 0;
        let completedTasks = 0;

        if (userRole === 'Admin') {
     
          projects = await Project.find().populate('projectManager', 'name').populate('teamMembers', 'name');
          tasks = await Task.find();
        } else if (userRole === 'Project Manager') {
        
          projects = await Project.find({
            $or: [
              { projectManager: userId },
              { teamMembers: userId }
            ]
          }).populate('projectManager', 'name').populate('teamMembers', 'name');
     
          const projectIds = projects.map(p => p._id);
          tasks = await Task.find({ project: { $in: projectIds } });
        } else { 
          projects = await Project.find({ teamMembers: userId }).populate('projectManager', 'name').populate('teamMembers', 'name');
       
          tasks = await Task.find({ assignedTo: userId });
        }

        projectCount = projects.length;
        pendingTasks = tasks.filter(task => task.status !== 'Done').length;
        completedTasks = tasks.filter(task => task.status === 'Done').length;

    
        let recentActivities = [];
        if (userRole === 'Admin' || userRole === 'Project Manager') {
            const projectIds = projects.map(p => p._id);
            recentActivities = await ActivityLog.find({ project: { $in: projectIds } })
                                                .populate('user', 'name')
                                                .sort({ createdAt: -1 })
                                                .limit(5);
        } else {
            const projectIds = projects.map(p => p._id);
            recentActivities = await ActivityLog.find({ project: { $in: projectIds } })
                                                .populate('user', 'name')
                                                .sort({ createdAt: -1 })
                                                .limit(5);
        }


        res.status(200).json({
          success: true,
          data: {
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            },
            projectCount,
            pendingTasks,
            completedTasks,
            recentActivities, 
             projectsSummary: projects.map(p => ({ id: p._id, name: p.name, status: p.status })),
             tasksSummary: tasks.map(t => ({ id: t._id, title: t.title, status: t.status }))
          },
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
    