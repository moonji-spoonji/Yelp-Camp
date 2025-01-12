const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');


router.get('/register', (req, res) => {
    res.render('users/register')
});

router.post('/register', catchAsync(async (req, res, next) => {
    try{
        const {email, username, password} = req.body
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });

    }
    catch(e) {
        req.flash('error', e.message);
        res.redirect('/campgrounds');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});


// storeReturnTo middleware saves the returnTo value from session to res.locals
// passport.authenticate(...) logs user in and clears req.session
router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {

    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if(err) {
            return next(err);
        }
    });
    req.flash('success', 'Successfully logged out!')
    res.redirect('/campgrounds')
})

module.exports = router;