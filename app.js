const express = require("express");
const xss = require("xss-clean");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const rateLimite = require("express-rate-limit");
const saucesRoutes = require("./routes/sauces");
const userRoutes = require("./routes/user");
const path = require("path");

const app = express();
app.use(helmet());
app.use(cors());
app.use(xss());

const limiter = rateLimite({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

mongoose.set("useCreateIndex", true);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zpzj3.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());

app.use("/api/auth", userRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/sauces", saucesRoutes);

module.exports = app;
