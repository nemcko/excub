/**
 *  A simple middleware for parsing a JWt token attached to the request. If the token is valid, the corresponding user
 *  will be attached to the request.
 */

var url = require('url')
  , jwt = require('jwt-simple')
  , config = require('./config')
  , moment = require('moment')
  ;

module.exports.isAuthenticated = function (req, res, next) {
    var parsed_url = url.parse(req.url, true)
      , token = (req.body && req.body.token) || (req.params && req.params.token) || null
      ;
    
    if (token) {
        try {
            var decoded = jwt.decode(token, config.secret);
            
            if (decoded.exp <= Date.now()) {
                res.status(408).send('Access token has expired');
                return;
            }
            
            req.username = decoded.username;
            return next();

        } catch (err) {
            res.status(408).send('Access token has expired')
            return next();
        }
    } else {
        res.status(408).send('Access token has expired')
        next();
    }
}


module.exports.set = function (app) {
    app.post('/authentication/login', function (req, res) {
        if (!req.body.username || !req.body.password) return res.status(401).send('Authentication error');
        try {
            if (config.ldapUrl == "noauth") {
                var expires = moment().add(24, 'hours').valueOf()
                , token = jwt.encode(
                        {
                            username: username,
                            exp: expires
                        }, config.secret
                    );
                res.status(202).json(token);
            } else {
                var ldap = require('ldap-verifyuser')
                , username = req.body.username || ''
                , password = req.body.password || ''
                , cfg = {
                        server: config.ldapUrl,
                        adrdn: 'excuber\\',
                        adquery: 'CN=' + username + ',CN=users,DC=excuber,DC=intranet',
                        debug: false,
                        rawAdrdn: false
                    }
              ;
                
                ldap.verifyUser(cfg, username, password, function (err, data) {
                    if (err || !data || !data.raw) {
                        res.status(401).send('Authentication error')
                    } else {
                        var expires = moment().add(24, 'hours').valueOf()
                        , token = jwt.encode(
                                {
                                    username: username,
                                    exp: expires
                                }, config.secret
                            );
                        res.status(202).json(token);
                    }
                });
            }

        } catch (err) {
            res.status(401).send('Authentication error')
        }
    });
  
};