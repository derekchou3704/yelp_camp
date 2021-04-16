module.exports.isLoggedIn = (req, res, next) => {
    //store the requested url
    req.session.returnTo = req.originalUrl; 
    //a helper fn from passport automatically add in request
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in');
        return res.redirect('/login')
    }
    next();
}