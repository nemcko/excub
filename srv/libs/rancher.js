/**
 * @module Rancher library
 * @description The Rancher wrap library.
 */

'use strict';
var http = require("http")
  , config = require('../libs/config')
  ;

module.exports = function rancher(project) {
    
    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + new Buffer(config.rancher_acckey + ':' + config.rancher_seckey).toString('base64')
    }, url = require('url').parse(config.rancher_api);
    
    function callApi(method, path, body, callback) {
        
        var options = {
            "method": method,
            "hostname": url.hostname,
            "port": url.port,
            "path": path,
            "headers": headers
        };
        
        var req = http.request(options, function (res) {
            
            var chunks = '';
            
            res.on("data", function (chunk) {
                
                chunks += chunk;

            });
            
            res.on("end", function () {
                
                var resBody = JSON.parse(chunks);
                //console.log(resBody);
                callback(resBody);

            });

        });
        
        if (body)
            req.write(JSON.stringify(body));
        
        req.end();

    }
    
    return {
     
        create: function (data, callback) {
            callApi('POST', '/v2-beta/projects/' + project + '/containers', data, callback);
        },
        read: function (id, callback) {
            callApi('GET', '/v2-beta/projects/' + project + '/containers/' + id, null, callback);
        },
        update: function (id, callback) {
            callApi('PUT', '/v2-beta/projects/' + project + '/containers/' + id , data, callback);
        },
        stop: function (id, callback) {
            callApi('POST', '/v2-beta/projects/' + project + '/containers/' + id + '/?action=stop', { "remove": false, "timeout": 0 }, callback);
        },
        remove: function (id, callback) {
            callApi('DELETE', '/v2-beta/projects/' + project + '/containers/' + id, null, callback);
        },
        

        createProject: function (data, callback) {
            callApi('POST', '/v2-beta/projects/' + project + '/stacks', data, callback);
        },
        activateProject: function (id, callback) {
            callApi('POST', '/v2-beta/projects/' + project + '/stacks/' + id + '/?action=activateservices', null, callback);
        },
        deleteProject: function (id, callback) {
            callApi('DELETE', '/v2-beta/projects/' + project + '/stacks/' + id, null, callback);
        },
        exportconf: function (id, callback) {
            callApi('GET', '/v2-beta/projects/' + project + '/stacks/' + id + '/?action=exportconfig&timestamp='+Date.now(), null, callback);
        },

    }
}