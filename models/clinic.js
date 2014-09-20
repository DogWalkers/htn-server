/**
 * Created by Sahil Jain on 20/09/2014.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var clinicSchema = mongoose.Schema({
    clinicName: String,
    ownerEmail: {type: String, lowercase: true},
    ownerPassword: String,
    clinicAddress: String,
    openTime: Number,
    closeTime: Number,
    dateCreated: { type: Date, default: Date.now }
});

clinicSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

clinicSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.ownerPassword);
};

module.exports = mongoose.model('Clinic', clinicSchema);