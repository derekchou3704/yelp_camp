const express = require('express');
const router = express.Router({mergeParams: true});
//otherwise the id from campground can't be read and would thus be null
//Since it's not the id of reviews themselves
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const Campground = require('../models/campground');
const Review = require('../models/review');

const catchAsync = require('../utils/catchAsync');



router.post('/',isLoggedIn, validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync( async(req, res) => {
    const { id, reviewId }= req.params;    
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    //$pull operator is a method from mongoose to pull all the specific related ones out
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully delete a review!');
    res.redirect(`/campgrounds/${id}`);
}))


module.exports = router;