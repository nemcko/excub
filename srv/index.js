var express = require('express')
  , app = express() 
  , config = require('./libs/config')
  , path = require('path')
  , http = require('http')
  , fs = require('fs')
  , exec = require('child_process').exec
  , cors = require('cors')
  , server = http.createServer()
  , morgan = require('morgan')
  , winston = require('winston')
  , methodOverride = require('method-override')
  , bodyParser = require('body-parser')
  , logDirectory = __dirname + '/logs'
  , debugLog = 'log'
  , exceptionLog = 'err'
  , user = require('./libs/user')
  , messenger = require('messenger')
;

//app.use(function (req, res, next) {  
//   console.log('req:',req);
//    next();
//});



winston.transports.DailyRotateFile = require('winston-daily-rotate-file');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.DailyRotateFile)({
            filename: debugLog,
            datePattern: '.yyyy-MM-dd_HH',
            dirname: logDirectory
        }),
        new winston.transports.Console({
            json: false,
            colorize: true
        })
    ],
    exceptionHandlers: [
        new (winston.transports.DailyRotateFile)({
            filename: exceptionLog,
            datePattern: '.yyyy-MM-dd_HH',
            dirname: logDirectory
        }),
        new winston.transports.Console({
            json: true,
            colorize: true
        })
    ],
    exitOnError: false
});
logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};

app.use(morgan('dev', { stream: logger.stream }));

//app.use(express.static('api'));
//app.use(express.static(path.join(__dirname, config.clientPath )));

app.use(bodyParser.urlencoded({ 'extended': 'false' }));  
app.use(bodyParser.json({ limit: '50mb' }));    
app.use(bodyParser.json({ type: 'application/*+json' }));
//app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
 
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('X-Method-Override'));


var originsWhitelist = [
    config.clientUrl,
    'http://localhost:8000'
];
var corsOptions = {
    origin: function (origin, callback) { 
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        isWhitelisted = true; //!!!!
        callback(null, isWhitelisted);
    },
    credentials: true
}

app.use(function (req, res, next) {  
    if (typeof (req.headers['content-type']) === 'undefined') {
        req.headers['content-type'] = "application/json; charset=UTF-8";
    }
    next();
});
 
app.use(cors(corsOptions));

user.set(app);

var ctrls = {}
  , filePath = path.join(__dirname, './controllers')
  ;

ctrls['isAuthenticated'] = user.isAuthenticated;
ctrls['bgproc'] = messenger.createSpeaker(config.bgprocPort);

fs.readdirSync(filePath).forEach(function (file) {
    ctrls[file.split(".")[0].toLowerCase()] = require(filePath + '/' + file)({
        'ctrls': ctrls, 
        'config': config , 
        'logger': logger,
        'app': app
    });
});


filePath = path.join(__dirname, './routes');
fs.readdirSync(filePath).forEach(function (file) {
    require(filePath + '/' + file)(app, ctrls);
});


function runService() {
    var child = exec('node ./libs/service.js')
      , startdt= new Date()
      ;
          
    child.stdout.on('data', function (data) {
        console.log(data);
    });
    child.stderr.on('data', function (data) {
        logger.error('*** ' + data);
    });
    child.on('close', function (code) {
        if (code) logger.warn('Service end on ' + new Date().toISOString() + ' code ' + code + ', ' + Math.ceil((new Date() - startdt) / 1000) + 's');
    });
}

console.log(
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n" +
    " Excuber Server listening on port " + config.serverPort + "\n" +
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~" 
);
console.log('cors:', [
    config.clientUrl
]);

runService();

app.listen(config.serverPort);