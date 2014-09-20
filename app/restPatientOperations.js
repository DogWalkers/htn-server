var textUtils = require("../utils/textutils");
var tokenUtils = require("../utils/tokenutils");
var Patient = require("../models/patient");

exports.signup = function(req, res) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var password = req.body.password;
    var homeAddress = req.body.homeAddress;
    var age = req.body.age;
    var sex = req.body.sex;
    var healthCardNumber = req.body.healthCardNumber;

    //make sure all parameters are non empty
    if(textUtils.isEmpty(firstName) ||
        textUtils.isEmpty(lastName) ||
        textUtils.isEmpty(email) ||
        textUtils.isEmpty(password) ||
        textUtils.isEmpty(homeAddress) ||
        textUtils.isEmpty(age) ||
        textUtils.isEmpty(healthCardNumber) ||
        textUtils.isEmpty(sex)) {
        return res.status(400).json({error: "You left at least 1 parameter empty"});
    }

    //check if email is already in use
    Patient.findOne({"email":email}, function (err, patient) {
        if(err) {
            return serverError(res);
        }
        if (patient) {
            return res.status(403).json({error: "email is already in use"});
        }

        var newPatient = new Patient();

        newPatient.firstName = firstName;
        newPatient.lastName = lastName;
        newPatient.email = email;
        newPatient.password = newPatient.generateHash(password);
        newPatient.age = age;
        newPatient.sex = sex;
        newPatient.healthCardNumber = healthCardNumber;
        newPatient.dateCreated = Date.now();
        newPatient.save(function (err, doc) {
            if (err) {
                return serverError(res);
            }
            var token = tokenUtils.generateTokenFromDocument(doc);
            return res.json({token: token});
        });
    });
};

exports.login = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    if (textUtils.isEmpty(email) || textUtils.isEmpty(password)) {
        return res.status(400).json({error: "Do not leave email or password as empty"});
    }

    Patient.findOne({"email":email}, function (err, patient) {
        if (err) {
            return serverError(res);
        }
        if (patient) {
            if(patient.validPassword(password)) {
                var token = tokenUtils.generateTokenFromDocument(patient);
                return res.json({token: token});
            } else {
                return res.status(401).json({error: "Invalid password"});
            }
        } else {
            return res.status(401).json({error: "Invalid email"});
        }
    });
};

exports.addToQueue = function (req, res) {
  var clinicId = req.params.clinicId;
  var token = req.query.token;
  tokenUtils.getPatientFromToken(token, function(err, patient) {
      if (err || !patient) {
        res.status(401).json({error: "invalid token"});
      } else if (patient.isInQueue) {
        res.status(403).json({error: "patient is already in a queue"});
      } else {
        Clinic.findByIdAndUpdate(clinicId, {$push: { patientsInQueue: patient._id}}, function(err, clinic) {
            res.json(clinic);
        });
      }
  });

};