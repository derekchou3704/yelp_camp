const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

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

router.get('/', catchAsync(async(req,res) => {    
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

router.get('/new', catchAsync(async(req,res) => {  
    // const campground = await Campground.findById(req.params.id);    
    res.render('campgrounds/new');
}))

router.post('/', validateCampground, catchAsync(async(req, res, next) => {
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); //invalid client data    
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/${campground._id}`);
}))

// it defaults everything not specified after compounds/
// to be id, so must be placed as the last order
router.get('/:id', catchAsync(async(req, res, next) => {  
    const campground = await Campground.findById(req.params.id).populate('reviews');    
    res.render('campgrounds/show', { campground });
}))

router.get('/:id/edit', catchAsync(async(req, res, next) => {  
    const campground = await Campground.findById(req.params.id);    
    res.render('campgrounds/edit', { campground });
    
}))

//update route
router.put('/:id', validateCampground, catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;