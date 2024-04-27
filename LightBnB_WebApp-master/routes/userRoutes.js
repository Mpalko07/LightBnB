const express = require("express");
const bcrypt = require("bcrypt");
const { getUserWithEmail, getUserWithId, addUser } = require("../db/database");

const router = express.Router();

// Create a new user
router.post("/", (req, res) => {
  const user = req.body;
  user.password = bcrypt.hashSync(user.password, 12);
  addUser(user)
    .then((newUser) => {
      if (!newUser) {
        return res.send({ error: "error" });
      }

      req.session.userId = newUser.id;
      res.send("🤗");
    })
    .catch((e) => res.send(e));
});

// Log a user in
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  getUserWithEmail(email).then((user) => {
    if (!user) {
      return res.send({ error: "no user with that email" });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.send({ error: "incorrect password" });
    }

    req.session.userId = user.id;
    res.send({
      user: {
        name: user.name,
        email: user.email,
        id: user.id,
      },
    });
  });
});

// Log a user out
router.post("/logout", (req, res) => {
  req.session.userId = null;
  res.send({});
});

// Return information about the current user (based on cookie value)
router.get("/me", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.send({ message: "not logged in" });
  }

  database
    .getUserWithId(userId)
    .then((user) => {
      if (!user) {
        return res.send({ error: "no user with that id" });
      }

      res.send({
        user: {
          name: user.name,
          email: user.email,
          id: userId,
        },
      });
    })
    .catch((e) => res.send(e));
});

module.exports = router;
