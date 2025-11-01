const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  createTask
} = require('../controllers/projectController');
const { getProjectTasks } = require('../controllers/taskController');
const { getProjectActivityLogs } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);


router.route('/:projectId/tasks').get(getProjectTasks);

router.route('/:projectId/activity-logs').get(getProjectActivityLogs);


router.route('/')
  .get(getProjects)
  .post(authorize('Admin', 'Project Manager'), createProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('Admin', 'Project Manager'), updateProject)
  .delete(authorize('Admin', 'Project Manager'), deleteProject);
router.route('/:projectId/tasks').post(authorize('Admin', 'Project Manager'),createTask);
router.route('/:id/add-member')
  .put(authorize('Admin', 'Project Manager'), addTeamMember);

router.route('/:id/remove-member')
  .put(authorize('Admin', 'Project Manager'), removeTeamMember);

module.exports = router;
