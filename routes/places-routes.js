const express = require('express');

const placesControllers = require('../controllers/places-controllers')
const router = express.Router();
// special object on which we can also register middlewares.
// filtered by http method and path
// and we can export this Router 

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesbyUserId);

router.post('/', placesControllers.createPlace)

router.patch('/:pid', placesControllers.updatePlace)

router.delete('/:pid', placesControllers.deletePlace)

module.exports = router;