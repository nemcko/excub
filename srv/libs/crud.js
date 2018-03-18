/**
 * @module CRUD helper library
 * @description CRUD utility library.
 */

'use strict';

/** Module objects. */
var async = require("async")
  , db = require('../libs/db')
  , config = require('../libs/config')
  , shortid = require('shortid')
  , uuidV1 = require('uuid/v1')
  ;



// readData helper function
var readData = function (self, req, conditions, retval, done) {
    var numObjects = true;
    
    if (!retval.pageLimit) {
        return done(err, retval);
    }

    async.series([
        function (callback) {
            db.query("SELECT COUNT(*) FROM `" + config.bucket + "` WHERE " + self.prototype.whereCond(req) + ";", function (err, result) {
                if (err) return callback(400, err);
                retval.pageCount = Math.max(1, Math.ceil(result[0].$1 / retval.pageLimit));
                retval.pageNumber = Math.max(1, Math.min(retval.pageNumber, retval.pageCount));
                numObjects = result[0].$1;
                callback();
            });
        },
        function (callback) {
            var fieldnames = [];
            for (var f in self.prototype.model.schema.fields) {
                if (self.prototype.model.schema.fields.hasOwnProperty(f)) {
                    if (self.prototype.model.schema.fields[f].name == '_id') {
                        fieldnames.push("META(`" + config.bucket + "`).id");
                    } else {
                        fieldnames.push(self.prototype.model.schema.fields[f].name);
                    }
                }
            }
            

            db.query("SELECT " + fieldnames.join(",") + " FROM `" + config.bucket + "`" +
                    " WHERE " + self.prototype.whereCond(req) +
                    " OFFSET " + Math.max(0, (isNaN(parseInt(retval.pageNumber))?0:parseInt(retval.pageNumber) - 1)) * retval.pageLimit +
                    " LIMIT " + retval.pageLimit +
                    "; ",
                    function (err, result) {
                if (err) return callback(400, err);
                retval.items = result;
                callback();
            });

        }
    ], function (err, msg) {
        done(err, retval);
    });
}

/*
 * Read model data.
 * @method read
 * @param self {object} Controller object
 * @param req {Object} Request object
 * @param done Callback function
 */
exports.read = function (self, req, done) {
    var conditions = {},
        retval = {
            pageNumber: Math.max(1, parseInt(req.params.page)),
            pageLimit: parseInt(req.params.limit),
            pageCount: 0,
            items: []
        };
    
    if (req.body.search || req.query.search) {
        conditions = self.prototype.whereCond(req);
    }
    return readData(self, req, conditions, retval, done);
}


/*
 * Create new model data.
 * @method create
 * @param self {object} Controller object
 * @param req {Object} Request object
 * @param done Callback function
 */
exports.create = function (self, req, done) {
    var conditions = {}
      , retval = {
            pageNumber: 1,
            pageLimit: (req.params.limit ? parseInt(req.params.limit) : 10),
            pageCount: 0,
            items: []
        }
      , newId = ''
      , items = {}
      ;


    if (req.body.search || req.query.search) {
        conditions = self.prototype.whereCond(req);
    }
    
    async.series([
        function (callback) {
            db.counter(self.prototype.objectType(), function (err, num) {
                if (self.prototype.customId) {
                    newId = self.prototype.customId(req);
                } else {
                    //shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=@');
                    //newId = self.prototype.objectType().charAt(0).toUpperCase() + self.prototype.objectType().slice(1) + '_' + shortid.generate();
                    newId = self.prototype.objectType() + '-' + num;
                }
                req.body.id = newId;
                callback(err);
            });
        },
        function (callback) {
            self.prototype.assignData(items, req.body);
            items.type = self.prototype.objectType();

            callback();
        },
        function (callback) {
            db.insert(newId, items, callback);
        },
        function (callback) {
            readData(self, req, conditions, retval, callback);
        }
    ],
    function (err, msg) {
        done(err, retval);
    });
}


/*
 * Update model data.
 * @method update
 * @param self {object} Controller object
 * @param req {Object} Request object
 * @param done Callback function
 */
exports.update = function (self, req, done) {
    var retval = {
        items: []
    }
     , items = {}
     ;
    async.series([
        function (callback) {
            self.prototype.assignData(items, req.body);
            items.type = self.prototype.objectType();

            callback();
        },
        function (callback) {
            db.upsert(req.params.id, items, callback);
        }

    ], function (err, msg) {
        done(err, retval);
    });
}

/*
 * Delete model data.
 * @method delete
 * @param self {object} Controller object
 * @param req {Object} Request object
 * @param done Callback function
 */
exports.delete = function (self, req, done) {
    var conditions = {},
        retval = {
            pageNumber: 1,
            pageLimit: (req.params.limit ? parseInt(req.params.limit) : 0),
            pageCount: 0,
            items: []
        };
    
    if (req.body.search || req.query.search) {
        conditions = self.prototype.whereCond(req);
    }
    async.series([
        function (callback) {
            db.remove(req.params.id,callback);
        },
        function (callback) {
            readData(self, req, conditions, retval, callback);
        }
    ], function (err, msg) {
        done(err, retval);
    });
}