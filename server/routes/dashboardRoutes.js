 const express = require('express');
    const { getDashboardOverview } = require('../controllers/dashboardController');
    const { protect } = require('../middleware/auth');
    const router = express.Router();

    router.use(protect); 

    router.route('/')
      .get(getDashboardOverview);

  

    module.exports = router;