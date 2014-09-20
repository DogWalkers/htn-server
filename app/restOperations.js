/**
 * Created by Sahil Jain on 20/09/2014.
 */
var textUtils = require('../utils/textutils');
var tokenUtils = require('../utils/tokenutils');

var serverError = function (res) {
    console.log("sending error");
    return res.status(500).json({error: "server error"});
};

module.exports = function (passport) {
    return setupFunctions(passport);
};

var setupFunctions = function (passport) {
    var exports = {};

    exports.getUser = function (req, res) {
        var token = req.query.token;
        if (textUtils.isEmpty(token)) {
            return res.status(400).json({error: "please provide 'token' property"});
        }

        tokenUtils.getUserFromToken(token, function (err, user) {
            if (!user) return res.status(400).json({error: "token invalid"});
            var out = {};
            out.userId = user._id;
            out.firstName = user.firstName;
            out.email = user.email;
            out.dateJoined = user.dateCreated;
            Question.find({'asker': user._id}, function (err, questionsAsked) {
                if (err) {
                    return serverError(res);
                } else {
                    out.questionsAsked = questionsAsked; //todo format question docs for output
                    Answer.find({'answerer': user._id}, function (err, answersGiven) {
                        if (err) {
                            return serverError(res);
                        } else {
                            console.log("someone asked for user");
                            out.answersGiven = [];
                            var numDeleted = 0;
                            if (answersGiven.length == 0) {
                                return res.json(out);
                            } else {
                                answersGiven.forEach(function (answer) {
                                    var curAns = {};
                                    Question.findOne({answers: answer._id}, function (err, questionAnswered) {
                                        if (err) {
                                            return serverError(res);
                                        } else if (!questionAnswered) {
                                            console.log("deleted answer " + answer._id);
                                            answer.remove();
                                            numDeleted++;
                                        } else {
                                            curAns.questionId = questionAnswered._id;
                                            curAns.questionName = questionAnswered.name;
                                            curAns.questionDescription = questionAnswered.text;
                                            curAns.answerId = answer._id;
                                            curAns.answerText = answer.text;
                                            curAns.answerTime = answer.time;
                                            out.answersGiven.push(curAns); //TODO more information?
                                        }
                                        if ((out.answersGiven.length + numDeleted) == answersGiven.length) {
                                            return res.json(out);
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
            });
        });
    };

    exports.getLoginToken = function (req, res, next) {
        if (!req.query.email || !req.query.password) {
            return res.status(400).json({error: "please provide an email and password"});
        }
        passport.authenticate('local-login', {session: false}, function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({error: "invalid username or password"});
            }
            var token = tokenUtils.generateTokenFromUser(user);
            res.json({token: token});
        })(req, res, next);
    };

    exports.postSignup = function (req, res, next) {
        if (!req.query.email) {
            return res.status(400).json({error: "Could not create user. Please provide username"});
        }
        if (!req.query.password) {
            return res.status(400).json({error: "Could not create user. Please provide password"});
        }
        if (!req.query.firstName) {
            return res.status(400).json({error: "Could not create user. Please provide firstName"});
        }
        passport.authenticate('local-signup', {session: false}, function (err, user, info) {
            if (err) {
                return res.status(401).json({error: err});
            }
            if (!user) {
                return res.status(401).json({error: "did not create user"});
            }
            var token = tokenUtils.generateTokenFromUser(user);
            res.json({success: true, username: user.email, firstName: user.firstName, token: token});
        })(req, res, next);
    };

    return exports;
};