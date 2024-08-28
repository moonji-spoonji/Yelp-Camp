const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

// const {campgroundSchema, reviewSchema} = require('./schemas.js');
// const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require("method-override");

// const Campground = require('./models/campground');
// const Review = require('./models/review.js');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users')
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const app = express();

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//     console.log('DATABASE CONNECTED YAY!')
// })

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));    
app.use(methodOverride('_method'));     // overrides previously entered info by submitting a form with edited info
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// middleware (access to them through templates)
app.use((req, res, next) => {
    // console.log(req.session);
    res.locals.currentUser = req.user; // to keep track if someone is logged in 
    res.locals.success = req.flash('success'); // we take anything passed to flash with the name "success" and store/access it in a local 
    res.locals.error = req.flash('error');
    next();
})
// const validateCampground = (req, res, next) => {
//     // JOI SCHEMA NOTTT MONGOOSE SCHEMA
//     const {error} = campgroundSchema.validate(req.body);
//     if(error){
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400) 
//     } 
//     else {
//         next();
//     }
// }

// const validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if( error ) {
//         const msg = error.details.map(el => el.message).join(',');throw new ExpressError(msg, 400);
//     }
//     else {
//         next();
//     }
// }


// app.get('/', (req, res) => {
//     res.render('home');
// })

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)

// INCLUDING REVIEWS (LINKING/MAKING RELATIONSHIPS WITH MONGOOSE DATA)
// app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
//     const {id} = req.params;
//     const campground = await Campground.findById(id);
//     const review = new Review(req.body.review);
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();

//     res.redirect(`/campgrounds/${campground._id}`);
// }))

// app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Campground.findByIdAndUpdate( id, {$pull: {reviews: reviewId} })
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/campgrounds/${id}`);
// }))


// Error Handling
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
    // res.send('404!!!')
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = 'Oh no! Something went wrong!'; 
    res.status( statusCode ).render('error', {err});
})


app.listen(3000, () => {
    console.log('LISTENING ON PORT 3000!');
})