const User = require("../models/user");
const bcrypt = require("bcrypt");
const { HttpError } = require("../helpers");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const fs = require("node:fs/promises");
const path = require("node:path");
const gravatar = require("gravatar");
const Jimp = require("jimp");

const schema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

async function register(req, res, next) {
  const { password, email, subscription } = req.body;
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw HttpError(400, errorMessages);
    }

    const user = await User.findOne({ email: email }).exec();
    if (user !== null) {
      return res.status(409).send({ message: "Email in use" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const gravatarUrl = gravatar.url(email);
    const newUser = await User.create({
      password: passwordHash,
      email,
      subscription,
      avatarURL: gravatarUrl,
    });
    res.status(201).send(
      res.status(201).send({
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
          avatarURL: newUser.avatarURL,
        },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  const { password, email, subscription } = req.body;
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw HttpError(400, errorMessages);
    }
    const user = await User.findOne({ email: email }).exec();
    if (user === null) {
      return res.status(401).send({
        message: "Email or password is wrong",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch === false) {
      return res.status(401).send({
        message: "Email or password is wrong",
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    await User.findByIdAndUpdate(user._id, { token }).exec();
    res.send({
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function currentUser(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).send({ message: "Not authorized" });
    }

    res.status(200).send({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
}

async function logoutUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, {
      token: null,
    }).exec();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function processAndSaveAvatar(imagePath, userId) {
  const outputFolder = path.join(__dirname, "..", "public/avatars");

  const image = await Jimp.read(imagePath);

  image.resize(250, 250);

  const uniqueFileName = `${userId}_${Date.now()}.png`;

  const outputPath = path.join(outputFolder, uniqueFileName);

  await image.write(outputPath);

  return outputPath;
}

async function uploadAvatar(req, res, next) {
  try {
    const avatarPath = await processAndSaveAvatar(req.file.path, req.user.id);
    await fs.unlink(req.file.path);
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarURL: `/avatars/${path.basename(avatarPath)}` },
      { new: true }
    ).exec();
    if (user === null) {
      return res.status(404).send({ message: "Not found" });
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  currentUser,
  logoutUser,
  uploadAvatar,
};
