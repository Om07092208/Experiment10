const User = require("../models/userModel");
const bcrypt = require("bcrypt");

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({ msg: "Username and password are required.", status: false });
    }

    const cleanUsername = username.trim();
    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      return res.json({ msg: "Incorrect username or password.", status: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ msg: "Incorrect username or password.", status: false });
    }

    const userObj = user.toObject();
    delete userObj.password;
    return res.json({ status: true, user: userObj });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.json({ msg: "All fields are required.", status: false });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    const usernameCheck = await User.findOne({ username: cleanUsername });
    if (usernameCheck) {
      return res.json({ msg: "Username is already taken.", status: false });
    }

    const emailCheck = await User.findOne({ email: cleanEmail });
    if (emailCheck) {
      return res.json({ msg: "Email is already registered.", status: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: cleanEmail,
      username: cleanUsername,
      password: hashedPassword,
    });

    const userObj = user.toObject();
    delete userObj.password;
    return res.json({ status: true, user: userObj });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.params.id;
    const users = await User.find({ _id: { $ne: currentUserId } }).select([
      "email",
      "username",
      "avatarImage",
      "isAvatarImageSet",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;

    if (!avatarImage) {
      return res.status(400).json({ msg: "Avatar image data is required.", isSet: false });
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );

    if (!userData) {
      return res.status(404).json({ msg: "User not found.", isSet: false });
    }

    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ msg: "User ID is required." });
    }
    if (global.onlineUsers) {
      global.onlineUsers.delete(req.params.id);
    }
    return res.status(200).json({ msg: "Logged out successfully" });
  } catch (ex) {
    next(ex);
  }
};
