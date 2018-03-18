/**
 * @module Route Car module 
 * @description Car module routing for Express.
 */

'use strict';

/*
 * Export routes for RESTfull interface.
 * @param app {Object} Express js application object.
 * @param ctrls {Object} Controller collection.
 */
module.exports = function(app, ctrls) {
    app.get('/car/:page/:limit', ctrls.isAuthenticated, ctrls.car.read);
    app.post('/car/:page/:limit', ctrls.isAuthenticated, ctrls.car.read);
    app.post('/car/:limit', ctrls.isAuthenticated, ctrls.car.create);
    app.put('/car/:id/:limit', ctrls.isAuthenticated, ctrls.car.update);
    app.delete('/car/:id/:limit/:token', ctrls.isAuthenticated, ctrls.car.delete);
}