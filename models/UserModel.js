const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({

  userType: {
    type: String, // "C" ,"F" 
    required: true,
  },
  firstName: {
    type: String,
    required: [true, 'Enter a first name.'],
  },
  lastName: {
    type: String,
    required: [true, 'Enter a last name.'],
  },
  gender: {
    type: String,
  },
  email: {
    type: String,
    unique: [true, 'That email address is taken.'],
    required: true,
    // is it email 
  },
  password: {
    type: String,
    required: [true, 'Enter a password.'],
  },
  img: {
    default: " ",
    type: String,
  },
  bio: {
    default: " ",
    type: String,
  },
  CV: { default: " ", type: String }, // creat only for Free //only sen for free 
  qualification: [{ default: " ", type: String }],
  skills: [{ default: " ", type: String }],
  rating: [{ type: Number }],
  comments: { default: [], type: Array },
  speciality: { default: " ", type: String },
  project:[{ type: mongoose.Schema.Types.ObjectId, ref: 'project'}]

}, { timestamps: true })


userSchema.statics.createSecure = (firstName, lastName, email, password, type, gender, cb) => {
  bcrypt.genSalt(function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      var user = {
        userType: type,
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        email: email,
        password: hash
      };
      User.create(user, cb);
    });
  });
};
userSchema.statics.authenticate = function (email, password, cb) {
  // find user by email entered at log in
  this.findOne({ email: email }, function (err, user) {

    // throw error if can't find user
    if (user === null) {
      cb("Can\'t find user with that email", null);

      // if found user, check if password is correct
    } else if (user.checkPassword(password)) {
      // the user is found & password is correct, so execute callback
      // pass no error, just the user to the callback
      cb(null, user);
    } else {
      // user found, but password incorrect
      cb("password incorrect", null);
    }
  });
};
// compare password user enters with hashed password (`passwordDigest`)
userSchema.methods.checkPassword = function (password) {
  // run hashing algorithm (with salt) on password to compare with stored `passwordDigest`
  // `compareSync` is like `compare` but synchronous
  // returns true or false
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('Users', userSchema)
module.exports = User