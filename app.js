const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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

mongoose.set('useFindAndModify', false);
// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true` by default

const app = express();

app.engine('ejs', ejsMate);
//to specify the parsing engine instead of default one
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// parse the request body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//using the express router for the prefix
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req, res) => {
    res.render('home');
})


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