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

    app.post('/api/clinic/login', restClinic.login);

    app.get('/api/clinic/all', isValidPatient, restClinic.getAll);

    app.post('/api/patient/signup', restPatient.signup);

    app.post('/api/patient/login', restPatient.login);

    app.put('/api/patient/queue/:clinicId', restPatient.addToQueue);

    app.delete('/api/patient/queue/:clinicId', restPatient.deleteSelfFromQueue);

    app.get('/api/patient', restPatient.getSelf);

    app.get('/api/clinic', restClinic.getSelf);

    app.delete('/api/clinic/queue/:patientId', restClinic.deletePatientFromQueue);

}

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