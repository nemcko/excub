import { Observable } from 'rxjs/Rx';
import { Component, Injector, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { IMdlTableModelItem, MdlDefaultTableModel, MdlDialogComponent, MdlDialogReference, MdlDialogService } from 'angular2-mdl';
import { MdlPopoverModule } from '@angular2-mdl-ext/popover';
import { MdlSelectModule } from '@angular2-mdl-ext/select';
import { AuthService } from '../lib/auth.service';
import { NavpanelComponent, CrudService, INavpanelData } from '../lib/navpanel';
import { AppService } from '../app.service';

import { callPersonDetail, callPersonData } from '../person/index';
import { IFaceTableItem } from '../face/index';



export interface IPersonTableItem {
    id: string,
    type: string,
    note: string,
    details: {
        first_name: string,
        middle_name: string,
        last_name: string,
        gender: string,
        birth_date: string,
        country: string,
        identification_type: string,
        identification_number: string
    }
    source: string,
    created: string,
    sources: [string],

    alertfld?: string
}

declare var __moduleName: string;

@Component({
    selector: 'source-menu',
    template: `
  `,
})
export class PersonMenuComponent {
    page: any;

    constructor(private injector: Injector) {
        this.page = this.injector.get('page');
    }
}


@Component({
    moduleId: __moduleName,
    templateUrl: 'person.component.html',
    providers: [AuthService, AppService, CrudService]
})
export class PersonComponent implements AfterViewInit {
    protected qtype: string;
    protected qvalue: string;
    private _navdata: INavpanelData = <INavpanelData>{ oid: 'person' };
    public change: number;

    get oid(): string {
        return this._navdata.oid;
    }
    get items(): Array<IPersonTableItem> {
        return this._navdata.items;
    }
    onData(data: INavpanelData) {
        this._navdata = data;
        for (let row in this._navdata.items) {
            this._navdata.items[row].type = this._navdata.items[row].type || '';
            this._navdata.items[row].note = this._navdata.items[row].note || '';
            this._navdata.items[row].details = this._navdata.items[row].details || {};
            this._navdata.items[row].details.first_name = this._navdata.items[row].details.first_name || '';
            this._navdata.items[row].details.middle_name = this._navdata.items[row].details.middle_name || '';
            this._navdata.items[row].details.last_name = this._navdata.items[row].details.last_name || '';
            this._navdata.items[row].details.gender = this._navdata.items[row].details.gender || '';
            this._navdata.items[row].details.birth_date = this._navdata.items[row].details.birth_date || '';
            this._navdata.items[row].details.country = this._navdata.items[row].details.country || '';
            this._navdata.items[row].details.identification_type = this._navdata.items[row].details.identification_type || '';
            this._navdata.items[row].details.identification_number = this._navdata.items[row].details.identification_number || '';
            this._navdata.items[row].source = this._navdata.items[row].source || '';
            this._navdata.items[row].created = this._navdata.items[row].created || '';
            this._navdata.items[row].sources = this._navdata.items[row].sources || [];
        }
    }

    public editdata: IPersonTableItem = <IPersonTableItem>{};
    private _selrow: IPersonTableItem;
    public editdataTitle: string = "";

    @ViewChild('editDialog') private editDialog: MdlDialogComponent;

    constructor(
        public appsvc: AppService,
        private _authService: AuthService,
        private _dialogService: MdlDialogService,
        public crudSvc: CrudService
    ) {
        this.appsvc.header = {
            title: 'Persons',
            desc: 'Maintenance of application data of persons',
            mainmenu: {
                component: PersonMenuComponent,
                inputs: { page: this }
            }
        };  

    }

    public ngAfterViewInit() {
        if (!this.appsvc.isLoggedIn) {
            this.appsvc.logInMe();
        }
    }

    protected doSearch(value: string) {
        this.qvalue = value;
    }

    protected setQueryParam(value: string) {
        this.qtype = value;
    }

    public openDetail(event: MouseEvent, item?: IPersonTableItem) {
        if (item) {
            this._selrow = item;
            this.assignData(this.editdata, this._selrow);
            callPersonDetail(this,this._dialogService, event, item);
        } else {
            this.editdata = <IPersonTableItem>{ details: {} };
            callPersonData(this, this.appsvc.dialogService, event, this.editdata);
        }
    }

    protected assignData(target: IPersonTableItem, source?: IPersonTableItem) {
        this.editdataTitle = '';
        for (let attribut in target) {
            target[attribut] = undefined;
        }
        if (source) {
            for (let attribut in source) {
                target[attribut] = source[attribut];
            }
            this.editdataTitle = source.details.first_name + ' ' + source.details.middle_name + ' ' + source.details.last_name ;
       } else {
            target['id'] = undefined;
        }
    }

    public saveData() {
        this.storeData(this.editdata);
    }

    public storeData(data: IPersonTableItem, refdlg?: MdlDialogReference) {
        this.crudSvc.saveData({ oid: this.oid, id: data.id }, data).subscribe(
            body => {
                this.crudSvc.getReceivedItems(body, this._navdata);
            },
            err => {
                this.appsvc.showSnackbar(err);
            },
            () => {
                (refdlg ? refdlg.hide() : null);
            }
        );
    }

    public removeRow(item: any) {
        let result = this._dialogService.confirm('Would you like to delete this item?', 'No', 'Yes', 'Delete');
        result.subscribe(() => {
            this.crudSvc.delItem({ oid: this.oid, id: item.id, pageLimit: this._navdata.pageLimit }).subscribe(
                body => {
                    this.crudSvc.getReceivedItems(body, this._navdata);
                },
                err => this.appsvc.showSnackbar(err),
                () => { }
            );
        },
            (err: any) => { }
        );
    }


}

