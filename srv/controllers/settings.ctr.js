/**
 * @module NAS Controller
 */

'use strict';

/** Module objects. */
var config = require('../libs/config')
  , fs = require('fs')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , root = {};

/**
 * Controller class.
 * @class
 */
var Controller = function(obj) {
    root = obj;
};


/*
 * Read NAS file.
 * @method Controller.nasfile
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.nasfile = function (req, res) {
    var filename = path.join(config.folderNAS, decodeURIComponent(new Buffer(req.params.name, 'base64')))
      , options = {
            root: path.dirname(filename),
            dotfiles: 'deny',
            headers: {
                'x-timestamp': req.params.timestamp || Date.now(),
                'x-sent': true
            }
        };
    
    res.sendFile(path.basename(filename), options);
}
/*
 * Read NAS video.
 * @method Controller.nasvideo
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.nasvideo = function (req, res) {
    var name = decodeURIComponent(new Buffer(req.params.name, 'base64'));
    if (name.substr(0, 4) !== 'http') {
        var file = path.join(config.folderNAS, name);
        console.log(file);
        fs.stat(file, function (err, stats) {
            if (err) {
                if (err.code === 'ENOENT') {
                    // 404 Error if file not found
                    return res.sendStatus(404);
                }
                res.end(err);
            }
            var range = req.headers.range;
            if (!range) {
                // 416 Wrong range
                return res.sendStatus(416);
            }
            var positions = range.replace(/bytes=/, "").split("-");
            var start = parseInt(positions[0], 10);
            var total = stats.size;
            var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            var chunksize = (end - start) + 1;
            
            res.writeHead(206, {
                "Content-Range": "bytes " + start + "-" + end + "/" + total,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": "video/mp4"
            });
            
            var stream = fs.createReadStream(file, { start: start, end: end })
            .on("open", function () {
                stream.pipe(res);
            }).on("error", function (err) {
                res.end(err);
            });
        });

    } else {
        console.log('url:',name);
        var url = require('url').parse(name)
          , externalReq = (name.substr(0, 4) === 'http'?http:https).request({
                hostname: url.hostname,
                path: url.path,
                headers: {
                    "Content-Type": "video/mp4"
                }
            }, function (response) {
                res.setHeader("content-disposition", "attachment; filename=" + path.basename(name));
                response.pipe(res);
            });
        externalReq.end();
    }
}

/*
 * Rancher configurations.
 * @method Controller.rancher
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.rancher = function (req, res) {
    var retval = [];
       
    Controller.prototype.getRancherconfig(function (err, content) {
        if (err) {
            res.writeHead(500);
            res.end();
            return;
        }
        
        content.forEach(function (item) {
            retval.push({
                name: item.name , 
                source_types: item.source_types
            });
        });
        res.status(202).json(retval);
    });

}
Controller.prototype.getRancherconfig = function (callback) {
    var filePath = path.join(__dirname , '../rancherconfig.json');
    
    fs.exists(filePath, function (exists) {
        if (exists) {
            fs.readFile(filePath, function (error, content) {
                if (error) {
                    return callback(500, error);
                }
                else {
                    return callback(null, JSON.parse(content).configurations);
                }
            });
        }
        else {
            return callback(404,'Not found');
        }
    });

}

/*
 * Run background process.
 * @method Controller.bgproc
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.bgproc = function (req, res) {
    root.ctrls.bgproc.request(req.params.cmd, { source_id: req.body.source_id, rancher_configuration: req.body.rancher_configuration }, function (data) {
        res.status(202).json(data);
    });
}


/** Export controller. */
module.exports = exports = function(server) {
    return new Controller(server);
}