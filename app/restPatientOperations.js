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