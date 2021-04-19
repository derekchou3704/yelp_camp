const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const { validateCampground, isLoggedIn, isAuthor } = require('../middleware')

router.route('/')
    .get(campgrounds.index)
    .post(isLoggedIn, validateCampground, campgrounds.createCampground);

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

//:id must be the last, otherwise other paths are going to be considered as ids
router.route('/:id')
    .get(campgrounds.showCampgrounds)
    .put(isLoggedIn, isAuthor, validateCampground, campgrounds.updateCampground)
    .delete(isLoggedIn, isAuthor, campgrounds.deleteCampground)

router.get('/:id/edit', isLoggedIn, isAuthor, campgrounds.renderEditForm);

module.exports = router;