/**
 * @module Source Controller
 */

'use strict';

/** Module objects. */
var async = require("async")
  , fs = require('fs')
  , path = require('path')
  , db = require('../libs/db')
  , config = require('../libs/config')
  , crud = require('../libs/crud.js')
  , root = {}
  , videoext = ['mov', 'avi', 'mp3', 'mp4', 'webm', 'ogv', 'mpg', 'mpeg', 'm3u8']
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
Controller.prototype.model = require('../models/source.mod.js');

/*
 * Object type.
 * @method Controller.objectType
 */
Controller.prototype.objectType = function () {
    return 'source';
}

/*
 * Where condition.
 * @method Controller.whereCond
 * @param req {Object} Request object
 */
Controller.prototype.whereCond = function (req) {
    var query = "type ='" + Controller.prototype.objectType() + "' AND parent='" + (req.body.qparam.qparent || '') + "'";

    if (req.body.qparam && req.body.qparam.qtype) {
        if (req.body.qparam.qtype === 'folder') {
            query += " AND (source.source_type='folder'";
            query += " OR source.source_type = 'scan_input'";
            query += " OR source.source_type = 'scan_training'";
            query += ")";
        } else {
            query += " AND source.source_type = '" + req.body.qparam.qtype + "'";
        }
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
    
    if (indata.source) {
        if (!fields.source) fields.source = {};
        fields.source.source_link = indata.source.source_link;
        fields.source.frame_rate = indata.source.frame_rate;
        fields.source.total_frames = indata.source.total_frames;
        fields.source.source_type = indata.source.source_type || '';
        fields.source.training = indata.source.training;

        //if (indata.source_source_type)
        //    fields.source.source_type = indata.source_source_type;
    }

    if (indata.processing) {
        if (!fields.processing) fields.processing = {};
        fields.processing.rancher_configuration = indata.processing.rancher_configuration;
        fields.processing.graph_group = indata.processing.graph_group;
        fields.processing.filter_mask = indata.processing.filter_mask;
        fields.processing.skip_frames = indata.processing.skip_frames;
    }

    if (indata.output) {
        if (!fields.output) fields.output = {};
        fields.output.output_file = indata.output.output_file;
        fields.output.output_rtmp = indata.output.output_rtmp;
    }

    if (indata.training) {
        if (!fields.training) fields.training = {};
        fields.training.key_words = indata.training.key_words;
    }

    fields.parent = indata.parent;
    fields.status = indata.status;
    fields.created = indata.created;
    fields.thumbnail_url = indata.thumbnail_url;

    if (!fields.created) {
        fields.created = db.getDateString();
    }

};

var readData = function (conditions, retval, req, done) {
    var numObjects = true;
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
                    fieldnames.push(Controller.prototype.model.schema.fields[f].name);
                }
            }
            db.query("SELECT META(`" + config.bucket + "`).id," + fieldnames.join(",") + " FROM `" + config.bucket + "`" +
                " WHERE " + Controller.prototype.whereCond(req) +
                " OFFSET " + Math.max(0, (isNaN(parseInt(retval.pageNumber))?0:parseInt(retval.pageNumber) - 1)) * retval.pageLimit +
                " LIMIT " + retval.pageLimit +
                "; ",
                function (err, result) {
                if (err) return callback(400, err);
                retval.items = result;
                callback();
            });
        },
        function (callback) {
            var fnread = function (key, callback) {
                if (!key) return callback();
                db.read(key, function (err, result) {
                    if (err) return callback();
                    retval.parentFolders.unshift({ code: key, name: result.value.name });
                    return fnread(result.value.parent, callback);
                });
            }         
            if (!req.body.qparam.qparent) return callback();
            fnread(req.body.qparam.qparent, callback);
        },
    ], function (err, msg) {
        done(err, retval);
    });
}

/*
 * List of fields.
 * @method Controller.list
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.read = function(req, res) {
    var conditions = {},
        retval = {
            pageNumber: Math.max(1, parseInt(req.params.page)),
            pageLimit: parseInt(req.params.limit),
            pageCount: 0,
            items: [],
            parentFolders: [],
            qparent: ''
        };
    
    if (req.body.search || req.query.search) {
        conditions = this.prototype.whereCond(req);
    }
    readData(conditions, retval, req, function(err, retval) {
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
        Controller.prototype.checkScanFolder(req);
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
        Controller.prototype.checkScanFolder(req);
    });
}

/*
 * Load scan folder`s data.
 * @method Controller.update
 * @param req {Object} Request object
 */
Controller.prototype.checkScanFolder = function (req) {
    if (req.body.source.source_type && (req.body.source.source_type === 'scan_input' || req.body.source.source_type === 'scan_training')) {
        var startfolder = req.body.source.source_link || './'
          , startdir = path.join(config.folderNAS + (req.body.source.source_type == 'scan_input'?'/input/':'/training/') + startfolder);
        Controller.prototype.walk(req.body.id, startfolder, startfolder, startdir, function (parentId,folder, name, filePath, stat) {
            //console.log('>>>pid', parentId, 'f:', folder, 'n:', name, 'p:', filePath);
        });
    }
}
Controller.prototype.walk = function (parentId,currentFolder, currentName, currentDirPath, callback) {
    fs.readdir(currentDirPath, function (err, files) {
        if (err) return callback(err);
        files.forEach(function (name) {
            if (path.basename(name)[0] !== '.') {
                var filePath = path.join(currentDirPath, name);
                var stat = fs.statSync(filePath);
                Controller.prototype.getSourceLink(parentId, currentFolder, name, filePath, stat, function (pid) {
                    if (stat.isFile()) {
                        callback(pid,currentFolder, name, filePath, stat);
                    } else if (stat.isDirectory()) {
                        Controller.prototype.walk(pid,name, name, filePath, callback);
                    }
                });
            }
        });
    });
}
Controller.prototype.getSourceLink = function (parentId, foldername, name, filePath, stat, callback) {
    db.query("SELECT META(`" + config.bucket + "`).id FROM `" + config.bucket + "`" +
        " WHERE type='source' AND parent='" + parentId + "' AND name='" + name + "'; ", function (err, result) {
        if (err || !result.length) {
            var newId = ''
              , newItem = {}
              ;
            async.series([
                function (callback1) {
                    db.counter('source', function (err, num) {
                        newId = 'source-' + num;
                        callback1();
                    });
                },
                function (callback1) {
                    var ext = path.extname(name).substring(1)
                      , filename = filePath.replace(path.join(config.folderNAS), '').replace(new RegExp('\\\\', 'g'), '/')
                      ;
                    newItem = {
                        type: 'source',
                        name: name,
                        source: {
                            source_link: (stat.isDirectory()?name:filename),
                            source_type: (stat.isDirectory()?'folder': (videoext.indexOf(ext) >= 0?'video':'image')),
                        },
                        processing: {
                        },
                        output: {
                        },
                        training: {
                        },
                        parent: String(parentId),
                        status: 'new',
                        thumbnail_url: (videoext.indexOf(ext) >= 0?'':filename),
                        created: new Date()
                    };
                    db.insert(newId, newItem, callback1);
                }
            ],
            function (err, msg) {
                callback(newId);
            });
        } else {
            callback(result[0].id);
        }
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
 * Get source object by id.
 * @method Controller.getdetail
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.getdetail = function (req, res) {
    if (req.body.source ) {
        db.read(req.body.source, function (err, result) {
            if (err) return res.status(err).json({ err: err });
            var item = result.value;
            item.id = req.body.source;
            res.status(202).json(item);
        });
    } else {
        res.status(500).send('Bad request')
    }
}



/*
 * Get source by id.
 * @method Controller.sourceid
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.sourceid = function (req, res) {
    var retval = {};
    
    db.query("SELECT META(`" + config.bucket + "`).id,* FROM `" + config.bucket + "`" +
        " WHERE type='source' AND META(`" + config.bucket + "`).id='" + req.params.id + "'; ",
        function (err, result) {
        if (err) return res.status(err).json({ err: err });
        retval = result;
        res.status(202).json(retval);
    });
}

/*
 * List of all person`s sources.
 * @method Controller.persinsour
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.persinsour = function (req, res) {
    var retval = {
        pageNumber: Math.max(1, parseInt(req.params.page)),
        pageLimit: parseInt(req.params.limit),
        pageCount: 0,
        items: []
    }, numObjects = true, wherecond;
    
    if (!retval.pageLimit) {
        return res.status(202).json(retval);
    }
        
    wherecond = "type = 'source' AND META(`" + config.bucket + "`).id IN (SELECT RAW doc2.source_id FROM `" + config.bucket + "` AS doc2 WHERE doc2.type = 'face' AND doc2.person_id = '" + (req.body.qparam.qvalue?req.body.qparam.qvalue:'') + "' )";

    async.series([
        function (callback) {
            db.query("SELECT COUNT(*) FROM `" + config.bucket + "` WHERE " + wherecond + ";", function (err, result) {
                if (err) return callback(400, err);
                retval.pageCount = Math.max(1, Math.ceil(result[0].$1 / retval.pageLimit));
                retval.pageNumber = Math.max(1, Math.min(retval.pageNumber, retval.pageCount));
                numObjects = result[0].$1;
                callback();
            });
        },
        function (callback) {
            db.query("SELECT META(`" + config.bucket + "`).id, name, note, created, source.source_type, thumbnail_url FROM `" + config.bucket + "` " +
                    " WHERE " + wherecond +
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
        if (err) return res.status(err).json({ err: err });
        res.status(202).json(retval);
    });
}


/*
 * Clean training tags.
 * @method Controller.sourceclean
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.sourceclean = function (req, res) {
    var retval = {};  
    db.query("SELECT META(`" + config.bucket + "`).id,source.source_type,source.training FROM `" + config.bucket + "`" +
        " WHERE type='source' AND parent='" + (req.body.source?req.body.source:'') + "'; ",
        function (err, results) {
        if (err) return res.status(err).json({ err: err });
                       
        async.each(results, function (item, callback) {
         console.log(item.id,item.source_type,item.training);
            if (item.source_type == 'image' && item.training) {
                //db.remove(item.id, callback);
                console.log('***',item.id);
                db.read(item.id, function (err, result) {
                    result.value.training.key_words = [];
                    db.replace(item.id, result.value, callback);
                });
            } else {
                callback();
            }
        }, function (err) {
            if (err) {
                return res.status(err).json({ err: err });
            } else {
                return res.status(202).json(retval);
            }
        });
    });
}

/*
 * Add keyword.
 * @method Controller.sourcekeyword
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.sourcekeyword = function (req, res) {
    var retval = {};
    
    db.query("SELECT META(`" + config.bucket + "`).id,source.source_type,source.training,training.key_words FROM `" + config.bucket + "`" +
        " WHERE type='source' AND parent='" + (req.body.source?req.body.source:'') + "'; ",
        function (err, results) {
        if (err) return res.status(err).json({ err: err });
        
        async.each(results, function (item, callback) {
            if (req.body.keyword && item.source_type == 'image' && item.training) {
                db.read(item.id, function (err, result) {
                    result.value.training = result.value.training || {};
                    result.value.training.key_words = result.value.training.key_words || [];
                    result.value.training.key_words.push(req.body.keyword);
                    db.replace(item.id, result.value, callback);
                });
            } else {
                callback();
            }
        }, function (err) {
            if (err) {
                return res.status(err).json({ err: err });
            } else {
                return res.status(202).json(retval);
            }
        });
    });
}

/*
 * Delete all sources by parent (except subfolders).
 * @method Controller.sourcedelete
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.sourcedelete = function (req, res) {
    var retval = {};
    
    db.query("SELECT META(`" + config.bucket + "`).id,source.source_type FROM `" + config.bucket + "`" +
        " WHERE type='source' AND parent='" + (req.body.source?req.body.source:'') + "'; ",
        function (err, results) {
        if (err) return res.status(err).json({ err: err });
        
        async.each(results, function (item, callback) {
            if (!(item.source_type === 'folder' || item.source_type === 'scan_input' || item.source_type === 'scan_training')) {
                db.remove(item.id, callback);
            } else {
                callback();
            }
        }, function (err) {
            if (err) {
                return res.status(err).json({ err: err });
            } else {
                return res.status(202).json(retval);
            }
        });
    });
}

/*
 * Delete all sources by id.
 * @method Controller.sourcedelall
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.sourcedelall = function (req, res) {
    Controller.prototype.removeSource(req.body.id, { sourcedelall: true }, function (err, result) {
        if (err) {
            return res.status(err).json({ err: err });
        } else {
            return res.status(202).json('Source removed.');
        }
    });
}

/*
 * Delete all sources by id except subfolders.
 * @method Controller.sourcedelexc
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.sourcedelexc = function (req, res) {
    Controller.prototype.removeSource(req.body.id, { sourcedelexc: true }, function (err, result) {
        if (err) {
            return res.status(err).json({ err: err });
        } else {
            return res.status(202).json('Sources removed.');
        }
    });
}


/*
 * Remove Source.
 * @method Controller.sourcedelall
 * @param sourceId {String} Source ID
 * @param options {Object} Delete all items or not folder only
 * @param done Callback function
 */
Controller.prototype.removeSource = function (sourceId, options, done) {
    if (sourceId) { 
        db.read(sourceId, function (err, result) {
            if (err) return done(err, null);
            Controller.prototype.removeSourceItems(sourceId, result.value.source.source_type, options, done);
        });
    } else {
        Controller.prototype.removeSourceItems(sourceId, 'folder', options, done);
    }

}
Controller.prototype.removeSourceItems = function (key, type, options, callback) {
    if (type === 'folder' || type === 'scan_input' || type === 'scan_training') {
        Controller.prototype.removeSourceItem(key, options, function (err, result) {
            if (err) return callback(err,result);

            db.query("SELECT META(`" + config.bucket + "`).id,source.source_type FROM `" + config.bucket + "` " +
                 "WHERE type='source' AND parent='" + key + "'; ", function (err, results) {
                
                if (err) return callback(false, null);
                
                async.eachSeries(results, function (item, callback2) {
                    Controller.prototype.removeSourceItems(item.id, item.source_type, options, function (err, result) {
                        callback2(err, result);
                    });
                }, function (err) {
                    callback(err);
                });
            });
        });
    } else {
        Controller.prototype.removeSourceItem(key, options, callback);
    }
}
Controller.prototype.removeSourceItem = function (sourceId, options, callback) {
    if (!sourceId) return callback();
    db.read(sourceId, function (err, result) {
        //console.log('key:', sourceId, 'opt:', options, result);
        if (err) return callback(err);
        if (options.sourcedelexc) { 
            if (result.value.source.source_type === 'folder' || result.value.source.source_type === 'scan_input' || result.value.source.source_type === 'scan_training')
                return callback();
            else
                return db.remove(sourceId, callback); 
        } else {
            return db.remove(sourceId, callback); 
        }
    });
}


/** Export controller. */
module.exports = exports = function(server) {
    return new Controller(server);
}