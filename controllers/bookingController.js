const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const Booking = require('../models/bookingModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1. Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // create the booking and set paid to false
  const booking = await Booking.create({
    tour: tour.id,
    user: req.user.id,
    price: tour.price,
  });

  // attach the booking to a paystack session for tracking
  const { data } = await paystack.transaction.initialize({
    amount: tour.price,
    reference: booking.id,
    email: req.user.email,
  });

  // send checkout URL to client
  res.json({ session: data.authorization_url });
});

exports.confirmPayment = catchAsync(async (req, res) => {
  // retrieve payment session from paystack
  const session = await paystack.transaction.verify(req.query.trxref);

  // only update if paystack confirms payment
  if (session.data.status === 'success') {
    // update booking to paid and move on
    booking = await Booking.findById(req.query.trxref);
    booking.paid = true;
    await booking.save();
  }

  // redirect back to your own frontend
  res.redirect('http://127.0.0.1:3000/');
});
