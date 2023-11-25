const express = require("express");
const router = express.Router();
const AuthController = require("../../controllers/auth");
const jsonParser = express.json();
const auth = require("../../middellware/auth");

router.post("/register", jsonParser, AuthController.register);
router.post("/login", jsonParser, AuthController.login);
router.post("/logout", auth, AuthController.logoutUser);
router.get("/current", auth, AuthController.currentUser);
module.exports = router;
