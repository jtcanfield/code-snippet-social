const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
    },
    passwordHash: {
        type: String,
        required: true
    }
},{timestamps: true});

userSchema.virtual('password')
    .get(function() {
        return null
    })
    .set(function(value) {
        const hash = bcrypt.hashSync(value, 8);
        this.passwordHash = hash;
    })

userSchema.methods.authenticate = function(password) {
    return bcrypt.compareSync(password, this.passwordHash);
}

userSchema.statics.authenticate = function(username, password, done) {
    this.findOne({
        username: username
    }, function(err, user) {
        if (err) {
            done(err, false)
        } else if (user && user.authenticate(password)) {
            done(null, user)
        } else {
            done(null, false)
        }
    })
};

const User = mongoose.model('User', userSchema);


const snippetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    codesnippet: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    language: {
        type: String,
        required: true
    },
    privacy: {
        type: String,
        required: true
    },
    tags: {
        type: Array
    },
    user: {
        type: String,
        required: true
    }
},{timestamps: true});
const Snippet = mongoose.model('Snippet', snippetSchema);

module.exports = {
    User: User,
    Snippet: Snippet
};
