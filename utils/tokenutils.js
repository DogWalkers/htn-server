/**
 * Created by Sahil Jain on 20/09/2014.
 */
var jwt = require("jwt-simple");
var Patient = require("../models/patient");
var Clinic = require("../models/clinic");
var secret;
if (process.env.NODE_ENV == 'test') {
    secret = "testsecret";
} else {
    secret = "mysecret";
}

exports.generateTokenFromDocument = function (document) {
    return jwt.encode({objectId: document._id}, secret);
};

exports.getPatientFromToken = function (token, next) {
    var claims;
    try {
        claims = jwt.decode(token, secret);
    } catch (ex) {
        return next(true, null);
    }
    Patient.findById(claims.objectId, function (err, doc) {
        if (err) {
        }
        return next(err, doc);
    });
};

exports.getClinicFromToken = function (token, next) {
    var claims;
    try {
        claims = jwt.decode(token, secret);
    } catch (ex) {
        return next(true, null);
    }
    Clinic.findById(claims.objectId, function (err, doc) {
        if (err) {
        }
        return next(err, doc);
    });
};