const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');


router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async(req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password)
        req.logIn(registeredUser, err => {
        //no awaits inside this function bc it needs callbacks
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelpcamp!');
            res.redirect('/campgrounds');
        })
    }
    catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }    
}))


router.get('/login', (req, res) => {
    res.render('users/login');
})

//use built-in passport middleware to handle login failure
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'You have logged in');
    const redirectUrl = req.redirectUrl || '/campgrounds'
    //delete req.session.returnTo;
    res.redirect(redirectUrl);
})


router.get('/logout', (req, res) => {
    req.logOut(); //builted in passport
    req.flash('success', 'See you again!');
    res.redirect('/campgrounds');
})



module.exports = router;