const remote = require('electron').remote;
const shell  = require('electron').shell;
const Viewer = require(`${__dirname}/Viewer.js`);

var viewer = new Viewer(shell);
