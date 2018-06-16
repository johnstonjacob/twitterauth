const mongoose = require('mongoose')
const  passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  passowrd: String,
});
UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', UserSchema);

User.findOrCreate = function findCreate(info, cb) {
  User.findOne({ username: info.twitterId }, (err, user) => {
    if (err) return cb(err, null);
    if (!user) {
     const newUser = new User({
        username: info.twitterId,
      });
     return user.save((error) => {
        if (err) return cb(error, null) 
        return cb(null, newUser);
      });
    } 
      return cb(null, user);
    
  });
};

module.exports = User;
