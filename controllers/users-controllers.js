const HttpError = require('../models/http-error')


DUMMY_USERS = [
    {
        id: 'u1',
        name: 'John Doe',
        email: 'john@test.com',
        address: 'New York'
    }
]

const getAllUsers = (req, res, next) => {
    users = DUMMY_USERS

    res.status(400).json({users})
}

const signup = (req, res, next) => {
    
}
exports.getAllUsers = getAllUsers