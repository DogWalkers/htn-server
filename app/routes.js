/**
 * Created by Sahil Jain on 20/09/2014.
 */
var textUtils = require("../utils/textutils");
var tokenUtils = require("../utils/tokenutils");
var Clinic = require("../models/clinic");
module.exports = function (server) {
    var app = server.app;
    createRestEndpoints(app);
};

function createRestEndpoints(app) {

    var rest = require('../app/restOperations')();

    var restClinic = require('../app/restClinicOperations');

    app.all('*', function (req, res, next) { //TODO REMOVE THIS BEFORE DEPLOYING
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });

    app.post('/api/clinic/signup', function(req, res) {
        var clinicName = req.body.clinicName;
        var ownerEmail = req.body.ownerEmail;
        var ownerPassword = req.body.ownerPassword;
        var clinicAddress = req.body.clinicAddress;
        var openTime = req.body.openTime;
        var closeTime = req.body.closeTime;

        //make sure all parameters are non empty
        if(textUtils.isEmpty(clinicName) ||
            textUtils.isEmpty(ownerEmail) ||
            textUtils.isEmpty(ownerPassword) ||
            textUtils.isEmpty(clinicAddress) ||
            textUtils.isEmpty(openTime) ||
            textUtils.isEmpty(closeTime)) {
            return res.status(400).json({error: "You left at least 1 parameter empty"});
        }

        //check if email is already in use
        Clinic.findOne({"email":ownerEmail}, function (err, clinic) {
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
            newClinic.dateCreated = Date.now();
            newClinic.save(function (err, doc) {
                if (err) {
                    return serverError(res);
                }
                var token = tokenUtils.generateTokenFromDocument(doc);
                return res.json({token: token});
            });
        });
    });

    /*app.post('/api/patient/signup', restPatient.postSignup);

    app.post('/api/clinic/login', restClinic.getLoginToken);

    //app.post('/api/patient/login', restPatient.getLoginToken);

   // app.get('/api/clinics/*', tokenUtils.getPatientFromToken());

    app.get('/api/patient/*', restPatient.verifyToken);

    app.get('/api/clinic', restClinic.getClinics);*/

}

var serverError = function(res) {
    res.status(500).json({error: "database error"});
};