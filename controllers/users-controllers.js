const HttpError = require('../models/http-error')
const {v4: uuidv4} = require('uuid')


DUMMY_USERS = [
    {
        id: 'u1',
        name: 'John Doe',
        email: 'john@test.com',
        address: 'New York',
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
    const {name, email, address, password} = req.body
    const user = {
        id: uuidv4(),
        name,
        email,
        address,
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