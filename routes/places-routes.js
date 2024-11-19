const express = require('express');

const router = express.Router();
// special object on which we can also register middlewares.
// filtered by http method and path
// and we can export this Router 

const DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the tallest buildings in USA.',
        location:{
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: 'New York, NY 10001',
        creator: 'u1'
    }
];


router.get('/:pid', (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId;
    })

    if(!place){
        // two ways
        // next for async code
        // throw for sync code
        const error = new Error('Could not find a place with this id')
        error.code = 404;
        throw error;
    }
    res.json({place: place});   
});

router.get('/user/:uid',(req, res, next) => {
    const userId = req.params.uid;
    const place = DUMMY_PLACES.find(p => {
        return p.creator === userId
    })
    if(!place){
        const error = new Error('Could not find a place for user with user id: ' + userId)
        error.code = 404
        next(error);
        return
    }
    res.json({place})
});

module.exports = router;