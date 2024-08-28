module.exports.isLoggedIn = (req, res, next) => {
    // console.log('Requesting User with req.user ...' , req.user);
    if(!req.isAuthenticated()){
        // console.log(req.path, req.originalUrl)
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in to proceed!');
        return res.redirect('/login');
    }
    next();

}

module.exports.storeReturnTo = (req, res, next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}