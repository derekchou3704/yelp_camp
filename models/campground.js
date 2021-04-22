const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema ({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
    //we don't have to store this in our model or DB (what virtual do)
    //because it's derrived from the info we are storing
    //and /w_number is the api from cloudinary to thumb imgs
})

const CampgroundSchema = new Schema ({
    title: String,
    images: [ImageSchema],
    geometry: { // it is a GeoJson
        type: {
            type: String,
            enum: ['Point'], // must be 'Point'
            required: true
        },
        coordinates: { // [longitude, lattitude]
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);
