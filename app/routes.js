/**
 * Created by Sahil Jain on 20/09/2014.
 */

module.exports = function (server) {
    var app = server.app;
    createRestEndpoints(app);
};

function createRestEndpoints(app) {

    var restClinic = require('../app/restClinicOperations');
    var restPatient = require('../app/restPatientOperations');

    app.all('*', function (req, res, next) { //TODO REMOVE THIS BEFORE DEPLOYING
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "application/JSON");
        next();
    });

    app.post('/api/clinic/signup', restClinic.signup);

    app.post('/api/patient/signup', restPatient.signup);

    app.post('/api/clinic/login', restClinic.login);

    app.post('/api/patient/login', restPatient.login);

    app.get('/api/clinic/all', isValidToken, function(req, res) {
        res.json({message:"not implemented yet"});
    });

    //app.get('/api/patient/*', restPatient.verifyToken);

    //app.get('/api/clinic', restClinic.getClinics);

}

var serverError = function(res) {
    res.status(500).json({error: "database error"});
};

var isValidToken = function (req, res, next) {
  var token = req.params.token;

};