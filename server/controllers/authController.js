const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');


exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    const user = await User.create({ name, email, password, role });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};


exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  try {
 
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

 
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};


exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};


const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

 
  const cookieExpireTime = 24 * 60 * 60 * 1000; 

  const options = {
    expires: new Date(Date.now() + cookieExpireTime),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};
