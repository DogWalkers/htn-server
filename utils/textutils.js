/**
 * Created by Sahil Jain on 20/09/2014.
 */
exports.isEmpty = function isNullOrEmpty(string) {
    if (!string) return true;
    return !/\S/.test(string);
};