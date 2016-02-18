var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/database'); // get db config file
var User = require('./app/models/user'); // get the mongoose model
var port = process.env.PORT || 8080;
var jwt = require('jwt-simple');
var thread = require('./app/models/thread');
var post = require('./app/models/post');

// get our request parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

// demo Route (GET http://localhost:8080)
app.get('/', function (req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);

// demo Route (GET http://localhost:8080)
// ...

// connect to database
mongoose.connect(config.database);

// pass passport for configuration
require('./config/passport')(passport);

// bundle our routes
var apiRoutes = express.Router();

// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function (req, res) {
    if (!req.body.name || !req.body.password) {
        res.json({success: false, msg: 'Please pass name and password.'});
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password
        });
        // save the user
        newUser.save(function (err) {
            if (err) {
                return res.json({success: false, msg: 'Username already exists.'});
            }
            res.json({success: true, msg: 'Successful created new user.'});
        });
    }
});

// connect the api routes under /api/*

app.use('/api', apiRoutes);
apiRoutes.post('/authenticate', function (req, res) {
    User.findOne({
        name: req.body.name
    }, function (err, user) {
        if (err)
            throw err;

        if (!user) {
            res.send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = jwt.encode(user, config.secret);
                    // return the information including token as JSON
                    res.json({success: true, token: 'JWT ' + token});
                } else {
                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
// 
// route to authenticate a user (POST http://localhost:8080/api/saveThread)

apiRoutes.post('/saveThread', function (req, res) {
    if (!req.body.title || !req.body.text) {
        console.log("s");
    } else {
        var newThread = new thread({
            _owner: req.body._owner,
            title: req.body.title,
            url: req.body.title,
            text: req.body.text
        });
        console.log(newThread);
        newThread.save(function (err) {
            if (err) {
                return res.json({success: false, msg: 'Username already exists.'});
            }
            res.json({success: true, msg: 'Successful created thread.'});
        });
    }
});

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', {session: false}), function (req, res) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            name: decoded.name
        }, function (err, user) {
            if (err)
                throw err;

            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                res.json({success: true, msg: 'Welcome ' + user.name + '!', user: user});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});
apiRoutes.get('/threads', function (req, res) {
    thread.find({}, function (err, threads) {
        res.json(threads);
    });
});
apiRoutes.post('/thread', function (req, res) {
    var thread_id = req.body.thread_id;
    thread.findOne({
        _id: thread_id
    }).populate('_owner')
            .exec(function (err, thread) {
                if (err) {
                    res.json({
                        success: false,
                        message: "Thread doesnt exist"
                    });
                } else if (thread) {
                    post.find({
                        _thread: thread_id
                    }).sort({
                        created_at: 'descending'
                    })
                            .populate('_owner')
                            .exec(function (err, posts) {
                                if (err) {
                                    res.json({
                                        success: false,
                                        message: "Something is wrong"
                                    });
                                } else if (posts) {
                                    res.json({
                                        success: true,
                                        thread: thread,
                                        posts: posts
                                    });
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Something is wrong"
                                    });
                                }
                            });
                }
                ;
            });

});

apiRoutes.post('/savePost', function (req, res) {

    var thread_id = req.body.thread_id;
    var text = req.body.text;

    var token = getToken(req.headers);

    if (token) {
        var decoded = jwt.decode(token, config.secret);

        var newPost = new post({
            _owner: decoded._id,
            _thread: thread_id.thread_id,
            text: text,
            created_at: new Date()
        });
        console.log(newPost);
        newPost.save(function (err) {
            if (err) {
                res.json({
                    success: false
                });
            } else {
                console.log('post saved');
                res.json({
                    success: true
                });
            }
        });

    }
});

getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};