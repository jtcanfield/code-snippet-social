const fs = require('fs'),
    path = require('path'),
    express = require('express'),
    mustache = require('mustache-express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    flash = require('express-flash-messages'),//FLASH MESSAGES ALLOWS YOU TO USE res.locals.getMessages(), AND STORE THEM IN messages
    LocalStrategy = require('passport-local').Strategy,
    mongodb = require('mongodb'),
    mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    models = require("./models"),
    expressValidator = require('express-validator'),
    User = models.User;
const app = express();
const MongoClient = mongodb.MongoClient;
const mongoURL = 'mongodb://localhost:27017/codesnippetsite';
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/codesnippetsite');
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(expressValidator());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new(require('express-sessions'))({
        storage: 'mongodb',
        instance: mongoose, // optional
        host: 'localhost', // optional
        port: 27017, // optional
        db: 'test', // optional
        collection: 'sessions', // optional
        expire: 86400 // optional
    })
}));passport.use(new LocalStrategy(
    function(username, password, done) {
        User.authenticate(username, password, function(err, user) {
          //HERE, USER is the entire user object
            if (err) {
                return done(err)
            }
            if (user) {
                return done(null, user)
            } else {
                return done(null, false, {
                    message: "There is no user with that username and password."
                })
            }
        })
    }
));
passport.serializeUser(function(userobj, done) {
  //HERE, USER is the entire user object
    done(null, userobj.id);//Returns the randomized ID, sends to deserializeUser
});
passport.deserializeUser(function(id, done) {
  //Gets the ID from the serializeUser
    User.findById(id, function(err, userobj) {
      //finds that user object by its ID
        done(err, userobj);//FIND OUT WHERE THIS RETURNS TO
    });
});
app.use(function (req, res, next) {
  console.log(res.locals);
  res.locals.user = req.user;
  next();
})







app.get('/', function(req, res) {
    res.render("index");
})
app.get('/login/', function(req, res) {
    res.render("login", {
        messages: res.locals.getMessages()
    });
});
app.post('/login/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login/',
    failureFlash: true
}))

app.get('/signup/', function(req, res) {
    res.render('signup');
});
app.post('/signup/', function(req, res) {
    req.checkBody('username', 'Username must be alphanumeric').isAlphanumeric();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Type Password Again').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Invalid Email').isEmail();
    req.checkBody('password', 'Passwords do not match').equals(req.body.password2);
    req.getValidationResult()
        .then(function(result) {
            if (!result.isEmpty()) {
                return res.render("signup", {
                    username: req.body.username,
                    errors: result.mapped()
                });
            }
            const user = new User({
                username: req.body.username,
                password: req.body.password,
                email: req.body.email
            })
            const error = user.validateSync();
            if (error) {
                return res.render("signup", {
                    errors: normalizeMongooseErrors(error.errors)
                })
            }
            user.save(function(err) {
                if (err) {
                  console.log("The Train Should Stop Here");
                    return res.render("signup", {
                        messages: {
                            error: ["That username is already taken."]
                        }
                    })
                }
                return res.redirect('/');
            })
        })
});

function normalizeMongooseErrors(errors) {
    Object.keys(errors).forEach(function(key) {
        errors[key].message = errors[key].msg;
        errors[key].param = errors[key].path;
    });
}

app.get('/logout/', function(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('back');
});

const requireLogin = function (req, res, next) {
  if (req.user) {
    next()
  } else {
    res.redirect('/login/');
  }
}


app.get("/:dynamic", function (req, res) {
  console.log("DYNAMIC TRIGGERED:")
  console.log(req.params.dynamic);
  res.redirect('/');
});
process.env.PORT || 5000
app.listen(process.env.PORT || 5000, function () {
  console.log('Hosted on local:5000 or Dynamic');
})
MongoClient.connect(mongoURL, function(err, db) {
  console.log("Connected successfully to server at " + mongoURL);
  db.close();
});
