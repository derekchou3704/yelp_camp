const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connectio error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
//to specify the parsing engine instead of default one
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Middleware for validating campgrounds
const validateCampground = (req, res, next) => {    
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }    
}
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



// parse the request body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async(req,res) => {    
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

app.get('/campgrounds/new', catchAsync(async(req,res) => {  
    // const campground = await Campground.findById(req.params.id);    
    res.render('campgrounds/new');
}))

app.post('/campgrounds', validateCampground, catchAsync(async(req, res, next) => {
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); //invalid client data
    
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// it defaults everything not specified after compounds/
// to be id, so must be placed as the last order
app.get('/campgrounds/:id', catchAsync(async(req, res, next) => {  
    const campground = await Campground.findById(req.params.id).populate('reviews');    
    res.render('campgrounds/show', { campground });
}))

app.get('/campgrounds/:id/edit', catchAsync(async(req, res, next) => {  
    const campground = await Campground.findById(req.params.id);    
    res.render('campgrounds/edit', { campground });
    
}))

//update route
app.put('/campgrounds/:id', validateCampground, catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync( async(req, res) => {
    const { id, reviewId }= req.params;    
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    //$pull operator is a method from mongoose to pull all the specific related ones out
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, somrthing went WRONG'
    res.status(statusCode).render('error', { err } );    
})

app.listen(3000, () => {
    console.log("Serving on port 3000");
})