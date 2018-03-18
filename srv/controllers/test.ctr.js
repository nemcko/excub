/**
 * @module Test Controller
 */

'use strict';

/** Module objects. */
var crud = require('../libs/crud.js'),
    root = {};

/**
 * Controller class.
 * @class
 */
var Controller = function(obj) {
    root = obj;
};

/*
 * @property {object} Controller.model  - Data model.
 */
Controller.prototype.model = require('../models/test.mod.js');

/*
 * Object type.
 * @method Controller.objectType
 */
Controller.prototype.objectType = function () {
    return 'test';
}

/*
 * Where condition.
 * @method Controller.whereCond
 * @param req {Object} Request object
 */
Controller.prototype.whereCond = function(req) {
    if (req.body.qparam && req.body.qparam.qvalue) {
        return "type ='" + Controller.prototype.objectType() + "' AND name LIKE '" + req.body.qparam.qvalue + "%'";
    } else {
        return "type ='" + Controller.prototype.objectType() + "'";
    }
}

/*
 * Assign data fields into model.
 * @method Controller.assignData
 * @param fields {Array} fields of data model
 * @param indata {Array} web request fields
 */
Controller.prototype.assignData = function(fields, indata) {
    fields.type = indata.type;
    fields.name = indata.name;
    fields.iata = indata.iata;
    fields.icao = indata.icao;
    fields.callsign = indata.callsign;
    fields.country = indata.country;
};

/*
 * List of fields.
 * @method Controller.list
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.read = function(req, res) {
    crud.read(Controller, req, function(err, retval) {
        if (err) return res.status(err).json({ err: err });
        res.status(202).json(retval);
    });
}

/*
 * Create data record.
 * @method Controller.create
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.create = function(req, res) {
    return crud.create(Controller, req, function(err, retval) {
        if (err) return res.status(err).json({ err: err });
        res.status(202).json(retval);
    });
}

/*
 * Update fields data.
 * @method Controller.update
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.update = function(req, res) {
    return crud.update(Controller, req, function(err, retval) {
        if (err) return res.status(err).json({ err: err });
        res.status(202).json('o.k.');
    });
}

/*
 * Delete fields collection.
 * @method Controller.delete
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.delete = function(req, res) {
    return crud.delete(Controller, req, function(err, retval) {
        if (err) return res.status(err).json({ err: err });
        res.status(202).json(retval);
    });
}


Controller.prototype.tst = function (req, res) {
    res.send(req.params);
}


/** Export controller. */
module.exports = exports = function(server) {
    return new Controller(server);
}