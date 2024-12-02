const HttpError = require('../models/http-error')
const {v4: uuidv4} = require('uuid')
const {validationResult} = require('express-validator')

const User = require('../models/user');
const { link } = require('../routes/places-routes');


DUMMY_USERS = [
    {
        id: 'u1',
        name: 'John Doe',
        email: 'john@test.com',
        password: 'testpass'
    }
]

const getAllUsers = async (req, res, next) => {
    let users;
    try{
       users = await User.find({}, '-password');
    }catch(err){
        return next(new HttpError(
            'Error fetching users', 500
        ))
    }

    res.json({users: users.map(u => u.toObject({getters: true}))});
}

const signup = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        next(new HttpError('Incomplete or wrong details provided.', 404));
        return;
    }

    const {name, email, password} = req.body

    let existingUser;
    try{
        existingUser = await User.findOne({email: email});
    }catch(err){
        return next(new HttpError('Could not find unique email - searching for unique email check.', 500));
    }
    
    if(existingUser){
        return next(new HttpError('User exists already. Please login instead', 422));
    }

    const user = new User({
        name,
        email,
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        password,
        places: []
    })

    try{
        await user.save();
    }catch(err){
        return next(new HttpError('Signing up failed', 500));
    }

    res.status(201).json({user: user.toObject({getters: true})});
}

const login = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        next(new HttpError('Invalid credentials', 404));
        return;
    }

    const {email, password} = req.body;
    
    let existingUser;
    try{
        existingUser = await User.findOne({email: email});
    }catch(err){
        return next(new HttpError('Could not find unique email - searching for unique email check.', 500));
    }

    if(!existingUser || existingUser.password !== password){
        const error = new HttpError('Wrong password and email combination', 401);
        next(error)
        return
    }

    res.json({message: 'Logged in'})
}

exports.getAllUsers = getAllUsers
exports.signup = signup
exports.login = login