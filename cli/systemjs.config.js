/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  System.config({
    paths: {
      // paths serve as alias
    'npm:': 'node_modules/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the app folder
      app: 'app',

      //'@angular/core': 'npm:@angular/core/bundles/core.umd.js',
      //'@angular/common': 'npm:@angular/common/bundles/common.umd.js',
      //'@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
      //'@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
      //'@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      //'@angular/http': 'npm:@angular/http/bundles/http.umd.js',
      //'@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      //'@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',

      //'rxjs':                      'npm:rxjs',
      //'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
      //'angular2-mdl': 'npm:angular2-mdl/bundle/angular2-mdl.js',
      //'angular2mdl': 'npm:angular2-mdl/components/index.js',
      //'@angular2-mdl-ext/popover': 'npm:@angular2-mdl-ext/popover/index.umd.js',
      //      '@angular2-mdl-ext/select': 'npm:@angular2-mdl-ext/select/index.umd.js'




      '@angular/core': 'lib/core.umd.js',
      '@angular/common': 'lib/common.umd.js',
      '@angular/compiler': 'lib/compiler.umd.js',
      '@angular/platform-browser': 'lib/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': 'lib/platform-browser-dynamic.umd.js',
      '@angular/http': 'lib/http.umd.js',
      '@angular/router': 'lib/router.umd.js',
      '@angular/forms': 'lib/forms.umd.js',

      'rxjs':                      'lib/rxjs',
      'angular-in-memory-web-api': 'lib/in-memory-web-api.umd.js',
      'angular2-mdl': 'lib/angular2-mdl.js',

      'angular2mdl': 'lib/angular2-mdl-component.js',
      '@angular2-mdl-ext/popover': 'lib/angular2-mdl-popover.js',
      '@angular2-mdl-ext/select': 'lib/angular2-mdl-select.js',
      'hls':                      'assets/hls.min.js',

    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
        app: {
            main: './main.js',
            defaultExtension: 'js'
        },
        rxjs: {
            defaultExtension: 'js'
        } ,
        'angular2-in-memory-web-api': {
            main: './index.js',
            defaultExtension: 'js'
        },
        'angular2-mdl': {
            operator: 'components/index.js'
        },
        'angular2mdl': {
            operator: 'components/index.js'
        },
        hls: {
            defaultExtension: 'js'
        }
    }
  });
})(this);
