import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import { AppService } from '../app.service';

@Injectable()
export class AuthService {
    private _headers = new Headers({
        'Content-Type': 'application/vnd.api+json',
    });
    private _options = new RequestOptions({ headers: this._headers });

    constructor(
        private _http: Http,
        private _appsvc: AppService
    ) { 
    }

    get isLoggedIn(): boolean {
        return typeof (this._appsvc.token) !== "undefined" && this._appsvc.token !== null;
    }

    redirectUrl: string;

    login(usr: string, pwd: string): Observable<Response> {
        return this._http.post(this._appsvc.apiUri + '/authentication/login', JSON.stringify({ "username": usr, "password": pwd }), this._options);
    }

    logout(): void {
        localStorage.removeItem('currentUser');
    }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/