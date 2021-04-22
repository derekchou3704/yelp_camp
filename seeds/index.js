const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];
// to give random attributes (for title, see below)

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '60796129a35c97056c21bb38', //to prevent some campgrounds break down due to the lack of author
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,            
            description: 'Description Lorem',
            price,
            images: [
                {
                  _id: '60804aee36c2be369c9853be',
                  url: 'https://res.cloudinary.com/foxxx/image/upload/v1619020527/YelpCamp/leztqvondccjgl2o4fot.jpg',
                  filename: 'YelpCamp/leztqvondccjgl2o4fot'
                },
                {
                  _id: '60804aee36c2be369c9853bf',
                  url: 'https://res.cloudinary.com/foxxx/image/upload/v1619020528/YelpCamp/ilfd5bcfnq1xl7kgcae9.jpg',
                  filename: 'YelpCamp/ilfd5bcfnq1xl7kgcae9'
                },
                {
                  _id: '60804aee36c2be369c9853c0',
                  url: 'https://res.cloudinary.com/foxxx/image/upload/v1619020529/YelpCamp/l0xpi09yfduvla5rupbm.jpg',
                  filename: 'YelpCamp/l0xpi09yfduvla5rupbm'
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})