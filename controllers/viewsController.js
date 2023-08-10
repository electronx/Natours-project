const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      'Your booking was succesful! Please check your email for a confirmation ';
  next();
};

exports.getOverview = async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) BUild template

  // 3) render that tempalte using tour data from step 1

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
};

exports.getTour = async (req, res, next) => {
  // 1) get the date, fro the requested tour (including reviews and the tour guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 400));
  }

  // 2) build template

  // 3) render tempalte using data from step 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
};

exports.getLogin = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getQrcode = (req, res) => {
  res.status(200).render('loginQrCode', {
    title: 'scan the code',
  });
};

exports.getSignup = (req, res) => {
  res.status(200).render('signup', {
    title: 'Please sign up',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Profile page',
  });
};

exports.getTwofa = (req, res) => {
  res.status(200).render('twofa', {
    title: 'Two factor authenthication',
  });
};

exports.getMyTours = async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'MyTours',
    tours,
  });

  // 2 Find tours with returned IDs
};
