// you can remove this line once you know this file is picked up
console.log('### using webgme config from config.deployment.js ###');

// require your default configuration
var config = require('./config.default');

// enable authentication
config.authentication.enable = true;

// by default non-authenticated users are authenticated as 'guest' this can be disabled
config.authentication.allowGuests = false;

// this allows users created via the cps-vo route to create new projects
// which may or may not suite your deployment (but most likely you want this enabled)
config.authentication.inferredUsersCanCreate = true;

// disable user registration
config.authentication.allowUserRegistration = false;

// this assumes the keys are placed outside the webgme-app folder,
// as mentioned in the key generation section ../../token_keys directory
config.authentication.jwt.privateKey = __dirname + '/../../token_keys/private_key';
config.authentication.jwt.publicKey = __dirname + '/../../token_keys/public_key';

//Login and logout URLs should point to the CPS_VO_GROUP
config.authentication.logInUrl = 'http://cps-vo.org/group/AA-VO'
config.authentication.logOutUrl = 'http://cps-vo.org/group/AA-VO'

// -------------------------------------
config.plugin.allowServerExecution = true;

// Seeds
config.seedProjects.enable = true;
config.seedProjects.basePaths = ["./seeds"]

// Icons
// config.visualization.svgDirs = ['./icons/svg'];
//config.visualization.svgDirs.push("./icons/svg");

config.seedProjects.basePaths = [__dirname + '/../src/seeds/HySTBase'];
//config.mongo.uri = 'mongodb://mongo:27017/hysteditor-docker';

config.server.port = 8080;

// finally make sure to export the augmented config
module.exports = config;
