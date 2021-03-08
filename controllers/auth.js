const bycrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const nodeMailgun = require("nodemailer-mailgun-transport");

const auth = {
  auth: {
    api_key: "aac279ce764fad9893539151131da335-4879ff27-ae34a46c",
    domain: "sandbox8adedf7b4ac342969377be742aa8f08e.mailgun.org",
  },
};
let transporter = nodemailer.createTransport(nodeMailgun(auth));

const User = require("../models/user");

const { validationResult } = require("express-validator");
const { use } = require("../routes/shop");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "SignUp",
    errorMessage: message,
    oldInput: { name: "", email: "", password: "" },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Log In",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Log In",
          errorMessage: "Invlid email or password",
          oldInput: { email: email, password: password },
          validationErrors: [],
        });
      }
      bycrypt
        .compare(password, user.password)
        .then((matched) => {
          if (matched) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              return res.redirect("/");
            });
          }

          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Log In",
            errorMessage: "Invalid email or password",
            oldInput: { email: email, password: password },
            validationErrors: [],
          });
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "SignUp",
      errorMessage: errors.array()[0].msg,
      oldInput: { name: name, email: email, password: password },
      validationErrors: errors.array(),
    });
  }

  bycrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      const mailOptions = {
        from: "Nitin nitin3emails@gmail.com",
        to: email,
        subject: "SignUp Succeed",
        html: "<h1>Sign Up Succesfull</h1>",
      };
      return transporter.sendMail(mailOptions);
    })
    .catch((err) => console.log(err))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
    oldInput: { email: "" },
    validationErrors: [],
  });
};
exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found");
          console.log("Found ni hua");
          return res.redirect("/reset");
        } else {
          user.resetToken = token;
          user.resetTokenExpiry = Date.now() + 3600000;
          return user.save();
        }
      })
      .then((result) => {
        res.redirect("/");
        const mailOptions = {
          from: "Nitin nitin3emails@gmail.com",
          to: req.body.email,
          subject: "Password Reset",
          html: `<p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">Link</a>to reset</p>`,
        };
        transporter.sendMail(mailOptions);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
exports.getNewPassord = (req, res, next) => {
  const token = req.params.token;
  console.log(token);
  const date = Date.now();
  console.log(date);
  User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } })
    .then((user) => {
      console.log(user);
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        validationErrors: [],
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiry: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bycrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiry = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};
