const HttpError = require('../models/http-error')

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

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId;
    })

    if(!place){
        // two ways to throw errpr
        // next() for async code
        // throw for sync code
        throw new HttpError('Could not find a place with this id', 404)
    }
    res.json({place: place});   
}

const getPlacebyUserId = (req, res, next) => {
    const userId = req.params.uid;
    const place = DUMMY_PLACES.find(p => {
        return p.creator === userId
    })
    if(!place){
        const error = new HttpError('Could not find a place for user with user id: ' + userId, 404)
        next(error);
        return
    }
    res.json({place})
};

exports.getPlaceById = getPlaceById
exports.getPlacebyUserId = getPlacebyUserId

