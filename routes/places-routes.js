const express = require("express");
const { check } = require("express-validator");

const placesControllers = require("../controllers/places-controllers");
const router = express.Router();
// special object on which we can also register middlewares.
// filtered by http method and path
// and we can export this Router

router.get("/user/:uid", placesControllers.getPlacesbyUserId);

router.get("/:pid", placesControllers.getPlaceById);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch(
  "/:pid",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
