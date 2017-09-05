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
    Snippet = models.Snippet,
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
app.use(session({ secret: 'this-is-a-secret-token', cookie: { maxAge: 600000, httpOnly: false}}));
// app.use(session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: false,
//     store: new(require('express-sessions'))({
//         storage: 'mongodb',
//         instance: mongoose, // optional
//         host: 'localhost', // optional
//         port: 27017, // optional
//         db: 'test', // optional
//         collection: 'sessions', // optional
//         expire: 86400 // optional
//     })
// }));
passport.use(new LocalStrategy(
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
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
})

// MongoClient.connect(mongoURL, function (err, db) {
//     const uzerlist = db.collection("users");
//     uzerlist.find({ username: { $eq: "jtdude100" } }).toArray(function (err, docs) {
//     // res.render("profile", {stats:JSON.stringify(docs)});
//     })
//   })
const loginRedirect = function (req, res, next) {
  if (req.user) {
    res.redirect('/');
    return
  } else {
    next();
  }
}
const requireLogin = function (req, res, next) {
  if (req.user) {
    next()
  } else {
    res.redirect('/login/');
  }
}
const checkLogin = function (req, res, next) {
  if (req.sessionID === req.user.sessionID) {
    next()
  } else {
    res.redirect('/login/');
  }
}

app.get('/', function(req, res) {
    res.render("index");
})
app.get('/login/', function(req, res) {
    res.render("login", {messages: res.locals.getMessages()});
});
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {  return res.render("login", {status:err}) }
    if (!user) { return res.redirect('/login');  }
    MongoClient.connect(mongoURL, function (err, db) {
      const users = db.collection("users");
      users.updateOne({username:{$eq: user.username}}, {$set: {sessionID:req.sessionID}}, function (err, docs) {
      req.logIn(user, function() {});//NEEDS TO BE USED IN ORDER TO USE REQ.USER
      return res.redirect('/');
      })
    })
  })(req, res, next);
});
app.get('/signup/', loginRedirect,  function(req, res) {
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
app.get('/signup/', loginRedirect, function(req, res) {
    res.render('signup');
});
app.get('/addasnip/', requireLogin, function(req, res) {
    res.render('addasnip');
});
app.post('/addasnip', function(req, res, next) {
  req.checkBody('title', 'Please Title your snip!').notEmpty();
  req.checkBody('codesnippet', 'You need a Snippet to submit a Snip!').notEmpty();
  req.checkBody('language', 'What language is this?').notEmpty();
  req.getValidationResult()
      .then(function(result) {
          if (!result.isEmpty()) {
              return res.render("addasnip", {
                  title: req.body.title,
                  codesnippet: req.body.codesnippet,
                  notes: req.body.notes,
                  language: req.body.language,
                  privacy: req.body.privacy,
                  tags: req.body.tags,
                  errors: result.mapped()
              });
          }
          const user = new Snippet({
            title: req.body.title,
            codesnippet: req.body.codesnippet,
            notes: req.body.notes,
            language: req.body.language,
            privacy: req.body.privacy,
            tags: req.body.tags,
            user: req.user._id
          })
          const error = user.validateSync();
          if (error) {
              return res.render("addasnip", {
                  errors: normalizeMongooseErrors(error.errors)
              })
          }
          user.save(function(err) {
              return res.redirect('/profile');
          })
      })
});
app.get('/logout', function(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});
app.get('/profile', requireLogin, function(req, res) {
  res.redirect('/profile'+req.user.username);
});
app.get('/profile:dynamic', function(req, res) {
  MongoClient.connect(mongoURL, function (err, db) {
    const users = db.collection("users");
    const snippets = db.collection("snippets");
    users.find({username:{$eq: req.params.dynamic}}).toArray(function (err, userdocs) {
      snippets.find({user:{$eq: String(userdocs[0]._id)}}).toArray(function (err, snippetdocs) {
        return res.render('profile', {profilename:userdocs[0].username, snippetlist:JSON.stringify(snippetdocs)});
      })
    })
  })
});
app.get('/snippetview:dynamic', function(req, res) {
  Snippet.findById(req.params.dynamic, function (err, snippetdocs) {
    User.findById(snippetdocs.user, function (err, userdocs) {
      if (req.user !== undefined && req.user.username === userdocs.username){
        return res.render('snippetview', {snippet:snippetdocs, snippetJSON:JSON.stringify(snippetdocs)});
      } else {
        return res.render('snippetview', {author:userdocs.username, snippet:snippetdocs, snippetJSON:JSON.stringify(snippetdocs)});
      }
    })
  })
});
app.get('/edit:dynamic', requireLogin, checkLogin, function(req, res) {
  Snippet.findById(req.params.dynamic, function (err, snippetdocs) {
    res.render("editasnip", {
        title: snippetdocs.title,
        codesnippet: snippetdocs.codesnippet,
        notes: snippetdocs.notes,
        language: snippetdocs.language,
        privacy: snippetdocs.privacy,
        tags: snippetdocs.tags
    });
  })
});

app.get("/:dynamic", function (req, res) {
  console.log("DYNAMIC TRIGGERED: " + req.params.dynamic)
  res.render('404');
});
process.env.PORT || 5000
app.listen(process.env.PORT || 5000, function () {
  console.log('Hosted on local:5000 or Dynamic');
})
MongoClient.connect(mongoURL, function(err, db) {
  console.log("Connected successfully to server at " + mongoURL);
  db.close();
});
