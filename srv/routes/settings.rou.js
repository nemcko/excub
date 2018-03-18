/**
 * @module Route NAS module 
 * @description NAS module routing for Express.
 */

'use strict';

/*
 * Export routes for RESTfull interface.
 * @param app {Object} Express js application object.
 * @param ctrls {Object} Controller collection.
 */
module.exports = function (app, ctrls) {  
    app.get(['/file/:name', '/file/:name/:timestamp'], ctrls.settings.nasfile);
    app.get(['/video/:name', '/video/:name/:timestamp'], ctrls.settings.nasvideo);
    app.get('/rancherconfig', ctrls.settings.rancher);
    app.post('/bgproc/:cmd', ctrls.isAuthenticated, ctrls.settings.bgproc);
}