const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const { validateCampground, isLoggedIn, isAuthor } = require('../middleware')

const Campground = require('../models/campground');

router.get('/', catchAsync(async(req,res) => {    
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

router.get('/new', isLoggedIn, catchAsync(async(req,res) => {  

    res.render('campgrounds/new');
}))

//Making a new campground
router.post('/', isLoggedIn, validateCampground, catchAsync(async(req, res, next) => {    
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); //invalid client data    
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully make a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// it defaults everything not specified after compounds/
// to be id, so must be placed as the last order
router.get('/:id', catchAsync(async(req, res, next) => {  
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path:'author'
        }
    }).populate('author');
    console.log(campground)
    if (!campground) {
        req.flash('error', 'CANNOT find the campground!');
        return res.redirect('/campgrounds');
    }    
    res.render('campgrounds/show', { campground });
}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req, res, next) => { 
    const { id } = req.params; 
    const campground = await Campground.findById(id);   
    if (!campground) {
        req.flash('error', 'CANNOT find the campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
    
}))

//update route
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async(req, res, next) => {
    const { id } = req.params;      
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully update the campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}))

module.exports = router;