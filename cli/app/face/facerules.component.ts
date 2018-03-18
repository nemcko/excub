import { Component, ViewChild, ViewContainerRef, Inject, HostListener, AfterViewInit } from '@angular/core';
import { IMdlTableModelItem, MdlDefaultTableModel, MdlDialogService, IMdlCustomDialog, MdlDialogReference, MdlButtonComponent, MdlTextFieldComponent } from 'angular2-mdl';
import { MdlSelectModule } from '@angular2-mdl-ext/select';
import { NavpanelComponent, CrudService, INavpanelData } from '../lib/navpanel';
import { AppService } from '../app.service';

import { FaceList, IFaceTableItem, FaceDetailComponent, callFaceDetail } from '../face/index';

declare var __moduleName: string;


@Component({
    moduleId: __moduleName,
    selector: 'facerules',
    template: `

<div class="exc-cmdline">
    <button mdl-button mdl-ripple mdl-colored="primary" (click)="addFace($event)">
        Add face
    </button>
</div>

<div class="exc-facelist">
    <div class="exc-facelist-face" *ngFor="let item of items; let row_num = index" (click)="openFaceDetail($event,item)" >
        <span mdl-badge-overlap mdl-badge="2510">
            <nasfile [src]="item.thumbnail_url" [period]="10"></nasfile>  
        </span>     
    </div>
    <navpanel [oid]="oid" [qvalue]="search" [numitems]="numitems" [autohide]="autohidepanel" (ondata)="onData($event)"></navpanel>
</div>

`,
    inputs: ['oid', 'qparent','numitems', 'autohidepanel','listtype'],
    providers: [AppService, CrudService]
})
export class FacerulesDirComponent extends FaceList {

    constructor(
        appsvc: AppService,
        crudSvc: CrudService,
    ) {
        super(appsvc, crudSvc);
    }

    protected doSearch(faceid: string, faceweight: string) {
        this.search = faceid;
    }

    public addFace(event: MouseEvent, item?: IFaceTableItem) {
    }
};




export function callFaceRules(dialogService: MdlDialogService, event: MouseEvent, item?: any) {

    let pDialog = dialogService.showCustomDialog({
        component: FacerulesDlgComponent,
        providers: [
            { provide: 'editdata', useValue: item },
        ],
        isModal: true,
        openFrom: event,
        styles: { 'width': '550px' },
        clickOutsideToClose: true,
        enterTransitionDuration: 400,
        leaveTransitionDuration: 400
    });

    pDialog.subscribe((dialogReference: MdlDialogReference) => console.log('FacerulesDlgComponent visible', dialogReference));
}


@Component({
    selector: 'face-rules-dialog',
    template: `
<div class="exc-table_options">            
    <button mdl-button mdl-button-type="icon" class="exc-dimmed" (click)="closeDialog()">
        <mdl-icon>close</mdl-icon>
    </button>
</div>

    <h4 class="mdl-dialog__title">Rules <small>{{editdata.id}}</small></h4>
    <div class="mdl-dialog__content">

        <div class="exc-grid">
            <mdl-textfield type="time" class="mdl-cell--4-col" label="From time" [(ngModel)]="datfrom" floating-label></mdl-textfield>
            <mdl-textfield type="time" class="mdl-cell--4-col" label="To time" [(ngModel)]="datto" floating-label></mdl-textfield>
        </div>
       <facerules [oid]="'face'" [numitems]="50" [autohidepanel]="false"></facerules>

    </div>
    <div class="mdl-dialog__actions">
        <button #firstElement autofocus mdl-button (click)="closeDialog()" mdl-ripple>Cancel</button>
    </div>

`
})
export class FacerulesDlgComponent implements IMdlCustomDialog {
    @ViewChild('firstElement') private inputElement: MdlButtonComponent;
    protected editdata: IFaceTableItem;


    constructor(
        private vcRef: ViewContainerRef,
        private dialog: MdlDialogReference,
        @Inject('editdata') editdata: IFaceTableItem,
    ) {
        this.editdata = editdata;
        this.dialog.onHide().subscribe(() => console.log('Facerules dialog hidden'));
    }

    get viewContainerRef() {
        return this.vcRef;
    }

    public closeDialog() {
        this.dialog.hide();
    }

    @HostListener('keydown.esc')
    public onEsc(): void {
        this.dialog.hide();
    }
}














/*

import { Observable } from 'rxjs/Rx';
import { Component,  ViewChild, OnInit } from '@angular/core';
import { IMdlTableModelItem, MdlDefaultTableModel, MdlDialogComponent, MdlDialogReference, MdlDialogService } from 'angular2-mdl';
import { MdlPopoverModule } from '@angular2-mdl-ext/popover';
import { MdlSelectModule } from '@angular2-mdl-ext/select';
import { AuthService } from '../lib/auth.service';
import { NavpanelComponent, CrudService, INavpanelData } from '../lib/navpanel';
import { AppService } from '../app.service';



declare var __moduleName: string;



interface IFacerulesTableItem {
    id: string,
    type: string,
    name: string,
    iata: string,
    icao: string,
    callsign: string,
    country: string
}

declare var __moduleName: string;


@Component({
    moduleId: __moduleName,
    selector: 'facerules',
    inputs: ['numitems'],
    templateUrl: 'facerules.component.html',
    providers: [AuthService, AppService, CrudService]
})
export class FacerulesDlgComponent {
    protected search: string;
    private _navdata: INavpanelData = <INavpanelData>{ oid: 'test' };
    protected numitems: number = 50;

    get oid(): string {
        return this._navdata.oid;
    }
    get items(): Array<IFacerulesTableItem> {
        return this._navdata.items;
    }
    onData(data: INavpanelData) {
        this._navdata = data;
    }

    public editdata: IFacerulesTableItem = <IFacerulesTableItem>{};
    private _selrow: IFacerulesTableItem;

    constructor(
        private _appsvc: AppService,
        private _crudSvc: CrudService
    ) { }

    protected doSearch(value: string) {
        this.search = value;
    }

    public openDetail($event: MouseEvent,item?: IFacerulesTableItem ) {
        this._selrow = item;
    }

    protected assignData(target: IFacerulesTableItem, source?: IFacerulesTableItem) {
        for (let attribut in target) {
            target[attribut] = undefined;
        }
        if (source) {
            for (let attribut in source) {
                target[attribut] = source[attribut];
            }
        } else {
            target['id'] = undefined;
        }
    }

    public onDialogHide() {
        //console.log(`dialog hidden`);
    }
}
*/