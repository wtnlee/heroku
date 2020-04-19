
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const express = require('express');

let Router = express.Router();

Router.post('/login', function(req, res) {

    // console.log(req.body.email);

    // console.log(req.body.password);
    console.log(req);

   



});


module.exports = Router;

