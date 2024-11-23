const HttpError = require('../models/http-error')
const {v4: uuidv4} = require('uuid')

let DUMMY_PLACES = [
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

const createPlace = (req, res, next) => {
    const {title, description, coordinates, address, creator} = req.body;
    const createdPlace = {
        id: uuidv4(),
        title,
        description,
        location: coordinates,
        address,
        creator
    };
    DUMMY_PLACES.push(createdPlace)

    res.status(201).json({place: createdPlace})
};

const updatePlace = (req, res, next) => {
    const pid = req.params.pid;
    const {title, description} = req.body;

    const updatedPlace = { ... DUMMY_PLACES.find(p => pid === p.id)};
    const placeIndex  = DUMMY_PLACES.findIndex(p => p.id === pid)
    updatedPlace.title = title;
    updatedPlace.description = description;

    DUMMY_PLACES[placeIndex] = updatedPlace;

    res.status(200).json({place: updatedPlace})
}

const deletePlace = (req, res, next) => {
    const pid = req.params.pid
    DUMMY_PLACES = DUMMY_PLACES.filter(p => pid !== p.id)

    res.status(200).json({message: 'Deleted place'});
} 

exports.getPlaceById = getPlaceById
exports.getPlacebyUserId = getPlacebyUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace