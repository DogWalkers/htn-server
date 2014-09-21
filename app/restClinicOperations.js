var textUtils = require("../utils/textutils");
var tokenUtils = require("../utils/tokenutils");
var Clinic = require("../models/clinic");
var Patient = require("../models/patient");

exports.signup = function(req, res) {
    var clinicName = req.body.clinicName;
    var ownerEmail = req.body.ownerEmail;
    var ownerPassword = req.body.ownerPassword;
    var clinicAddress = req.body.clinicAddress;
    var clinicLongitude = req.body.clinicLongitude;
    var clinicLatitude = req.body.clinicLatitude;
    var openTime = req.body.openTime;
    var closeTime = req.body.closeTime;

    if(textUtils.isEmpty(clinicName) ||
        textUtils.isEmpty(ownerEmail) ||
        textUtils.isEmpty(ownerPassword) ||
        textUtils.isEmpty(clinicAddress) ||
        textUtils.isEmpty(clinicLatitude) ||
        textUtils.isEmpty(clinicLongitude) ||
        textUtils.isEmpty(openTime) ||
        textUtils.isEmpty(closeTime)) {
        return res.status(400).json({error: "You left at least 1 parameter empty"});
    }

    Clinic.findOne({"ownerEmail":ownerEmail}, function (err, clinic) {
        if(err) {
            return serverError(res);
        }
        if (clinic) {
            return res.status(403).json({error: "email is already in use"});
        }

        var newClinic = new Clinic();

        newClinic.clinicName = clinicName;
        newClinic.ownerEmail = ownerEmail;
        newClinic.ownerPassword = newClinic.generateHash(ownerPassword);
        newClinic.openTime = openTime;
        newClinic.closeTime = closeTime;
        newClinic.clinicAddress = clinicAddress;
        newClinic.clinicLatitude = clinicLatitude;
        newClinic.clinicLongitude = clinicLongitude;
        newClinic.dateCreated = Date.now();
        newClinic.save(function (err, doc) {
            if (err) {
                return serverError(res);
            }
            var token = tokenUtils.generateTokenFromDocument(doc);
            return res.json({token: token});
        });
    });
};

exports.login = function (req, res) {
    var email = req.body.ownerEmail;
    var password = req.body.ownerPassword;

    if (textUtils.isEmpty(email) || textUtils.isEmpty(password)) {
        return res.status(400).json({error: "Do not leave email or password as empty"});
    }

    Clinic.findOne({"ownerEmail":email}, function (err, clinic) {
        if (err) {
            return serverError(res);
        }
        if (clinic) {
            if(clinic.validPassword(password)) {
                var token = tokenUtils.generateTokenFromDocument(clinic);
                return res.json({token: token});
            } else {
                return res.status(401).json({error: "Invalid password"});
            }
        } else {
            return res.status(401).json({error: "Invalid email"});
        }
    });
};

exports.getAll = function (req, res) {
    Clinic.find({}, function(err, clinics) {
        if (err || !clinics) {
            return serverError(res);
        } else {
            var output = [];
            clinics.forEach(function (clinic) {
                var obj = {};
                obj.clinicId = clinic._id;
                obj.clinicName = clinic.clinicName;
                obj.clinicLatitude = clinic.clinicLatitude;
                obj.clinicLongitude = clinic.clinicLongitude;
                obj.clinicAddress = clinic.clinicAddress;
                obj.openTime = clinic.openTime;
                obj.closeTime = clinic.closeTime;
                obj.numPatientsWaiting = clinic.patientsInQueue.length;
                output.push(obj);
            });
            return res.json(output);
        }
    });
};

exports.getSelf = function (req, res) {
    var token = req.query.token;
    tokenUtils.getClinicFromToken(token, function(err, clinic) {
        if (err || !clinic) {
            res.status(401).json({error: "invalid token"});
        } else {
            var obj = {};
            obj.clinicId = clinic._id;
            obj.clinicName = clinic.clinicName;
            obj.ownerEmail = clinic.ownerEmail;
            obj.clinicAddress = clinic.clinicAddress;
            obj.clinicLatitude = clinic.clinicLatitude;
            obj.clinicLongitude = clinic.clinicLongitude;
            obj.openTime = clinic.openTime;
            obj.closeTime = clinic.closeTime;
            obj.patientsInQueue = clinic.patientsInQueue;
            obj.dateCreated = clinic.dateCreated;
            res.json(obj);
        }
    });
};

exports.deletePatientFromQueue = function (req, res) {
    var patientId = req.params.clinicId;
    var token = req.query.token;
    tokenUtils.getClinicFromToken(token, function(err, clinic) {
        if (err || !clinic) {
            res.status(401).json({error: "invalid token"});
        } else {
            Clinic.findByIdAndUpdate(clinic._id, {$pull: { patientsInQueue: {patientId: patientId}}}, function(err, doc) {
                if(!err) {
                    return res.json(doc);
                }
            });
        }
    });
};



var serverError = function(res) {
    res.status(500).json({error: "there was a server error"});
};