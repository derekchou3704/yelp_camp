const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = catchAsync(async(req, res, next) => {
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
})

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'You have logged in');
    const redirectUrl = req.session.returnTo || '/campgrounds'
    //delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logOut(); //builted in passport
    req.flash('success', 'See you again!');
    res.redirect('/campgrounds');
}