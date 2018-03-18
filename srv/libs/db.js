/**
 * @module Database helper library
 * @description The Couchbase database utility library.
 */

'use strict';

var async = require("async")
  , config = require('./config')
  , couchbase = require('couchbase')
  , cluster = new couchbase.Cluster(config.cauchbaseUrl)
  , ottoman = require('ottoman')
  , bucket
  , couchbaseConnected = false
  ;

//bucket = cluster.openBucket(config.bucket, function (err) {
//    if (err) {
//        console.log("Can't open bucket", config.bucket);
//        throw err;
//    }
//    else {
//        console.log("Successfully opened bucket", config.cauchbaseUrl);
//    }
//});
bucket = cluster.openBucket(config.bucket);
bucket.operationTimeout = 500 * 1000;
ottoman.store = new ottoman.CbStoreAdapter(bucket, couchbase);


bucket.on('error', function (err) {
    couchbaseConnected = false;
    console.log('CONNECT ERROR:', err);
    throw err;
});

bucket.on('connect', function () {
    couchbaseConnected = true;
    console.log('couchbace connected at', config.cauchbaseUrl);
});


exports.isConnected = function() {
    return couchbaseConnected;
}

exports.bucname = config.bucket;
exports.couchbaseAdapter = ottoman.store;
exports.bucket = bucket;


async.whilst(
    function () { return couchbaseConnected; },
    function (callback) {
        setTimeout(function () {
            callback(null, count);
        }, 500);
    },
    function (err, n) {
    }
);

exports.query = function(sql, done) {
    if (!couchbaseConnected) {
        done(404, null);
        return;
    }

    var N1qlQuery = couchbase.N1qlQuery
      , query = N1qlQuery.fromString(sql).consistency(N1qlQuery.Consistency.REQUEST_PLUS);
      ;

    if (config.showQuery && sql.indexOf('COUNT(*)')==-1) {
        console.log("QUERY:", sql);
    }

    bucket.query(query, function (err, result) {
        if (err) {
            //if (config.showQuery) {
                console.log("ERR:", err);
            //}
            done(err, null);
            return;
        }
        done(null, result);
    });
}

module.exports.insert = function (key, val, done) {
    if (!couchbaseConnected) {
        done(404, null);
        return;
    }
    
    bucket.insert(key, val, function (err, res) {
        if (err) {
            console.log("INSERT:", key, ":", err);
            done(err, null);
            return;
        }
        done(null, res);
    });
}

module.exports.upsert = function (key, val, done) {
    if (!couchbaseConnected) {
        done(404, null);
        return;
    }
    
    bucket.upsert(key, val, function (err, res) {
        if (err) {
            console.log("UPSERT:", key, ":", err);
            done(err, null);
            return;
        }
        done(null, res);
    });
}

module.exports.replace = function (key, val, done) {
    if (!couchbaseConnected) {
        done(404, null);
        return;
    }
    
    bucket.replace(key, val, function (err, res) {
        if (err) {
            console.log("REPLACE:", key, ":", err);
            done(err, null);
            return;
        }
        done(null, res);
    });
}

module.exports.read = function (key, done) {
    if (!couchbaseConnected) {
        done(404, null);
        return;
    }
    
    bucket.get(key, function (err, result) {
        if (err) {
            console.log("READ:", err);
            done(err, null);
            return;
        }
        done(null, result);
    });
}

module.exports.remove = function (key, done) {
    if (!couchbaseConnected) {
        done(404, null);
        return;
    }
    
    bucket.remove(key, function (err, result) {
        if (err) {
            console.log("DELETE:", err);
            done(err, null);
            return;
        }
        done(null, true);
    });
}

module.exports.refreshExpiry = function(key, time, done) {
    bucket.touch(key, time, function (err, result) {
        if (err) {
            return done(err, null);
        }
        done(null, true);
    });
}

module.exports.counter = function (key, done) {
    if (!couchbaseConnected) {
        done(404, null);
        return;
    }
    
    bucket.counter('counter-' + key, 1, function (err, result) {
        if (err) {
            done(null, 1);
            bucket.upsert('counter-' + key, 1, function (err, result) { });
            return;
        }
        done(null, result.value);
    });
}

module.exports.getDateString = function() {
    var now = new Date(),
        tzo = -now.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function (num) {
            var norm = Math.abs(Math.ceil(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return now.getFullYear() 
        + '-' + pad(now.getMonth() + 1) 
        + '-' + pad(now.getDate()) 
        + 'T' + pad(now.getHours()) 
        + ':' + pad(now.getMinutes()) 
        + ':' + pad(now.getSeconds()) + '.000'
        + dif + pad(tzo / 60) 
        + ':' + pad(tzo % 60);
}
