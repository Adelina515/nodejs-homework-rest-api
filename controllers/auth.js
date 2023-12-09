require("dotenv").config;
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { HttpError } = require("../helpers");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const fs = require("node:fs/promises");
const path = require("node:path");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { sendEmail } = require("../helpers");
const { v4: uuidv4 } = require("uuid");

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
    const verificationToken = uuidv4();
    await sendEmail({
      to: email, // Change to your recipient
      subject: "Sending with SendGrid is Fun",
      html: `To  confirm your registration please click on the <a href ="http://localhost:3000/users/verify/${verificationToken}">link</a>`,
      text: `To  confirm your registration please open the link http://localhost:3000/users/verify/${verificationToken}`,
    });
    const newUser = await User.create({
      password: passwordHash,
      email,
      subscription,
      verificationToken,
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
    if (user.verify !== true) {
      return res.status(401).send({
        message: "Email not verified. Please verify your email first.",
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
    if (!req.file) {
      return res.status(400).send({ message: "Missing required field: file" });
    }
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

async function verificationTokenEmail(req, res, next) {
  const { verificationToken } = req.params;
  try {
    const user = await User.findOne({ verificationToken }).exec();
    if (!user || user === null) {
      return res.status(404).send("Not found");
    }
    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });
    res.status(200).send({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }).exec();
    if (email === "" || email === null || !email) {
      return res.status(400).send({ message: "missing required field email" });
    }
    if (user.verify === true) {
      return res
        .status(400)
        .send({ message: "Verification has already been passed" });
    }
    const verificationToken = uuidv4();
    await sendEmail({
      to: email, // Change to your recipient
      subject: "Sending with SendGrid is Fun",
      html: `To  confirm your registration please click on the <a href ="http://localhost:3000/users/verify/${verificationToken}">link</a>`,
      text: `To  confirm your registration please open the link http://localhost:3000/users/verify/${verificationToken}`,
    });
    res.status(200).send({ message: "Verification email sent" });
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
  verificationTokenEmail,
  verify,
};
