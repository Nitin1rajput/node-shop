const express = require("express");
const { check, body } = require("express-validator");
const { Error } = require("mongoose");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body(
    "password",
    "Please enter a password at least 6 characters and must contain alpha numeric"
  )
    .isLength({ min: 6 })
    .isAlphanumeric()
    .trim(),
  authController.postLogin
);

router.post(
  "/signup",
  check("email")
    .isEmail()
    .withMessage("Please Enter a valid email")
    .custom((value) => {
      //   if (value === "test@test.com") {
      //     throw new Error("Email is Forbidden");
      //   }
      //   return true;
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("Email exists already");
        }
      });
    }).normalizeEmail,
  body(
    "password",
    "Please enter a password at least 6 characters and must contain alpha numeric"
  )
    .isLength({ min: 6 })
    .isAlphanumeric()
    .trim(),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password not matched!");
      }
    }),
  authController.postSignup
);

router.post("/logout", authController.postLogout);

module.exports = router;
