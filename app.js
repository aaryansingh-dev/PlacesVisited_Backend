const express = require("express");
const bodyPareser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");
const bodyParser = require("body-parser");

const app = express();
const HttpError = require("./models/http-error");

app.use(bodyParser.json());

app.use("/api/places", placesRoutes); // => /api/places/...

app.use("/api/users/", userRoutes); //=> /api/users/...

app.use((req, res, next) => {
  const error = new HttpError("Could not find the route", 404);
  next(error);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occured." });
});

mongoose.connect(
  "mongodb+srv://aaryanjsingh:Il0veMongo@cluster0.dvhnk.mongodb.net/places?retryWrites=true&w=majority&appName=Cluster0"
).then(
    () => {
      console.log('Starting the server.')
        app.listen(3002);
    }).catch(err => {
        console.log(err);
    });

