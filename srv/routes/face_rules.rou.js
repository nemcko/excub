/**
 * @module Route Face rules module 
 * @description Face module routing for Express.
 */

'use strict';

/*
 * Export routes for RESTfull interface.
 * @param app {Object} Express js application object.
 * @param ctrls {Object} Controller collection.
 */
module.exports = function(app, ctrls) {
    app.get('/face_rules/:page/:limit', ctrls.isAuthenticated, ctrls.face_rules.read);
    app.post('/face_rules/:page/:limit', ctrls.isAuthenticated, ctrls.face_rules.read);
    app.post('/face_rules/:limit', ctrls.isAuthenticated, ctrls.face_rules.create);
    app.put('/face_rules/:id/:limit', ctrls.isAuthenticated, ctrls.face_rules.update);
    app.delete('/face_rules/:id/:limit/:token', ctrls.isAuthenticated, ctrls.face_rules.delete);
    
    app.post('/personfaces/:id/:limit', ctrls.isAuthenticated, ctrls.face_rules.personfaces);
    app.post('/facefaces/:page/:limit', ctrls.isAuthenticated, ctrls.face_rules.facefaces);
    app.post('/addfacelist/:page/:limit', ctrls.isAuthenticated, ctrls.face_rules.addfacelist);
    app.post('/addfaceface/:id', ctrls.isAuthenticated, ctrls.face_rules.addfaceface);
    app.post('/delfaceface/:id', ctrls.isAuthenticated, ctrls.face_rules.delfaceface);
}