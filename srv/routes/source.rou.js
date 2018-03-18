/**
 * @module Route Source module 
 * @description Source module routing for Express.
 */

'use strict';

/*
 * Export routes for RESTfull interface.
 * @param app {Object} Express js application object.
 * @param ctrls {Object} Controller collection.
 */
module.exports = function(app, ctrls) {
    app.get('/source/:page/:limit', ctrls.isAuthenticated, ctrls.source.read);
    app.post('/source/:page/:limit', ctrls.isAuthenticated, ctrls.source.read);
    app.post('/source/:limit', ctrls.isAuthenticated, ctrls.source.create);
    app.put(['/source/:id', '/source/:id/:limit'], ctrls.isAuthenticated, ctrls.source.update);

    app.post('/removesource/:id/:limit', ctrls.isAuthenticated, ctrls.source.delete);
    app.post('/sourceid/:id', ctrls.isAuthenticated, ctrls.source.sourceid);
    app.post('/persinsour/:page/:limit', ctrls.isAuthenticated, ctrls.source.persinsour);
    app.post('/sourceclean', ctrls.isAuthenticated, ctrls.source.sourceclean);
    app.post('/sourcekeyword', ctrls.isAuthenticated, ctrls.source.sourcekeyword);
    app.post('/sourcedelete', ctrls.isAuthenticated, ctrls.source.sourcedelete);
    app.post('/sourcedelall', ctrls.isAuthenticated, ctrls.source.sourcedelall);
    app.post('/sourcedelexc', ctrls.isAuthenticated, ctrls.source.sourcedelexc);
    app.post('/getdetail', ctrls.isAuthenticated, ctrls.source.getdetail);

}