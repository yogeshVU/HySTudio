/*globals process, console, require*/
'use strict';

var fs = require('fs'),
    config = require('./config.default'),
    validateConfig = require('webgme/config/validator');

config.authentication.jwt.privateKey = '/webgmeshare/token_keys/private_key';
config.authentication.jwt.publicKey = '/webgmeshare/token_keys/public_key';

try {
    if ((fs.lstatSync(config.authentication.jwt.privateKey).isFile() &&
        fs.lstatSync(config.authentication.jwt.publicKey).isFile()) === false) {
        console.error('token keys exists but both are not files (?)');
        process.exit(1);
    }
} catch (e) {
    if (e.code = 'ENOENT') {
        console.error('Token keys did not exist - will generate them (key size 1024)');
        var NodeRSA = require('node-rsa'),
            key = new NodeRSA({b: 1024});
        fs.writeFileSync(config.authentication.jwt.privateKey, key.exportKey('pkcs1-private'));
        fs.writeFileSync(config.authentication.jwt.publicKey, key.exportKey('pkcs8-public'));
    }
}

config.blob.fsDir = '/webgmeshare/blob-local-storage';

// This is the exposed port from the docker container.
config.server.port = 8001;

config.mongo.uri = 'mongodb://mongo:27017/hysteditor-release';
config.authentication.publicOrganizations = ['hyst-public'];
config.authentication.enable = true;
config.authentication.allowGuests = false;
config.authentication.allowUserRegistration = false;
config.authentication.inferredUsersCanCreate = true;
config.authentication.adminAccount = 'admin';

validateConfig(config);
module.exports = config;

