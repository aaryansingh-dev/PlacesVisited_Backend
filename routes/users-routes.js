const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const userController = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");

router.get("/", userController.getAllUsers);

router.post(
  "/signup",
  fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("email").isEmail(),
    check("password").not().isEmpty(),
  ],
  userController.signup
);

router.post(
  "/login",
  userController.login
);

module.exports = router;
