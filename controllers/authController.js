/* eslint-disable arrow-body-style */
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// Verify if token for QR that comes from Authenthicator is correct -- utility function
const verify = (user, base, qrtoken) => {
  // check if user has already activated the QR
  if (base === 'base32')
    return speakeasy.totp.verify({
      secret: user.base32,
      encoding: 'base32',
      token: qrtoken,
    });
  return speakeasy.totp.verify({
    secret: user.tempbase32,
    encoding: 'base32',
    token: qrtoken,
  });
};

// Create the token to log in the user
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Sign the token, put it in the cookie and send it -- utility function
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  // create user in database, but it is inactive by default
  const newUser = await User.create(req.body);

  // Generate random activation Token,
  const activationToken = newUser.createActivationToken();
  await newUser.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/activate/${activationToken}`;

    // Send activation link using random Token
    await new Email(newUser, resetURL).sendActivationLink();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    return next(
      new AppError('There was an error sending the email, Try again later')
    );
  }
};

exports.activate = async (req, res, next) => {
  // 1) get user based on the token (we have token in params because token is in activation link)
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    accountActivationToken: hashedToken,
    accountActivationExpires: { $gt: Date.now() },
  });

  // 2) if token has not expired, and there is user activate the account
  if (!user) {
    return next(
      new AppError('Activation Token is invalid or has expired', 400)
    );
  }
  user.active = true;
  user.accountActivationToken = undefined;
  user.accountActivationExpires = undefined;
  await user.save({ validateBeforeSave: false });
  // 3) Update changedPasswordAt property for the user

  // 4) redirect user to the login page and send the welcome email
  const loginUrl = `${req.protocol}://${req.get('host')}/login`;

  await new Email(user, loginUrl).sendWeclome();

  // Generate QR COODE and save temporary Secret in User -- user must scan it later and enter the code to activate QR and generate real Secret
  if (!user.base32) {
    const secret = speakeasy.generateSecret({
      name: `Natours: ${user.email}`,
    });
    user.tempbase32 = secret.base32;
    qrcode.toDataURL(secret.otpauth_url, async (err, data) => {
      user.auth_url = data;
      console.log(data);
      await user.save({ validateBeforeSave: false });
    });
  }

  res.redirect(loginUrl);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('please provide email and password!', 400));
  }
  // 2) check if the user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }
  // 3) check if user is active or not
  if (!user.active)
    return next(
      new AppError('Please check your email to activate the account', 400)
    );

  // 4) check if user has two factor authenthication enabled or not. If not generate and send token to log the user in.
  if (!user.twofa) return createSendToken(user, 205, req, res);

  // 5) if two factor is enabled include users email in cookie (used in next function) and send response 200
  res.cookie('email', email);

  res.status(200).json({
    status: 'success',
  });
};

// Check whether user has entered correct email and password and whether user has two factor enabled (existing email in cookie means yes to all)
exports.isReadyForQr = async (req, res, next) => {
  // if there is no email, there is no user, login is required
  if (!req.cookies.email) return res.redirect('/login');

  // if there is user add it to res.locals so it can be used in views/pugs to display QR generated during signup
  const user = await User.findOne({ email: req.cookies.email });
  res.locals.userForQr = user;

  next();
};

// enable and disable two factor authenthication
exports.qrEnable = async (req, res, next) => {
  // get token and mode(enable or disable) from request coming from front
  const { mode, qrtoken } = req.body;

  const user = await User.findById(req.user.id);

  // if user is requesting disable, we verify that token is correct and turn of twofa
  if (mode === 'disable') {
    if (verify(user, 'base32', qrtoken)) {
      user.twofa = false;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({
        status: 'success',
        message: 'disabled',
      });
    }
    return next(
      new AppError('Verify code is not correct, could not disable TWO FA!', 401)
    );
  }

  // In this case mode is enable and if there is no base32 it means that QR has not been activated yet
  // verify code, and move temporary secret generated during signup to permanent secret (used only first time activating QR) and enable two factor authenthication
  if (!user.base32) {
    if (verify(user, 'tempbase32', qrtoken)) {
      user.base32 = user.tempbase32;
      user.twofa = true;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({
        status: 'success',
        message: 'activated',
      });
    }
    return next(
      new AppError(
        'Verify code is not correct, could not activate TWO FA!',
        401
      )
    );
  }

  // verify code, if it is correct then enable two factor authenthication
  if (user.base32) {
    if (verify(user, 'base32', qrtoken)) {
      user.twofa = true;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({
        status: 'success',
        message: 'enabled',
      });
    }
    return next(
      new AppError('Verify code is not correct, could not enable TWO FA!', 401)
    );
  }
};

// if twofa is enabled, we check if token authenthicator is correct
exports.verify = async (req, res, next) => {
  // get token from request from Front (entered by user) and find user based on email in cookie that we put after user enters correct email/password
  const { qrtoken } = req.body;
  const user = await User.findOne({ email: req.cookies.email });

  // check whether token is correct, if not send error if yes then login the user
  if (!verify(user, 'base32', qrtoken))
    next(new AppError('Verify token not right', 400));

  createSendToken(user, 200, req, res);
};

exports.qrEmail = async (req, res, next) => {
  const user = await User.findOne({ email: req.cookies.email });
  const imgUrl = user.auth_url;
  const loginUrl = `${req.protocol}://${req.get('host')}/login`;

  await new Email(user, loginUrl, imgUrl).sendQr();
  return res.status(200).json({
    status: 'success',
  });
};

//logout, remove jwt and email from cookies
exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.cookie('email', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

exports.protect = async (req, res, next) => {
  // 1) getting token and check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token && !(process.env.NODE_ENV === 'production'))
    return next(
      new AppError('You are not logged in, please log in to get access', 401)
    );
  // // 2) validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError('The user does not exist anymore', 401));

  // 4) check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(new AppError('User recently changed the password', 401));

  // GRANT ACESS TO PROTECTED ROUTE
  req.user = currentUser;
  // Gives all templates/pugs access to currentUser
  res.locals.user = currentUser;
  next();
};

// Only for render pages, there will be no errors!
exports.isLoggedIn = async (req, res, next) => {
  // 1) getting token and check if it is there

  if (req.cookies.jwt) {
    try {
      const token = req.cookies.jwt;

      // // 2) validate token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      // 3) check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      // 4) check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      // There is a logged in user

      res.locals.user = currentUser;
      return next();
    } catch (err) {}
  }
  next();
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perfrom this action', 403)
      );

    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with email address', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) send it to user's email

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.PasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email, Try again later')
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changedPasswordAt property for the user

  // 4) log the user in, send JWT
  createSendToken(user, 200, req, res);
};

exports.updatePassword = async (req, res, next) => {
  // 1) Get usr from the collection
  const { password, newPassword, passwordConfirm } = await req.body;

  const user = await User.findById(req.user.id).select('+password');
  // 2) check if POSTed password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Old password is not correct', 401));
  }

  if (passwordConfirm !== newPassword) {
    return next(
      new AppError('Confirmed password does not match the new password', 401)
    );
  }

  if (password === newPassword)
    return next(
      new AppError('New password must be different from the old password', 401)
    );

  // 3) if so, update the passwrd
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPassword;

  await user.save();
  // 4) log user in, send JWT
  createSendToken(user, 200, req, res);
};
