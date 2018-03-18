/**
 * @module Route Plate module 
 * @description Plate module routing for Express.
 */

'use strict';

/*
 * Export routes for RESTfull interface.
 * @param app {Object} Express js application object.
 * @param ctrls {Object} Controller collection.
 */
module.exports = function(app, ctrls) {
    app.get('/plate/:page/:limit', ctrls.isAuthenticated, ctrls.plate.read);
    app.post('/plate/:page/:limit', ctrls.isAuthenticated, ctrls.plate.read);
    app.post('/plate/:limit', ctrls.isAuthenticated, ctrls.plate.create);
    app.put('/plate/:id/:limit', ctrls.isAuthenticated, ctrls.plate.update);
    app.delete('/plate/:id/:limit/:token', ctrls.isAuthenticated, ctrls.plate.delete);
}