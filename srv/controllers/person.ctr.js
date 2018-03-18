/**
 * @module Person Controller
 */

'use strict';

/** Module objects. */
var async = require("async")
  , crud = require('../libs/crud.js')
  , config = require('../libs/config')
  , db = require('../libs/db')
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
Controller.prototype.model = require('../models/person.mod.js');

/*
 * Object type.
 * @method Controller.objectType
 */
Controller.prototype.objectType = function () {
    return 'person';
}

/*
 * Where condition.
 * @method Controller.whereCond
 * @param req {Object} Request object
 */
Controller.prototype.whereCond = function (req) {
    var query = "type ='" + Controller.prototype.objectType() + "'";
    if (req.body.qparam && req.body.qparam.qtype) {
        query += " AND source = '" + req.body.qparam.qtype + "'";
    } else {
        if (req.body.qparam && req.body.qparam.qvalue) {
            query += " AND note LIKE '%" + req.body.qparam.qvalue + "%'";
        }
    }
    return query;
}

/*
 * Assign data fields into model.
 * @method Controller.assignData
 * @param fields {Array} fields of data model
 * @param indata {Array} web request fields
 */
Controller.prototype.assignData = function(fields, indata) {
    fields.name = indata.name;
    fields.note = indata.note;
    
    if (indata.details) {
        if (!fields.details) fields.details = {};
        fields.details.first_name = indata.details.first_name;
        fields.details.middle_name = indata.details.middle_name;
        fields.details.last_name = indata.details.last_name;
        fields.details.gender = indata.details.gender;
        fields.details.birth_date = indata.details.birth_date;
        fields.details.country = indata.details.country;
        fields.details.identification_type = indata.details.identification_type;
        fields.details.identification_number = indata.details.identification_number;
    }
        
    fields.source = indata.source;
    fields.created = indata.created;
    fields.source_ids = indata.source_ids;

    if (!fields.created) {
        fields.created = db.getDateString();
    }
};

/*
 * List of fields.
 * @method Controller.list
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.read = function (req, res) {
    var conditions = {}
      , numObjects = true
      , retval = {
            pageNumber: Math.max(1, parseInt(req.params.page)),
            pageLimit: parseInt(req.params.limit),
            pageCount: 0,
            items: []
        };
    
    if (req.body.search || req.query.search) {
        conditions = self.prototype.whereCond(req);
    }
    
    if (!retval.pageLimit) {
        return done(err, retval);
    }
    

    async.series([
        function (callback) {
            db.query("SELECT COUNT(*) FROM `" + config.bucket + "` WHERE " + Controller.prototype.whereCond(req) + ";", function (err, result) {
                if (err) return callback(400, err);
                retval.pageCount = Math.max(1, Math.ceil(result[0].$1 / retval.pageLimit));
                retval.pageNumber = Math.max(1, Math.min(retval.pageNumber, retval.pageCount));
                numObjects = result[0].$1;
                callback();
            });
        },
        function (callback) {
            var fieldnames = [];
            for (var f in Controller.prototype.model.schema.fields) {
                if (Controller.prototype.model.schema.fields.hasOwnProperty(f)) {
                    if (Controller.prototype.model.schema.fields[f].name == '_id') {
                        fieldnames.push("META(`" + config.bucket + "`).id");
                    } else {
                        fieldnames.push(Controller.prototype.model.schema.fields[f].name);
                    }
                }
            }
            

            db.query("SELECT " + fieldnames.join(",") + " FROM `" + config.bucket + "`" +
                    " WHERE " + Controller.prototype.whereCond(req) +
                    " ORDER BY _id "+
                    " OFFSET " + Math.max(0, (isNaN(parseInt(retval.pageNumber))?0:parseInt(retval.pageNumber) - 1)) * retval.pageLimit +
                    " LIMIT " + retval.pageLimit +
                    " ; ",
                    function (err, result) {
                if (err) return callback(400, err);
                    retval.items= result;
                    callback();
                });
        },
        function (callback) {
            async.each(retval.items, function (ritem, callback1) {
                db.query("SELECT color FROM `" + config.bucket + "` WHERE type ='alert' AND person_id='" + ritem.id + "'; ", function (err, cres) {
                    if (cres && cres[0] && cres[0].color) {
                        ritem['alertfld'] = cres[0].color;
                    }
                    //retval.items.push(ritem);
                    callback1();
                });
            }, function (err) {
                callback();
            });

        }
    ], function (err, msg) {
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


/** Export controller. */
module.exports = exports = function(server) {
    return new Controller(server);
}