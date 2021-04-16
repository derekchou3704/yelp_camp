module.exports.isLoggedIn = (req, res, next) => {    
    //a helper fn from passport automatically add in request
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in');
        return res.redirect('/login')
    }
    next();
}