/**
 * @module Service library
 * @description The background service library.
 */

'use strict';
var async = require("async")
  , path = require('path')
  , fs = require('fs')
  , shortid = require('shortid')
  , timexe = require('timexe')
  , messenger = require('messenger')
  , db = require('../libs/db')
  , config = require('../libs/config')
  , rancherconfig = require('../rancherconfig.json')
  , bgprocsrv = messenger.createListener(config.bgprocPort)
  , queue = []
  , runtable = {}
  ;

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=@');

bgprocsrv.on('run', function (message, data) {
    if (addToQueue(data.source_id, data.rancher_configuration)) {
        message.reply("o.k.");
    } else {
        message.reply("!error");
    }
});

process.on('uncaughtException', function (er) {
    if (er) {
        console.log('ERROR');
        console.error(er.stack);
    }
    process.exit(1);
})

function fetchNewObjects() {
    db.query("SELECT META(`" + config.bucket + "`).id,processing.rancher_configuration FROM `" + config.bucket + "` WHERE type='source' AND status='new' LIMIT 10", function (err, results) {
        if (err || !results) {
            return;
        }
        async.each(results, function (result, callback) {
            if (addToQueue(result.id, result.rancher_configuration)) {
            }
            callback();
        }, function (err) {
            return;
        });
    });
}

function addToQueue(source_id, rancher_configuration) {
    var idobj = new Buffer(encodeURIComponent(source_id + '#' + rancher_configuration)).toString('base64');
    if (runtable[idobj] === undefined && rancher_configuration !== undefined) {
        queue.push({
            id: idobj,
            source_id: source_id,
            rancher_configuration: rancher_configuration,
            idProj: null,
            activated: null
        });
        return true;
    } else {
        return false;
    }

}

function processObject(obj, callback) {
    
    if (runtable[obj.id] !== undefined) return callback();

    db.read(obj.source_id, function (err, result) {
        if (err) {
            delete runtable[obj.id];
            return callback();
        }
        for (var idx in rancherconfig.configurations) {
            if (obj.rancher_configuration === rancherconfig.configurations[idx].name) {
                var rancher = require('../libs/rancher')(config.rancher_accid)
                  , container = {
                        "accountId": config.rancher_accid,
                        "name": "Container" + Date.now(), 
                        "description": "BgProc: " + obj.rancher_configuration,
                        "dockerCompose": rancherconfig.configurations[idx].docker_compose
                            .split('${SOURCE_ID}').join(obj.source_id)
                            .split('${INPUT}').join((result.value.source.source_type == 'camera' || result.value.source.source_link.startsWith('http') ? result.value.source.source_link : path.join(config.folderNAS, result.value.source.source_link)).split('\\').join('/'))
                        ,
                        "rancherCompose": rancherconfig.configurations[idx].rancher_compose,
                        "startOnCreate": true,
                    }
                  
                runtable[obj.id] = {};
                rancher.createProject(container, function (data) {
                    obj.idProj = data.id;
                    obj.activated = Date.now();
                    runtable[obj.id] = obj;
                    rancher.activateProject(obj.idProj, callback);
                });
                break;
            }
        }
    });
}

function clearRuntable(next) {
    var rancher = require('../libs/rancher')(config.rancher_accid)
      , delitems = []
      ;
    async.each(runtable, function (runitem, callback) {
        if (runitem.activated) {
            rancher.exportconf(runitem.idProj, function (expcnt) {
                var diff = (Date.now() - runitem.activated) / 1000;
                if (expcnt.state === 'stopped' || diff > config.rancher_timeoff) {
                    delitems.push(runitem.id);
                    db.read(runitem.source_id, function (err, result) {
                        if (err === null && runitem.rancher_configuration === result.value.processing.rancher_configuration) {
                            result.value.status = 'completed'
                            db.replace(runitem.source_id, result.value, function (err, result) {
                                callback();
                            });
                        } else {
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            });
        } else {
            callback();
        }
        
    }, function (err) {
        delitems.forEach(function (id) {
            rancher.deleteProject(runtable[id].idProj, function (data) {
                delete runtable[id];
            });
        });
        next();
    });
}

timexe('* * * * * /6', function () {
    fetchNewObjects();
});

timexe('* * * * * /12', function () {
    clearRuntable(function () {
    });
});

timexe('* * * * * * /2', function () {
    var numactive = 0;
    async.each(runtable, function (runitem, next) {
        if (runitem.activated) {
            numactive++;
        }
        next();
    });
    
    if (numactive < 5) {
        while (numactive++ < 5) {
            if (queue.length) {
                processObject(queue.shift(), function () {});
            }
        }
    }
});
