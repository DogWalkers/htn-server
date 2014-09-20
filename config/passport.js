/**
 * Created by Sahil Jain on 20/09/2014.
 */
var textUtils = require('../utils/textutils');
var LocalStrategy = require('passport-local').Strategy;

var Clinic = require('../models/clinic');

module.exports = function (passport) {

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, input, password, done) { //TODO use post data, not url params for info
            var email = input.toLowerCase();
            process.nextTick(function () {
                Clinic.findOne({ 'email': email }, function (err, clinic) {
                    if (err) {
                        return done(err);
                    }
                    if (clinic) {
                        return done("email already in use", false);
                    } else if (textUtils.isEmpty(req.query.firstName)) {
                        return done(null, false);
                    } else {
                        var newClinic = new Clinic();

                        newClinic.email = email;
                        newClinic.password = newClinic.generateHash(password);
                        newClinic.firstName = req.query.firstName;
                        newClinic.dateCreated = Date.now();
                        // save the clinic
                        newClinic.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newClinic);
                        });
                    }
                });
            });
        }));

    passport.use('local-login', new LocalStrategy({
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, email, password, done) { // callback with email and password from our form
                email = email.toLowerCase();
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({ 'email': email }, function (err, user) {
                    // if there are any errors, return the error before anything else
                    if (err)
                        return done(err);

                    // if no user is found, return the message
                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'Oops! User not found.')); // req.flash is the way to set flashdata using connect-flash

                    // if the user is found but the password is wrong
                    if (!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                    // all is well, return successful user
                    return done(null, user);
                });
            })
    );
};