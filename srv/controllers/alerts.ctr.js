/**
 * @module Alerts Controller
 */

'use strict';

/** Module objects. */
var async = require("async")
  , db = require('../libs/db')
  , config = require('../libs/config')
  , shortid = require('shortid')
  , uuidV1 = require('uuid/v1')
  , crud = require('../libs/crud.js')
  , root = {};

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
Controller.prototype.model = require('../models/alerts.mod.js');

/*
 * Object type.
 * @method Controller.objectType
 */
Controller.prototype.objectType = function () {
    return 'alert';
}

/*
 * Where condition.
 * @method Controller.whereCond
 * @param req {Object} Request object
 */
Controller.prototype.whereCond = function(req) {
    return "type ='" + Controller.prototype.objectType() + "'";
}

/*
 * Assign data fields into model.
 * @method Controller.assignData
 * @param fields {Array} fields of data model
 * @param indata {Array} web request fields
 */
Controller.prototype.assignData = function(fields, indata) {
    fields.type = indata.type;
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

/*
 * Alert change.
 * @method Controller.alertchange
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.alertchange = function (req, res) {
    var newId = '';
    db.query("SELECT META(`" + config.bucket + "`).id,* FROM `" + config.bucket + "`" +
        " WHERE type ='" + Controller.prototype.objectType() + "' AND person_id='" + req.params.pid + "'; ",
        function (err, result) {
        if (err) return res.status(err).json({ err: err });
        
        if (result && result[0]) {
            if (req.body.alertfld) {
                result[0][config.bucket].color = req.body.alertfld;
                db.upsert(result[0].id, result[0][config.bucket], function (err) {
                    if (err) return res.status(err).json({ err: err });
                    res.status(202).json('o.k.');
                });
            } else {
                db.remove(result[0].id, function (err) {
                    if (err) return res.status(err).json({ err: err });
                    res.status(202).json('o.k.');
                });
            }
        } else {
            async.series([
                function (callback) {
                    db.counter(Controller.prototype.objectType(), function (err, num) {
                        if (Controller.prototype.customId) {
                            newId = Controller.prototype.customId(req);
                        } else {
                            newId = Controller.prototype.objectType() + '-' + num;
                        }
                        req.body.id = newId;
                        callback(err);
                    });
                },
                function (callback) {
                    var items = {
                        type: Controller.prototype.objectType(),
                        person_id: req.params.pid,
                        color: req.body.alertfld
                    }
                    db.insert(newId, items, callback);
                }
            ],
            function (err, msg) {
                if (err) return res.status(err).json({ err: err });
                res.status(202).json('o.k.');
            });
        }

    });
}

/** Export controller. */
module.exports = exports = function(server) {
    return new Controller(server);
}