const Sauce = require("../models/Sauce");
const fs = require("fs");
const validator = require("validator");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  if (
    sauceObject.name.isLength({ min: 5, max: 255 }) ||
    sauceObject.manufacturer.isLength({ min: 5, max: 255 }) ||
    sauceObject.description.isLength({ min: 5, max: 255 }) ||
    sauceObject.mainPepper.isLength({ min: 5, max: 255 }) == false
  ) {
    res.status(400).json({
      message:
        "Format d'informations invalide, la longueur minimum d'une information doit être de 5 caractères",
    });
    return;
  }
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  if (
    sauceObject.name.isLength({ min: 5, max: 255 }) ||
    sauceObject.manufacturer.isLength({ min: 5, max: 255 }) ||
    sauceObject.description.isLength({ min: 5, max: 255 }) ||
    sauceObject.mainPepper.isLength({ min: 5, max: 255 }) == false
  ) {
    res.status(400).json({
      message:
        "Format d'informations invalide, la longueur minimum d'une information doit être de 5 caractères",
    });
    return;
  }
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Objet modifié" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const fileName = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${fileName}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet suprimé" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.likeOrDislike = (req, res, next) => {
  const like = req.body.like;
  switch (like) {
    case 1:
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
          $push: { usersLiked: req.body.userId },
        }
      )
        .then((result) => {
          res.status(200).json({ message: "sauce like ajouté" });
        })
        .catch((error) => res.status(400).json({ error }));
      break;
    case -1:
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: 1 },
          $push: { usersDisliked: req.body.userId },
        }
      )
        .then(() => res.status(200).json({ message: "sauce like enlevée" }))
        .catch((error) => res.status(400).json({ error }));
      break;
    case 0:
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (sauce.usersLiked.find((user) => user === req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
              }
            )
              .then(() => {
                res.status(201).json({ message: "sauce like supprimé" });
              })
              .catch((error) => {
                res.status(400).json({ error });
              });
          }
          if (sauce.usersDisliked.find((user) => user === req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
              }
            )
              .then(() => {
                res.status(201).json({ message: "sauce dislike enlevé" });
              })
              .catch((error) => {
                res.status(400).json({ error });
              });
          }
        })
        .catch((error) => {
          res.status(404).json({ error });
        });
      break;
    default:
      console.log("information érronée ");
  }
};
