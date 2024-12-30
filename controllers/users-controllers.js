const HttpError = require('../models/http-error')
const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const { link } = require('../routes/places-routes');


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

    let hashedPassword;
    try{
        hashedPassword = await bcrypt(password, 12);

    }catch(err){
        const error = new HttpError('Could not register user due to unknown technical reasons.', 500);
        return next(error);
    }

    const user = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
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

    if(!existingUser){
        const error = new HttpError('Wrong password and email combination', 401);
        next(error)
        return
    }

    let isValidPassword = false;
    try{
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    }catch(err){
        const error = new HttpError('Could not log you in, please try again.', 500);
        return next(error);
    }

    if(!isValidPassword){
        const error = new HttpError('Invalid credentials, please try again later.', 401);
        return next(error);
    }

    res.json({message: 'Logged in', user: existingUser.toObject({getters: true})});
}

exports.getAllUsers = getAllUsers
exports.signup = signup
exports.login = login