const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const passport = require('passport');

router.route('/register')
    .get(users.renderRegister)
    .post(users.register)

router.route('/login')
    .get(users.renderLogin)
    //use built-in passport middleware to handle login failure
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)

router.get('/logout', users.logout)

module.exports = router;