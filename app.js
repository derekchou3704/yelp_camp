if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const MongoStore = require('connect-mongo');

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// use for deploying (Mongo Atlas)
const dbUrl =  process.env.DB_URL;//'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl , {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connectio error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
//to specify the parsing engine instead of default one
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// parse the request body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'))//the static diractory
app.use(mongoSanitize()) //to prevent mongo injection

const secret = process.env.SECRET || 'thisshouldbeabettersecrete';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: 'thisshouldbeabettersecrete',
    touchAfter: 24 * 60 * 60 // in sec
});

// store.on(function(e) {
//     console.log("SESSION Store Error!", e);
// })

const sessionConfig = {    
    store,
    name: 'session', //to not use the default name i.e. .sid
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //for security
        // secure: true, //allows https (s for secure) only
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //in ms
        maxAge:  1000 * 60 * 60 * 24 * 7,
    }
    //the above will be the memory store (local)
}

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://fontawesome.com/",    
    "https://cdnjs.cloudfare.com/",
    "https://cdn.jsdelivr.net/",
    "https://api.mapbox.com/mapbox-gl-js/",
    "https://mongoosejs.com/"
]
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "mapbox://styles/mapbox/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/",
    "https://api.mapbox.com/mapbox-gl-js/"
]
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.com/",
    "https://events.mapbox.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/",
    "mapbox://styles/mapbox/",
    "https://mongoosejs.com/"
]
const fontSrcUrls = []
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'unsafe-inline'", "'self'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/foxxx/",
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls]
        },
    })
);


app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({contentSecurityPolicy: false}));

app.use(passport.initialize());
//make sure it's below app.use(session())
app.use(passport.session());
//generates a fn that is used in Passports' local Strategy
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Setting a middleware for every requests
app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        //store the request Url and not causing the bug 
        //that saves url even if the user login with login btn 
        //Also it updates every time if the user hit the route
        //so it's not neccessary to deletle returnTo
        req.session.returnTo = req.originalUrl;        
    }
    //console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//using the express router for the prefix
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}!!` );
})