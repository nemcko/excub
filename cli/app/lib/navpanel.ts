import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Component, EventEmitter, Input, Output, OnInit, AfterViewInit} from '@angular/core'; 
import { Observable } from 'rxjs/Rx';
import { AppService } from '../app.service';
import { AuthService } from './auth.service';

export interface INavpanelData {
    oid: string,
    id?: string,
    cmd?: string,
    pageNumber?: number,
    pageLimit?: number,
    pageCount?: number,
    items?: Array<any>
};

@Injectable()
export class CrudService {
    private _headers = new Headers({
        'Content-Type': 'application/vnd.api+json',
    });
    private _options = new RequestOptions({ headers: this._headers });

    constructor(
        private _http: Http,
        private _appsvc: AppService
    ) {  }

    private constructUrl(pos: INavpanelData, token?: string): string {
        let url: string = this._appsvc.apiUri + '/' 
            + (pos.oid ? pos.oid : '-')
            + (pos.id ? '/' + pos.id : (pos.pageNumber== undefined ? '/1': (isNaN(parseInt(' ' + pos.pageNumber)) ? '': '/' + pos.pageNumber)))
            + (pos.pageLimit ? '/' + pos.pageLimit : (pos.pageNumber ? '/10' : ''))
            + (pos.cmd ? '/' + pos.cmd : '')
            + (token ? '/' + token : '')
            ;
        return url;
    }

    public getItems(pos: INavpanelData) {
        return this._http.get(this.constructUrl(pos));
    }

    public postItem(pos: INavpanelData, data: any) {
        data['token'] = this._appsvc.token;
        return this._http.post(this.constructUrl(pos), JSON.stringify(data), this._options);
    }

    public updItem(pos: INavpanelData, data: any) {
        data['token'] = this._appsvc.token;
        return this._http.put(this.constructUrl(pos), JSON.stringify(data), this._options);
    }

    public delItem(pos: INavpanelData) {
        return this._http.delete(this.constructUrl(pos, this._appsvc.token));
    }

    public command(uri: string, data: any) {
        data['token'] = this._appsvc.token;
        return this._http.post(this._appsvc.apiUri + '/' + uri, JSON.stringify(data), this._options);
    }

    public saveData(pos: INavpanelData, data: any) {
        data['token'] = this._appsvc.token;
        if (data.id) {
            return this._http.put(this.constructUrl(pos), JSON.stringify(data), this._options);
        } else {
            pos.id = null;
            pos.pageNumber = <number><any>'-';
            return this._http.post(this.constructUrl(pos), JSON.stringify(data), this._options);
        }
    }

    public getReceivedItems(body: any, data: INavpanelData): boolean {
        try {
            let xdata:any =  body.json();
            if (xdata.items) {
                data.pageNumber = xdata.pageNumber;
                data.pageLimit = xdata.pageLimit;
                data.pageCount = xdata.pageCount;
                data.items = xdata.items;
            }
        } catch (err) {
            this._appsvc.showSnackbar(body._body && typeof body['_body'] === 'string' ? body['_body'] : err.message);
            return false;
        }
        return true;
    }

    public getReceivedData(body: any) {
        let xdata: any;
        try {
            xdata = body.json();
        } catch (err) {
            this._appsvc.showSnackbar(body._body && typeof body['_body'] === 'string' ? body['_body'] : err.message);
            return false;
        }
        return xdata;
    }
}

@Component({
    selector: 'navpanel',
    inputs: ['oid', 'qtype', 'qvalue', 'qparent', 'qtime', 'numitems','autohide'],
    template: `
<div class="exc-navpanel" [hidden]="!isHidden">
    <div class="tools">
    </div>
    <div class="buttons">
        <small>Items</small>
        <div class="pagelimit">
            <mdl-select [(ngModel)]="navdata.pageLimit" (change)="onPageLimit()" mdl-tooltip="Row count">
                <mdl-option *ngFor="let c of pageLimits" [value]="c">{{c}}&nbsp;</mdl-option>
            </mdl-select>
        </div>
        <small> page</small>
        <mdl-textfield type="number" style="width:52px;" mdl-tooltip="Row number" (keyup)="onPageNumber()"
                        [(ngModel)]="navdata.pageNumber"></mdl-textfield>
        <small>of</small>
        <mdl-textfield type="number" style="width:50px;"
                        disabled="true"
                        [(ngModel)]="navdata.pageCount"></mdl-textfield>


        <button mdl-button mdl-button-type="icon" mdl-tooltip="First page" (click)="onFirstPage()">
            <mdl-icon class="exc-dimmed">first_page</mdl-icon>
        </button>
        <button mdl-button mdl-button-type="icon" mdl-tooltip="Prev page" (click)="onPrevPage()">
            <mdl-icon class="exc-dimmed">chevron_left</mdl-icon>
        </button>
        <button mdl-button mdl-button-type="icon" mdl-tooltip="Next page" (click)="onNextPage()">
            <mdl-icon class="exc-dimmed">chevron_right</mdl-icon>
        </button>
        <button mdl-button mdl-button-type="icon" mdl-tooltip="Last page" (click)="onLastPage()">
            <mdl-icon class="exc-dimmed">last_page</mdl-icon>
        </button>
    </div>
</div>
  `
})

export class NavpanelComponent implements OnInit, AfterViewInit {
    protected navdata: any = <INavpanelData>{};
    private _qvalue: string = "";
    private _qtype: string = "";
    private _qparent: string = "";
    private _qtime: number = Date.now();
    private _hidden: boolean = false;
    private _autohide: boolean = false;
    protected pageLimits: [number] = [5, 10, 20, 50, 100, 500];
    @Output() ondata: EventEmitter<any> = new EventEmitter();

    constructor(
        private _appsvc: AppService,
        private _crudSvc: CrudService,
        private _authsvc: AuthService
    ) { }

    ngOnInit() {
    }

    public ngAfterViewInit() {
        this.navdata.pageLimit = this.navdata.pageLimit || 10;
        this.getData();
    }

    get oid(): string {
        return this.navdata.oid;
    }

    set oid(val: string) {
        this.navdata.oid=val;
    }

    get numitems(): number {
        return this.navdata.pageLimit;
    }

    set numitems(val: number) {
        this.navdata.pageLimit=val;
    }

    get qtime(): number {
        return this._qtime;
    }
    set qtime(val: number) {
        this._qtime = val;
        this.getData();
    }

    get qvalue(): string {
        return this._qvalue;
    }
    set qvalue(val: string) {
        if (this._qvalue !== val) {
            this._qvalue = val;
            this.getData();
        }
    }

    get qtype(): string {
        return this._qtype;
    }
    set qtype(val: string) {
        if (this._qtype !== val) {
            this._qtype = val;
            this.getData();
        }
    }

    get qparent(): string {
        return this._qparent;
    }
    set qparent(val: string) {
        if (this._qparent !== val) {
            this._qparent = val;
            this.getData();
        }
    }

    get autohide(): boolean {
        return this._autohide;
    }

    set autohide(val: boolean) {
        this._autohide=val;
    }

    get isHidden(): boolean {
        return !this._autohide;
    }

    getData() {
        if (this._authsvc.isLoggedIn && this.navdata.pageLimit) {

            let qpval: any = {};
            if (this._qparent) (<any>qpval).qparent = this._qparent;
            if (this._qtype) (<any>qpval).qtype = this._qtype;
            if (this._qvalue) (<any>qpval).qvalue = this._qvalue;

            this._crudSvc.postItem(this.navdata, { qparam: qpval }).subscribe(
                body => {
                    let xdata: any = this._crudSvc.getReceivedData(body);
                    if (xdata) {
                        this.navdata.pageNumber = xdata.pageNumber;
                        this.navdata.pageLimit = xdata.pageLimit;
                        this.navdata.pageCount = xdata.pageCount;
                        this.navdata.items = xdata.items;
                        this._qtime = Date.now();
                        this.ondata.emit(Object.assign({}, xdata, this.navdata));
                    }
                },
                err => {
                    if (err.status === 408) {
                        this._appsvc.logInMe();
                        this._appsvc.showSnackbar(err._body);
                    } else {
                        this._appsvc.showSnackbar(err);
                    }
                },
                () => console.log('done loading', this.navdata.oid)
            );
        }
    }

    onPageLimit() {
        this.getData(); 
    }

    onPageNumber() {
        this.navdata.pageNumber = Math.max(1, Math.min(this.navdata.pageNumber, this.navdata.pageCount));
        this.getData(); 
    }

    onFirstPage() {
        this.navdata.pageNumber = 1;
        this.getData(); 
    }

    onPrevPage() {
        this.navdata.pageNumber = Math.max(1, this.navdata.pageNumber - 1);
        this.getData(); 
    }

    onNextPage() {
        this.navdata.pageNumber = Math.min(this.navdata.pageCount, this.navdata.pageNumber + 1);
        this.getData(); 
    }

    onLastPage() {
        this.navdata.pageNumber = this.navdata.pageCount;
        this.getData(); 
    }

}
