const express = require("express");
const router = express.Router();

const saucesCtrl = require("../controlers/sauces");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.get("/", auth, saucesCtrl.getAllSauces);
router.post("/", auth, multer, saucesCtrl.createSauce);
router.get("/:id", auth, saucesCtrl.getOneSauce);
router.put("/:id", auth, multer, saucesCtrl.modifySauce);
router.delete("/:id", auth, saucesCtrl.deleteSauce);
router.post("/:id/like", auth, saucesCtrl.likeOrDislike);
module.exports = router;
