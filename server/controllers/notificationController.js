const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

exports.getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('project', 'name')
      .populate('task', 'title');

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    next(new ErrorResponse('Failed to fetch notifications', 500));
  }
};


exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new ErrorResponse('Notification not found', 404));
    }

    if (notification.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(new ErrorResponse('Failed to mark notification as read', 500));
  }
};


exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(new ErrorResponse('Failed to mark all as read', 500));
  }
};
