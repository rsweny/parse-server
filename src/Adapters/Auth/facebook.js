// Helper functions for accessing the Facebook Graph API.
var https = require('https');
var Parse = require('parse/node').Parse;

var _logger = require('./logger');
var _logger2 = _interopRequireDefault(_logger);
var _util = require('util');
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Returns a promise that fulfills iff this user id is valid.
function validateAuthData(authData) {
  return graphRequest('me?fields=id&access_token=' + authData.access_token)
    .then((data) => {

      if (data == null) {
        throw new Parse.Error( Parse.Error.OBJECT_NOT_FOUND, 'Facebook auth was not returned for this user.');
      }

      if (data.id == authData.id) {
        return;
      }
      console.warn("IN: " + JSON.stringify(authData));
      console.log("RETURN: " + JSON.stringify(data));
      _logger2.default.error('facebook validateAuthData' + (0, _util.inspect)(data), { error: data });
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Facebook auth is invalid for this user. ' + data.id + " " + authData.id);
    });
}

// Returns a promise that fulfills iff this app id is valid.
function validateAppId(appIds, authData) {
  var access_token = authData.access_token;
  if (!appIds.length) {
    throw new Parse.Error(
      Parse.Error.OBJECT_NOT_FOUND,
      'Facebook auth is not configured.');
  }
  return graphRequest('app?access_token=' + access_token)
    .then((data) => {

      if (data == null) {
        throw new Parse.Error( Parse.Error.OBJECT_NOT_FOUND, 'Facebook appId was not returned for this user.');
      }

      if (appIds.indexOf(data.id) != -1) {
        return;
      }

      console.warn("IN: " + JSON.stringify(authData));
      console.log("RETURN: " + JSON.stringify(data));
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Facebook appId is invalid for this user. ' + data.id);
    });
}

// A promisey wrapper for FB graph requests.
function graphRequest(path) {
  return new Promise(function(resolve, reject) {
    https.get('https://graph.facebook.com/v2.5/' + path, function(res) {
      var data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        data = JSON.parse(data);
        resolve(data);
      });
    }).on('error', function() {
      reject('Failed to validate this access token with Facebook.');
    });
  });
}

module.exports = {
  validateAppId: validateAppId,
  validateAuthData: validateAuthData
};
