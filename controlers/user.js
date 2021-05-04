const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

exports.signup = (req, res, next) => {
  if (validator.isEmail(req.body.email) == false) {
    res.status(400).json({ message: "Format d'email invalide" });
    return;
  }
  if (validator.isStrongPassword(req.body.password) == false) {
    res.status(400).json({ message: "Format de mot de passe invalide" });
    return;
  }
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  if (validator.isEmail(req.body.email) == false) {
    res.status(400).json({ message: "Format d'email invalide" });
    return;
  }
  if (validator.isStrongPassword(req.body.password) == false) {
    res.status(400).json({ message: "Format de mot de passe invalide" });
    return;
  }
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.RANDOM_TOKEN, {
              expiresIn: "24h",
            }),
            userEmail: maskEmail(req.body.email),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

function maskEmail(email) {
  const strSplit = email.split("@");
  const modifytStr = strSplit[0].replace(strSplit[0], "*****");
  const modifyEmail = modifytStr.concat("@", strSplit[1]);

  return modifyEmail;
}
