const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name must be provided'],
      minLength: 3,
      maxLength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email must be provided'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'lead-guide', 'guide'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please choose the password'],
      minLength: 8,
      maxLength: 20,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        //this only works on .CREATE and .SAVE!!!
        validator: function (val) {
          return this.password === val;
        },
        message: 'passwords are not the same',
      },
    },
    tempbase32: String,
    base32: String,
    auth_url: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    accountActivationToken: String,
    accountActivationExpires: Date,
    twofa: {
      type: Boolean,
      default: false,
      select: true,
    },
    active: {
      type: Boolean,
      default: false,
      select: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Filters out Inactive users
// userSchema.pre(/^find/, function (next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });

// Password Incryption
userSchema.pre('save', async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the passwrod with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // delete password Confirm field
  this.passwordConfirm = undefined;

  next();
});

// Comparing passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Account activation Token
userSchema.methods.createActivationToken = function () {
  const activationToken = crypto.randomBytes(32).toString('hex');
  this.accountActivationToken = crypto
    .createHash('sha256')
    .update(activationToken)
    .digest('hex');
  this.accountActivationExpires = Date.now() + 7 * 60 * 60 * 1000;
  return activationToken;
};

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// eslint-disable-next-line new-cap
const User = new mongoose.model('User', userSchema);

module.exports = User;
