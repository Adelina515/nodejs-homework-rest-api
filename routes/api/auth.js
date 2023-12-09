const express = require("express");
const router = express.Router();
const AuthController = require("../../controllers/auth");
const jsonParser = express.json();
const auth = require("../../middellware/auth");
const upload = require("../../middellware/upload");

router.post("/register", jsonParser, AuthController.register);
router.post("/login", jsonParser, AuthController.login);
router.post("/logout", auth, AuthController.logoutUser);
router.get("/current", auth, AuthController.currentUser);
router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  AuthController.uploadAvatar
);
router.get("/verify/:verificationToken", AuthController.verificationTokenEmail);
router.post("/verify", AuthController.verify);
module.exports = router;
