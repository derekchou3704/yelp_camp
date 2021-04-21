const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');

module.exports.index = catchAsync(async(req,res) => {    
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

module.exports.renderNewForm = catchAsync(async(req,res) => { 
    res.render('campgrounds/new');
})

module.exports.createCampground = catchAsync(async(req, res, next) => {        
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully make a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
})

module.exports.showCampgrounds = catchAsync(async(req, res, next) => {  
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path:'author'
        }
    }).populate('author');    
    if (!campground) {
        req.flash('error', 'CANNOT find the campground!');
        return res.redirect('/campgrounds');
    }    
    res.render('campgrounds/show', { campground });
})

module.exports.renderEditForm = catchAsync(async(req, res, next) => { 
    const { id } = req.params; 
    const campground = await Campground.findById(id);   
    if (!campground) {
        req.flash('error', 'CANNOT find the campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
    
})

module.exports.updateCampground =  catchAsync(async(req, res, next) => {
    const { id } = req.params;      
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully update the campground!');
    res.redirect(`/campgrounds/${campground._id}`);
})

module.exports.deleteCampground = catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
})