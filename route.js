const route = require('express').Router();

route.get('/', (req, res) => {
    res.send({response: "logged to express"}).status(200);
});

module.exports = route;