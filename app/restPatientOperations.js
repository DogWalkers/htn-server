var textUtils = require("../utils/textutils");
var tokenUtils = require("../utils/tokenutils");
var Patient = require("../models/patient");
var Clinic = require("../models/clinic");

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
  var reason = req.body.reasonForVisit;
  tokenUtils.getPatientFromToken(token, function(err, patient) {
      if (err || !patient) {
        return res.status(401).json({error: "invalid token"});
      }
      Clinic.findOne({'patientsInQueue.patientId':patient._id}, function (err, clinic) {
          if(err) {
              return serverError(res);
          }
          if(clinic){
              return res.status(403).json({error: "patient already in queue"});
          }
          var name = patient.firstName + " " + patient.lastName;
          Clinic.findByIdAndUpdate(clinicId, {$push: { patientsInQueue: {patientId: patient._id, patientName: name, reasonForVisit: reason}}}, function(err, clinic) {
              if(!err && clinic) {
                  return res.json(clinic);
              } else {
                  return res.status(500).json({error: "could not find clinic"});
              }
          });
      });

  });

};

exports.deleteSelfFromQueue = function (req, res) {
    var token = req.query.token;
    tokenUtils.getPatientFromToken(token, function(err, patient) {
        if (err || !patient) {
            res.status(401).json({error: "invalid token"});
        } else {
            Clinic.update({'patientsInQueue.patientId':patient._id}, {$pull: { patientsInQueue: {patientId: patient._id}}}, function(err, doc) {
                if (err) {
                    return serverError(res);
                }
                if (!doc) {
                    return res.status(403).json({error: "patient is not in queue"});
                }
                res.json(patient);
            });
        }
    });
};

exports.getSelf = function (req, res) {
    var token = req.query.token;
    tokenUtils.getPatientFromToken(token, function(err, patient) {
        if (err || !patient) {
            res.status(401).json({error: "invalid token"});
        } else {
            var obj = {};
            obj.patientId = patient._id;
            obj.age = patient.age;
            obj.email = patient.email;
            obj.firstName = patient.firstName;
            obj.lastName = patient.lastName;
            obj.healthCardNumber = patient.healthCardNumber;
            obj.sex = patient.sex;
            obj.dateJoined = patient.dateCreated;
            obj.clinicHistory = patient.clinicHistory;
            res.json(obj);
        }
    });
};

var serverError = function(res) {
    res.status(500).json({error: "there was a server error"});
};