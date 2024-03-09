// routes.js
const express = require('express');
const userController = require('../controller/userController');

const router = express.Router();

router.use(express.static('public'));
router.use(express.json());

// Signup route
router.post('/signup', userController.signup);

// Login route
router.post('/login', userController.login);

// All users route
router.get('/allusers', userController.getAllUsers);

module.exports = router;
