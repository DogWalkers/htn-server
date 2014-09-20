/**
 * Created by Sahil Jain on 20/09/2014.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var patientSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {type: String, lowercase: true},
    password: String,
    homeAddress: String,
    age: Number,
    sex: String,
    healthCardNumber: String,
    isInQueue: {type: Boolean, default: false},
    clinicHistory: [{date: Date, text: String}],
    dateCreated: { type: Date, default: Date.now }
});

patientSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

patientSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Patient', patientSchema);