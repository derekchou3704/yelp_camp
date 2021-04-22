const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder =  mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = catchAsync(async(req, res) => {    
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

module.exports.renderNewForm = catchAsync(async(req, res) => { 
    res.render('campgrounds/new');
})

module.exports.createCampground = catchAsync(async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();    
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
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

// WARNING!! CANNOT SUUCCESSFULLY DELETE!!
module.exports.updateCampground =  catchAsync(async(req, res) => {
    const { id } = req.params;      
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    console.log(campground);
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);    
    await campground.save();  
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            console.log(filename)
            await cloudinary.uploader.destroy(filename);            
        }
        await campground.updateOne({ $pull: { images: { filemame: { $in: req.body.deleteImages } } } });        
    }      
    req.flash('success', 'Successfully update the campground!');
    res.redirect(`/campgrounds/${campground._id}`);
})

module.exports.deleteCampground = catchAsync(async(req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
})