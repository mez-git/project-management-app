const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');

router.get('/test-email', async (req, res) => {
  try {
    await sendEmail({
      to: 'yourpersonalemail@gmail.com', // use any recipient email
      subject: '✅ Gmail Nodemailer Test',
      html: '<h2>Success!</h2><p>Your Gmail + App Password setup works 🎉</p>',
    });

    res.send('Email sent successfully ✅');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err.message);
  }
});

module.exports = router;
