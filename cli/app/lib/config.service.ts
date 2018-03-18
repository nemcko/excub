import { Injectable } from '@angular/core';
import { Http } from "@angular/http";

@Injectable()
export class ConfigService {
    public config: any;
    public rancher: any;

    constructor(private _http: Http) { }

    load() {
        return new Promise((resolve) => {
            this._http.get('cfg.json').subscribe(res => {
                this.config = res.json();
                this._http.get(this.config.apiUri + '/rancherconfig').subscribe(res => {
                    this.rancher = res.json();
                    resolve();
                });
            });
        });
    };
}