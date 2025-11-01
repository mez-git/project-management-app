const express = require('express');
    const {
      getTask,
    
      updateTask,
      deleteTask,
    } = require('../controllers/taskController');
    const { protect, authorize } = require('../middleware/auth');

    const router = express.Router({ mergeParams: true }); 

    router.use(protect); 

   


    router.route('/:id').get(getTask);

   
    router.route('/:id')
      .put(updateTask) 
      .delete(authorize('Admin', 'Project Manager'), deleteTask); 

    module.exports = router;