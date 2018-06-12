const mongoose = require('mongoose'),
  passportLocalMongoose = require('passport-local-mongoose');
const UserSchema = new mongoose.Schema({
  username: String,
  passowrd: String,
});
UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', UserSchema);

User.findOrCreate = function(info) {
  console.log(info);
  User.findOne({ username: info.twitterId }, (err, user) => {
    if (err) return console.error(err);
    if (!user) {
      user = new User({
        username: user.twitterId,
      });
      user.save((err) => {
        if (err) console.error(err);
        else return user;
      });
    } else {
      return user;
    }
  });
};

module.exports = User;
