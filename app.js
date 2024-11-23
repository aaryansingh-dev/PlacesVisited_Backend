const express = require('express')
const bodyPareser = require('body-parser')

const placesRoutes  = require('./routes/places-routes');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.use('/api/places',placesRoutes);  // => /api/places/...

app.use();

app.use((error, req, res, next) => {
    if(res.headerSent){
        return next(error);
    }

    res.status(error.code  || 500).json({message: error.message || 'An unknown error occured.'});
});

app.listen(3002);

