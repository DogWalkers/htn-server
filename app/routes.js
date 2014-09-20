/**
 * Created by Sahil Jain on 20/09/2014.
 */

var tokenUtils = require("../utils/tokenutils");

module.exports = function (server) {
    var app = server.app;
    app.use(accessControl);
    createRestEndpoints(app);
};

function createRestEndpoints(app) {

    var restClinic = require('../app/restClinicOperations');
    var restPatient = require('../app/restPatientOperations');

    app.all('*', accessControl);

    app.post('/api/clinic/signup', restClinic.signup);

    app.post('/api/patient/signup', restPatient.signup);

    app.post('/api/clinic/login', restClinic.login);

    app.post('/api/patient/login', restPatient.login);

    app.get('/api/clinic/all', isValidPatient, restClinic.getAll);

    app.put('/api/patient/addtoqueue/:clinicId', restPatient.addToQueue);

    //app.get('/api/patient/*', restPatient.verifyToken);

    //app.get('/api/clinic', restClinic.getClinics);

}

var serverError = function(res) {
    res.status(500).json({error: "database error"});
};

var isValidPatient = function (req, res, next) {

  var token = req.query.token || req.body.token;
  tokenUtils.getPatientFromToken(token, function(err, patient) {
      if(err || !patient) {
          res.status(401).json({error: "invalid token"});
      } else {
          next();
      }
  });

};

var accessControl = function (req, res, next) { //TODO REMOVE THIS BEFORE DEPLOYING
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    next();
};