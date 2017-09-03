const fs = require('fs'),
    path = require('path'),
    express = require('express'),
    mustache = require('mustache-express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    flash = require('express-flash-messages'),//FLASH MESSAGES ALLOWS YOU TO USE res.locals.getMessages(), AND STORE THEM IN messages
    LocalStrategy = require('passport-local').Strategy,
    expressValidator = require('express-validator');

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const mongoURL = 'mongodb://localhost:27017/codesnippetsite';
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/codesnippetsite');

const bcrypt = require('bcryptjs');
const app = express();
const userFile = require('./users.js');
const statsFile = require('./stats.js');
const UserModel = require("./models/model");
app.use(session({ secret: 'this-is-a-secret-token', cookie: { maxAge: 60000, httpOnly: false}}));
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
var gameWin = false;
function isLetter(c) {
  return c.toLowerCase() != c.toUpperCase();
};
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(userobj, done) {
  MongoClient.connect(mongoURL, function (err, db) {
    const users = db.collection("users");
    users.find({username:{$eq: userobj.username.toLowerCase()}}).toArray(function (err, docs) {
    return done(err, docs)
    })
  })
});
app.use(function (req, res, next) {
  console.log("unnamed function");
  res.locals.user = req.user;//REQ.USER IS LIKE A GLOBAL MUSTACHE VARIABLE
  console.log(res.locals);
  next();
})
passport.use(new LocalStrategy(
    function(username, password, done) {
      MongoClient.connect(mongoURL, function (err, db) {
        const users = db.collection("users");
        users.find({username:{$eq: username.toLowerCase()}, password:{$eq: password}, }).toArray(function (err, docs) {
          if (docs[0] !== undefined){
            return done(null, docs[0])
          }
          if (docs[0] === undefined){
            return done("INVALID", false)
          }
        })
      })
    }
));
const requiresLogin = function (req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/login/');
    return
  }
}
const loginRedirect = function (req, res, next) {
  if (req.user) {
    res.redirect('/');
    return
  } else {
    next();
  }
}



//BEGIN GETS
app.get("/", requiresLogin, function (req, res) {
  console.log(req.user[0].username)
  res.render("index");
});
app.get("/login", loginRedirect, function (req, res) {
  res.render("login", {messages: res.locals.getMessages()});
});
app.get("/signup", loginRedirect, function (req, res) {
  res.render("signup");
});
app.get("/mysteryword", requiresLogin, function (req, res) {
  res.redirect('/');
});


app.get("/statistics", function (req, res) {
  MongoClient.connect(mongoURL, function (err, db) {
    const statlist = db.collection("statistics");
    statlist.find().toArray(function (err, docs) {
    res.render("statistics", {stats:JSON.stringify(docs)});
    })
  })
});
//END GETS

//BEGIN POSTS
// app.post('/login', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true
// }))
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



app.post("/", function (req, res) {
  res.redirect('/');
});


app.post("/startgame:dynamic", requiresLogin, function (req, res) {
  mysterywordgameFile.getword(req.params.dynamic, function(word){
    req.sessionStore.word = [...word];
    var emptyArray = [];
    req.sessionStore.word.map((x) =>{emptyArray.push("_")});
    req.sessionStore.emptyWord = emptyArray;
    req.sessionStore.guessed = [];
    req.sessionStore.lives = 8;
    // var encodedstring = encodeURIComponent('{game:"active",emptyWord:req.sessionStore.emptyWord, guessed:req.sessionStore.guessed, lives: req.sessionStore.lives, time:"0", letterstatus:"Go!"}');
    // console.log(decodeURIComponent(encodedstring));
    // res.redirect("/mysteryword" + encodedstring);
    res.render("mysteryword", {game:true,emptyWord:req.sessionStore.emptyWord, guessed:req.sessionStore.guessed, lives: req.sessionStore.lives, time:"0", letterstatus:"Go!"});
  });
});

app.post("/signup", function (req, res) {
  userFile.validateForm(req, function(error, errordescrip){
    if (error === true){
      res.render('signup', {status:errordescrip});
      return
    } else {//REMOVE DUPLICATED MONGOCLIENT.CONNECT AND CONSTS
      MongoClient.connect(mongoURL, function (err, db) {
        const users = db.collection("users");
        const statlist = db.collection("statistics");
        users.find({username:{$eq: req.body.username.toLowerCase()}}).toArray(function (err, docs) {
          if (docs[0] !== undefined){
            res.render('signup', {status:"Username already exists, choose another user name"});
            return
          }
          if (docs[0] === undefined){
              users.insertOne({username: req.body.username, password: req.body.password2, email: req.body.email, sessionID: ""})
              statlist.insertOne({username:req.body.username,games:0,wins:0,losses:0,words:[],wordlengths:[],times:[],gamestatus:[]})
              return res.redirect('/');
          }
        })
      })
    }
  });
});
app.post("/logout", function (req, res) {
  req.session.destroy();
  res.redirect('back');
});
app.post("/loginredirect", function (req, res) {
  req.session.destroy();
  res.redirect('/login');
});
app.post("/signupredirect", function (req, res) {
  req.session.destroy();
  res.redirect('/signup');
});
app.post("/statisticsredirect", function (req, res) {
  res.redirect('/statistics');
});
app.get("/profile:dynamic", function (req, res) {
  MongoClient.connect(mongoURL, function (err, db) {
    const statlist = db.collection("statistics");
    statlist.find({ username: { $eq: req.params.dynamic } }).toArray(function (err, docs) {
      console.log(docs)
    res.render("profile", {stats:JSON.stringify(docs)});
    })
  })
});
app.get("/search:dynamic", function (req, res) {
  MongoClient.connect(mongoURL, function (err, db) {
    const statlist = db.collection("statistics");
    statlist.find().toArray(function (err, docs) {
      res.json({stats:docs})
    })
  })
});
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
