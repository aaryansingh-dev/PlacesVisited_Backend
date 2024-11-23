const HttpError = require('../models/http-error')
const {v4: uuidv4} = require('uuid')
const {validationResult} = require('express-validator')


DUMMY_USERS = [
    {
        id: 'u1',
        name: 'John Doe',
        email: 'john@test.com',
        password: 'testpass'
    }
]

const getAllUsers = (req, res, next) => {
    users = DUMMY_USERS

    if(users.length === 0){
        const error = new HttpError('No users found', 404)
        next(error)
        return
    }

    res.json({users})
}

const signup = (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        next(new HttpError('Incomplete or wrong details provided.', 404));
        return;
    }

    const {name, email, password} = req.body
    const user = {
        id: uuidv4(),
        name,
        email,
        password
    }

    if(DUMMY_USERS.find(u => u.email === email)){
        const error = new HttpError('User already registered with this email id.', 422);
        next(error);
        return
    }

    DUMMY_USERS.push(user)
    res.status(201).json({user})
}

const login = (req, res, next) => {
    if(!errors.isEmpty()){
        next(new HttpError('Invalid credentials', 404));
        return;
    }

    const {email, password} = req.body;
    const user = DUMMY_USERS.find(p => {
        return (email === p.email)
    })

    if(!user || password !== user.password){
        const error = new HttpError('Wrong password and email combination', 401);
        next(error)
        return
    }

    res.json({message: 'Logged in'})
}

exports.getAllUsers = getAllUsers
exports.signup = signup
exports.login = login