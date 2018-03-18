/**
 * @module Route Person module 
 * @description Person module routing for Express.
 */

'use strict';

/*
 * Export routes for RESTfull interface.
 * @param app {Object} Express js application object.
 * @param ctrls {Object} Controller collection.
 */
module.exports = function(app, ctrls) {
    app.get('/person/:page/:limit', ctrls.isAuthenticated, ctrls.person.read);
    app.post('/person/:page/:limit', ctrls.isAuthenticated, ctrls.person.read);
    app.post('/person/:limit', ctrls.isAuthenticated, ctrls.person.create);
    app.put('/person/:id', ctrls.isAuthenticated, ctrls.person.update);
    app.delete('/person/:id/:limit/:token', ctrls.isAuthenticated, ctrls.person.delete);
}