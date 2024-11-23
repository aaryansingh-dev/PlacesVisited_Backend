const express = require('express');

const placesControllers = require('../controllers/places-controllers')
const router = express.Router();
// special object on which we can also register middlewares.
// filtered by http method and path
// and we can export this Router 

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacebyUserId);

module.exports = router;