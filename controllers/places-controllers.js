const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");

const Place = require("../models/place");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try{
    place = await Place.findById(placeId);
  } catch(err){
    const error = new HttpError('Something went wrong. Could not find a place', 500);
    return next(error);
  }

    if (!place) {
    // two ways to throw errpr
    // next() for async code
    // throw for sync code
    return next(new HttpError("Could not find a place with this id", 404));
  }
  res.json({place: place.toObject({getters: true})});   // getter: true will make sure that _id changes to id. .toObject removes _id, but getters: true will force it to keep the id as 'id'.
};

const getPlacesbyUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try{
    places = await Place.find({creator: userId});
  }catch(err){
    next(new HttpError('Something went wrong. Could not find the place.', 500))
  }

  if (!places || places.length === 0) {
    const error = new HttpError(
      "Could not find a place for user with user id: " + userId,
      404
    );
    next(error);
    return;
  }
  res.json({ places: places.map(p => p.toObject({getters: true})) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    next(new HttpError("Invalid inputs", 422));
    return;
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
    location: coordinates,
    address,
    creator
  });

  try{
    await createdPlace.save();
  }catch(err){
    const error = new HttpError('Creating place failed.', 500);
    return next(error)
  }

  res.status(201).json({place: createdPlace});
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    next(new HttpError("Invalid inputs", 422));
    return;
  }

  const pid = req.params.pid;
  const { title, description } = req.body;

  let place;
  try{
    place = await Place.findById(pid);
  }catch(err){
    return next(new HttpError('Something went wrong updating the place', 500));
  }
  
  place.title = title;
  place.description = description;

  try{
   await place.save();
  }catch(err){
    return next(new HttpError('Something went wrong. Could not update the place', 500));
  }
 
  res.status(200).json({ place: place.toObject({getters: true}) });
};

const deletePlace = async (req, res, next) => {
  const pid = req.params.pid;

  let place;
  try{
    place = await Place.findById(pid);
  }catch(err){
    return next(new HttpError('Something went wrong deleting the place 1.', 500));
  }

  try{
    await place.deleteOne()
  }catch(err){
    return next(new HttpError('Something went wrong deleting the place', 500));
  }

  res.status(200).json({ message: "Deleted place" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesbyUserId = getPlacesbyUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
