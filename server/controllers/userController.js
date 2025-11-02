const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');


exports.getUsers = async (req, res, next) => {
  try {
  
    const roleFilter = req.query.role ? { role: req.query.role } : {};
 console.log('Role filter:', roleFilter); 
    const users = await User.find(roleFilter)
        .select('name email role createdAt')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};


exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`No user with the id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    
    if (req.body.role === 'Admin') {
      const existingAdmin = await User.findOne({ role: 'Admin' });
      if (existingAdmin) {
        return next(new ErrorResponse('Only one Admin is allowed in the system', 400));
      }
    }

    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};



exports.updateUser = async (req, res, next) => {
  try {
  
    if (req.body.password) {
      delete req.body.password;
    }

    if (req.body.role === 'Admin') {
      const existingAdmin = await User.findOne({ role: 'Admin' });
      if (existingAdmin && existingAdmin._id.toString() !== req.params.id) {
        return next(new ErrorResponse('Only one Admin is allowed in the system', 400));
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new ErrorResponse(`No user with the id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};



exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`No user with the id of ${req.params.id}`, 404));
    }

    await user.remove(); 
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};