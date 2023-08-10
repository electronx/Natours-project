const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token?', authController.resetPassword);
router.get('/activate/:token?', authController.activate, authController.logout);
router.post('/verify', authController.verify);
router.post('/qrEnable', authController.protect, authController.qrEnable);
router.post('/qrEmail', authController.isReadyForQr, authController.qrEmail);

// protects all the routes that come after this MIDDLEWARE
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

// restrict all the actions to Admin after this MIDDLEWARE
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.postUsers);
router
  .route('/:id?')
  .patch(userController.patchUser)
  .delete(userController.deleteUser)
  .get(userController.getUser);

module.exports = router;
