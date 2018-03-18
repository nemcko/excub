/**
 * @module Route Alerts module 
 * @description Alerts module routing for Express.
 */

'use strict';

/*
 * Export routes for RESTfull interface.
 * @param app {Object} Express js application object.
 * @param ctrls {Object} Controller collection.
 */
module.exports = function(app, ctrls) {
    app.get('/alerts/:page/:limit', ctrls.isAuthenticated, ctrls.alerts.read);
    app.post('/alerts/:page/:limit', ctrls.isAuthenticated, ctrls.alerts.read);
    app.post('/alerts/:limit', ctrls.isAuthenticated, ctrls.alerts.create);
    app.put('/alerts/:id/:limit', ctrls.isAuthenticated, ctrls.alerts.update);
    app.delete('/alerts/:id/:limit/:token', ctrls.isAuthenticated, ctrls.alerts.delete);

    app.post('/alertchange/:pid', ctrls.isAuthenticated, ctrls.alerts.alertchange);

}