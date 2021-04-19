const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');

module.exports.createReview = catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review!');
    res.redirect(`/campgrounds/${campground._id}`)
})

module.exports.deleteReview = catchAsync( async(req, res) => {
    const { id, reviewId }= req.params;    
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    //$pull operator is a method from mongoose to pull all the specific related ones out
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully delete a review!');
    res.redirect(`/campgrounds/${id}`);
})