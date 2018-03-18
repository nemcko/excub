/**
 * @module Route Test module 
 * @description Test module routing for Express.
 */

'use strict';

/*
 * Export routes for RESTfull interface.
 * @param app {Object} Express js application object.
 * @param ctrls {Object} Controller collection.
 */
module.exports = function (app, ctrls) {  
    app.get('/tst/:page', ctrls.test.tst);
    app.post('/tst/:page', ctrls.test.tst);
    app.get('/test/:page/:limit', ctrls.test.read);
    app.post('/test/:page/:limit', ctrls.test.read);
    app.post('/test/:limit', ctrls.test.create);
    app.put('/test/:id/:limit', ctrls.test.update);
    app.delete('/test/:id/:limit/:token', ctrls.test.delete);
}