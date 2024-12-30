const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");

const Place = require("../models/place");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

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

  let userWithPlaces;

  try{
    userWithPlaces = await User.findById(userId).populate('places');
  }catch(err){
    next(new HttpError('Something went wrong. Could not find places.', 500))
  }

  if(!userWithPlaces || userWithPlaces.places.length === 0){
    return next(new HttpError('Could not find any places for this user', 404));
  }

  res.status(200).json({places: userWithPlaces.places.map(p => p.toObject({getters: true}))});
}

// alternative to above implementation
// const getPlacesbyUserId = async (req, res, next) => {
//   const userId = req.params.uid;
//   let places;
//   try{
//     places = await Place.find({creator: userId});
//   }catch(err){
//     next(new HttpError('Something went wrong. Could not find the place.', 500))
//   }

//   if (!places || places.length === 0) {
//     const error = new HttpError(
//       "Could not find a place for user with user id: " + userId,
//       404
//     );
//     next(error);
//     return;
//   }
//   res.json({ places: places.map(p => p.toObject({getters: true})) });
// };

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
    image: req.file.path,
    location: coordinates,
    address,
    creator
  });

  // check if the user exists
  let user;
  try{
    user = await User.findById(creator);
  }catch(err){
    return next(new HttpError('Createing place failed', 500))
  }

  if(!user){
    return next(new HttpError('Could not find the user for provided id.', 404));
  }
  console.log(user);

  try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session: sess});
    user.places.push(createdPlace);   // adds the place id not the whole object
    await user.save({session: sess});
    await sess.commitTransaction();   // now the changes are pushed to the database

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
    place = await Place.findById(pid).populate('creator'); //populate helps us refer to a document in another collection and work with that document
  }catch(err){
    return next(new HttpError('Something went wrong deleting the place 1.', 500));
  }

  if(!place){
    return next(new HttpError('Could not find place for this id.', 404));
  }

  try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({session: sess});
    place.creator.places.pull(place);
    await place.creator.save({session: sess});
    await sess.commitTransaction();

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
