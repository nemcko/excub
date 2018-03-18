/**
 * @module Route Face module 
 * @description Face module routing for Express.
 */

'use strict';

/*
 * Export routes for RESTfull interface.
 * @param app {Object} Express js application object.
 * @param ctrls {Object} Controller collection.
 */
module.exports = function(app, ctrls) {
    app.get('/face/:page/:limit', ctrls.isAuthenticated, ctrls.face.read);
    app.post('/face/:page/:limit', ctrls.isAuthenticated, ctrls.face.read);
    app.post('/face/:limit', ctrls.isAuthenticated, ctrls.face.create);
    app.put('/face/:id/:limit', ctrls.isAuthenticated, ctrls.face.update);
    app.delete('/face/:id/:limit/:token', ctrls.isAuthenticated, ctrls.face.delete);

    app.post('/sourcefaces/:page/:limit', ctrls.isAuthenticated, ctrls.face.sourcefaces);
    app.post('/sourcefdet/:page/:limit', ctrls.isAuthenticated, ctrls.face.sourcefdet);
    app.post('/person5faces/:page/:limit', ctrls.isAuthenticated, ctrls.face.person5faces);

    app.post('/sourceface/:ids/:idp', ctrls.isAuthenticated, ctrls.face.sourceface);
}