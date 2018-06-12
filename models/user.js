const mongoose = require('mongoose'),
  passportLocalMongoose = require('passport-local-mongoose');
const UserSchema = new mongoose.Schema({
  username: String,
  passowrd: String,
});
UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', UserSchema);

User.findOrCreate = function(info, cb) {
  console.log(info);
  User.findOne({ username: info.twitterId }, (err, user) => {
    if (err) return cb(err, null);
    if (!user) {
      user = new User({
        username: info.twitterId,
      });
      user.save((err) => {
        if (err) console.error(err);
        else cb(null, user);
      });
    } else {
	console.log(user)
      return cb(null, user);
    }
  });
};

module.exports = User;
