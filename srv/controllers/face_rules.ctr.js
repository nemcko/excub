/**
 * @module Face rules Controller
 */

'use strict';

/** Module objects. */
var async = require("async")
  , db = require('../libs/db')
  , config = require('../libs/config')
  , crud = require('../libs/crud.js')
  , root = {}
  ;

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
Controller.prototype.model = require('../models/face_rules.mod.js');

/*
 * Object type.
 * @method Controller.objectType
 */
Controller.prototype.objectType = function () {
    return 'face_rules';
}

/*
 * Where condition.
 * @method Controller.whereCond
 * @param req {Object} Request object
 */
Controller.prototype.whereCond = function (req) {
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
 * Create custom key.
 * @method Controller.customId
 * @param req {Object} Request object
 */
Controller.prototype.customId = function (req) {
    return req.body.face_id_1 + req.body.face_id_2;
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

Controller.prototype.loadface = function (faceid, selitems, retval, cb) {
    async.series([
        function (callback) {
            db.query("SELECT META(`" + config.bucket + "`).id, face_id_1,face_id_2,weight,source FROM `" + config.bucket + "`" +
                    " WHERE type ='face_rules' AND face_id_1='" + faceid + "' ; ",
                    function (err, result) {
                if (err) return callback(400, err);
                
                for (var n in result) {
                    if (result[n].face_id_1 === faceid && result[n].face_id_2) {
                        selitems[result[n].id] = { idrule: result[n].id, id: result[n].face_id_2, weight: result[n].weight, source: result[n].source };
                    }
                }
                
                callback();
            });
        },
        function (callback) {
            db.query("SELECT META(`" + config.bucket + "`).id, face_id_1,face_id_2,weight,source FROM `" + config.bucket + "`" +
                    " WHERE type ='face_rules' AND face_id_2='" + faceid + "' ; ",
                    function (err, result) {
                if (err) return callback(400, err);
                
                for (var n in result) {
                    if (result[n].face_id_2 === faceid && result[n].face_id_1) {
                        selitems[result[n].id] = { idrule: result[n].id, id: result[n].face_id_2, weight: result[n].weight, source: result[n].source };
                    }
                }
                
                callback();
            });
        }
    ], function (err, msg) {
        if (err) return cb(err);
        
        retval.pageCount = Math.max(1, Math.ceil(retval.items.length / retval.pageLimit));
        retval.pageNumber = Math.max(1, Math.min(retval.pageNumber, retval.pageCount));
        cb();
    });

}

/*
 * List of detected faces of person.
 * @method Controller.personfaces
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.personfaces = function (req, res) {
    var retval = {
        pageLimit: 2000,
        items: []
    }
    , selitems = {}
    ;
    
    db.query("SELECT META(`" + config.bucket + "`).id, source_id, person_id, thumbnail_url FROM `" + config.bucket + "`" +
        " WHERE type='face' AND person_id='" + req.body.qparam.qparent + "'  order by created desc; ",
        function (err, result) {
        async.map(result, function (item, next) {
            Controller.prototype.loadface(item.id, selitems, retval, next);
        }, function (err, result) {
            if (err) return res.status(err).json({ err: err });

            async.mapValues(selitems, function (item, key, next) {
                db.read(item.id, function (err, result) {
                    if (err) {
                        next(err);
                    } else {
                        var newitem = {
                            idrule: item.idrule,
                            id: item.id,
                            weight: item.weight,
                            source: item.source,
                            source_id: result.value.source_id,
                            person_id: result.value.person_id,
                            thumbnail_url: result.value.thumbnail_url
                        };
                        retval.items.push(newitem);
                        next(null, item);
                    }
                });
            }, function (err) {
                if (err) return res.status(err).json({ err: err });              
                retval.pageCount = Math.max(1, Math.ceil(retval.items.length / retval.pageLimit));
                retval.pageNumber = Math.max(1, Math.min(retval.pageNumber, retval.pageCount));          
                res.status(202).json(retval);
            });

        });
    });
}



/*
 * List of faces.
 * @method Controller.facefaces
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.facefaces = function(req, res) {
    var retval = {
        pageNumber: Math.max(1, parseInt(req.params.page)),
        pageLimit: parseInt(req.params.limit),
        pageCount: 0,
        items: []
    }
    , selitems = {}
    ;
    
    
    if (!retval.pageLimit) {
        return res.status(202).json(retval);
    }
    
    Controller.prototype.loadface(req.body.qparam.qparent, selitems, retval, function (err) {
        async.mapValues(selitems, function (item, key, next) {
            db.read(item.id, function (err, result) {
                if (err) {
                    next(err);
                } else {
                    var newitem = {
                        idrule: item.idrule,
                        id: item.id,
                        weight: item.weight,
                        source: item.source,
                        source_id: result.value.source_id,
                        person_id: result.value.person_id,
                        thumbnail_url: result.value.thumbnail_url
                    };
                    retval.items.push(newitem);
                    next(null, item);
                }
            });
        }, function (err) {
            if (err) return res.status(err).json({ err: err });
            retval.pageCount = Math.max(1, Math.ceil(retval.items.length / retval.pageLimit));
            retval.pageNumber = Math.max(1, Math.min(retval.pageNumber, retval.pageCount));
            res.status(202).json(retval);
        });

    });
    
}

/*
 * List of add faces.
 * @method Controller.addfacelist
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.addfacelist = function (req, res) {
    var retval = {
        pageNumber: Math.max(1, parseInt(req.params.page)),
        pageLimit: parseInt(req.params.limit),
        pageCount: 0,
        items: []
    }
    , wherecond1 = "type ='face_rules' AND face_id_1='--'"
    , wherecond2 = "type ='face_rules' AND face_id_2='--'"
    , selitems = []
    ;
    
    if (!retval.pageLimit) {
        return res.status(202).json(retval);
    }
    if (req.body.qparam) {
        if (req.body.qparam.qvalue && req.body.qparam.qvalue.faceid) {
            wherecond1 = "type ='face_rules' AND face_id_1='" + req.body.qparam.qvalue.faceid + "'"
            wherecond2 = "type ='face_rules' AND face_id_2='" + req.body.qparam.qvalue.faceid + "'"
        }
        if (req.body.qparam.qvalue && req.body.qparam.qvalue.faceweight) {
            wherecond1 += " AND weight = " + req.body.qparam.qvalue.faceweight + "";
            wherecond2 += " AND weight = " + req.body.qparam.qvalue.faceweight + "";
        }
    }
    
    console.log("SELECT META(`" + config.bucket + "`).id, face_id_1,face_id_2,weight,source FROM `" + config.bucket + "` WHERE " + wherecond1 + ";");

    async.series([
        function (callback) {
            async.parallel([
                function (callback1) {
                    db.query("SELECT META(`" + config.bucket + "`).id, face_id_1,face_id_2,weight,source FROM `" + config.bucket + "` WHERE " + wherecond1 + ";", function (err, result) {
                        callback1(err,result);
                    });
                },
                function (callback1) {
                    db.query("SELECT META(`" + config.bucket + "`).id, face_id_1,face_id_2,weight,source FROM `" + config.bucket + "` WHERE " + wherecond2 + ";", function (err, result) {
                        callback1(err, result);
                    });
                },
            ],
            function (err, results) {
                for (var n in results[0]) {
                    selitems.push({ idrule: results[0][n].id, id: results[0][n].face_id_2, weight: results[0][n].weight, source: results[0][n].source });
                }
                for (var n in results[1]) {
                    selitems.push({ idrule: results[1][n].id, id: results[1][n].face_id_1, weight: results[1][n].weight, source: results[1][n].source });
                }
                callback();
            });
            
        },
        function (callback) {
            async.map(selitems, function (item, next) {
                db.read(item.id, function (err, result) {
                    if (err) {
                        next();
                    } else {
                        var newitem = {
                            idrule: item.idrule,
                            id: item.id,
                            weight: item.weight,
                            source: item.source,
                            thumbnail_url: result.value.thumbnail_url
                        };
                        retval.items.push(newitem);
                        next(null, item);
                    }
                });
            }, callback);
        }
    ], function (err, msg) {
        if (err) return res.status(err).json({ err: err });
        res.status(202).json(retval);
    });

}

/*
 * Set person`s face.
 * @method Controller.addfaceface
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.addfaceface = function (req, res) {
    /*  
  Script spravi nasledovne kroky:
1) Preveri ci document typu face_rules s id face_id_face_id (nizsie cislo je vzdy prve) neexistuje. Ak ano tak update inak creation
2) Vlozi 2 face_ids ako aj vaku
3) Hodnota "source" bude vzdy "manual"

{
  "_id": "face-1-face-2",
  "type": "face_rules",
  "face_id_1": "face-1",
  "face_id_2": "face-2",
  "weight": 851,
  "source": "manual"
}  
  
*/



    var faceid1 = req.params.id
      , faceid2 = req.body.faceid
      , num1 = faceid1.replace(/[^0-9]/g, '')
      , num2 = faceid2.replace(/[^0-9]/g, '')  
      , ruleid, facel, faceh;

    if (num1 < num2) {
        facel = faceid1;
        faceh = faceid2;
    } else {
        facel = faceid2;
        faceh = faceid1;
    }
    ruleid = facel + '-' + faceh;

    db.read(ruleid, function (err, result) {
        var item = result.value;
        if (err) {
            item = {
                type: "face_rules",
                face_id_1: facel,
                face_id_2: faceh,
                weight: req.body.faceweight,
                source: "manual"
            }
        } else {
            item['weight'] = req.body.faceweight;
            item['source'] = "manual";
        }
        console.log(ruleid);
        db.upsert(ruleid, item, function (err, result) {
            if (err) return res.status(err).json({ err: err });
            res.status(202).json('o.k.');
        });

    });
    
}

/*
 * Unset person`s face.
 * @method Controller.delfaceface
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.delfaceface = function (req, res) {
    db.remove(req.params.id, function (err, result) {
        if (err) return res.status(err).json({ err: err });
        res.status(202).json('o.k.');
    });
}



/** Export controller. */
module.exports = exports = function(server) {
    return new Controller(server);
}