import { Component, ViewChild, ViewContainerRef, Inject, HostListener, Input, AfterViewInit } from '@angular/core';
import { IMdlTableModelItem, MdlDefaultTableModel, MdlDialogService, IMdlCustomDialog, MdlDialogReference, MdlButtonComponent, MdlTextFieldComponent } from 'angular2-mdl';
import { MdlSelectModule } from '@angular2-mdl-ext/select';
import { NavpanelComponent, CrudService, INavpanelData } from '../lib/navpanel';
import { AppService } from '../app.service';

import { FaceList, IFaceTableItem, FaceDetailComponent, callFaceDetail, NasfileComponent } from '../face/index';
import { SourceList } from '../source/index';
import { PersonDetailComponent } from '../person/index';

declare var __moduleName: string;


@Component({
    moduleId: __moduleName,
    selector: 'personfaces',
    template: `
<div class="exc-facelist">
    <div class="exc-facelist-face" *ngFor="let item of items; let row_num = index" (click)="openFaceDetail($event,item)">
        <nasfile [src]="item.thumbnail_url"></nasfile>
   </div>
    <navpanel [oid]="'personfaces'" [qparent]="qparent" [qvalue]="qvalue" [numitems]="numitems" [autohide]="autohidepanel" (ondata)="onData($event)"></navpanel>
</div>
`,
    inputs: ['oid','qparent','qvalue','numitems','autohidepanel'],
    providers: [AppService, CrudService, MdlDialogService]
})
export class PersonfacesDirComponent extends FaceList {

    constructor(
        appsvc: AppService,
        crudSvc: CrudService,
    ) {
        super(appsvc, crudSvc);
    }

};

@Component({
    moduleId: __moduleName,
    selector: 'sourcefaces',
    template: `
<div class="exc-facelist">
    <div class="exc-facelist-face" *ngFor="let item of items; let row_num = index" (click)="openFaceDetail($event,item)" >
        <span mdl-badge-overlap>
            <nasfile [src]="item.thumbnail_url"></nasfile>
        </span>     
    </div>
    <navpanel [oid]="oid" [qparent]="qparent" [numitems]="numitems" [autohide]="autohidepanel" (ondata)="onData($event)"></navpanel>
</div>

`,
    inputs: ['oid', 'numitems', 'autohidepanel', 'qparent','qvalue'],
    providers: [AppService, CrudService, MdlDialogService]
})
export class SourcefacesDirComponent extends FaceList {

    get oid(): string {
        return this.navdata.oid;
    }

    set oid(val: string) {
        this.navdata.oid = val;
    }

    constructor(
        appsvc: AppService,
        crudSvc: CrudService,
    ) {
        super(appsvc, crudSvc);
    }

};

@Component({
    moduleId: __moduleName,
    selector: 'facefaces',
    template: `
<div class="exc-facelist">
    <div class="exc-facelist-face" *ngFor="let item of items; let row_num = index">
        <span mdl-badge-overlap [mdl-badge]="item.weight"  (click)="openFaceDetail($event,item)" >
            <nasfile [src]="item.thumbnail_url"></nasfile>
        </span> 
        <div class="exc-btndel" *ngIf="item.source==='manual'" (click)="deleteFace($event,item)">
            <mdl-icon>clear</mdl-icon>
        </div>
   </div>
    <navpanel [oid]="'facefaces'" [qparent]="qparent" [qvalue]="qvalue" [numitems]="numitems" [autohide]="autohidepanel" (ondata)="onData($event)"></navpanel>
</div>
`,
    inputs: ['oid', 'numitems', 'autohidepanel', 'qparent','qvalue'],
    providers: [AppService, CrudService, MdlDialogService]
})
export class FacefacesDirComponent extends FaceList {

    get oid(): string {
        return this.navdata.oid;
    }

    set oid(val: string) {
        this.navdata.oid = val;
    }


    constructor(
        public appsvc: AppService,
        public crudSvc: CrudService,
    ) {
        super(appsvc, crudSvc);
    }

    public deleteFace(event: MouseEvent, item?: any) {

        let result = this.appsvc.dialogService.confirm('Do you want to remove this face?', 'No', 'Yes', '');
        event.preventDefault();
        result.subscribe(() => {
            this.crudSvc.command(`delfaceface/${item.idrule}`, {faceid: item.id}).subscribe(
                body => {
                },
                err => {
                    this.appsvc.showSnackbar(err);
                },
                () => {
                    this['qvalue'] = Date.now();
                }
            );
        }, (err) => { });
    };

};

@Component({
    moduleId: __moduleName,
    selector: 'person5faces',
    template: `
<div class="exc-facelist">
    <div class="exc-facelist-face-sm" *ngFor="let item of items; let row_num = index" (click)="openFaceDetail($event,item)">
        <nasfile [src]="item.thumbnail_url"></nasfile>
    </div>
    <navpanel [oid]="'person5faces'" [qparent]="qparent" [qvalue]="qvalue" [numitems]="5" [autohide]="true" (ondata)="onData($event)"></navpanel>
</div>

`,
    inputs: ['qparent','qvalue'],
    providers: [AppService, CrudService, MdlDialogService]
})
export class Person5facesDirComponent extends FaceList {

    constructor(
        appsvc: AppService,
        crudSvc: CrudService,
    ) {
        super(appsvc, crudSvc);
    }
};

export function callPersonAddFace(caller: PersonDetailComponent, dialogService: MdlDialogService, event: MouseEvent, item?: any) {

    let pDialog = dialogService.showCustomDialog({
        component: PersonAddFaceDlgComponent,
        providers: [
            { provide: 'caller', useValue: caller },
            { provide: 'editdata', useValue: item },
        ],
        isModal: true,
        openFrom: event,
        styles: { 'width': '550px' },
        clickOutsideToClose: true,
        enterTransitionDuration: 400,
        leaveTransitionDuration: 400
    });

    pDialog.subscribe((dialogReference: any) => console.log('FacerulesDlgComponent visible', dialogReference));
}
@Component({
    selector: 'person-addface-dialog',
    template: `
<div class="exc-table_options">            
    <button mdl-button mdl-button-type="icon" class="exc-dimmed" (click)="closeDialog()">
        <mdl-icon>close</mdl-icon>
    </button>
</div>

    <h4 class="mdl-dialog__title">Add face <small class="exc-srclist"></small></h4>
    <div class="mdl-dialog__content" style="padding-top:0px;">

<div class="exc-cmdline">
    <mdl-textfield
        class="mdl-cell--6-col"
        type="text"
        #faceid 
        (keyup)="doSearch(faceid.value,faceweight.value)" 
        label="Search face ID"></mdl-textfield>

    <mdl-textfield
        class="mdl-cell--4-col"
        type="text"
        #faceweight 
        pattern="-?[0-9]*(\.[0-9]+)?" 
        error-msg="Input is not a number!"
        (keyup)="doSearchEvnt($event,faceid.value,faceweight.value)" 
        label="Search weight"></mdl-textfield>
</div>

<div class="exc-facelist">
    <div class="exc-facelist-face" *ngFor="let item of items; let row_num = index" (click)="selectItem($event,faceid.value,item)" >
        <nasfile [src]="item.thumbnail_url"></nasfile>
    </div>
    <navpanel [oid]="'addfacelist'" [qparent]="callerObj.editdata.id"  [qvalue]="search" [numitems]="50" [autohide]="autohidepanel" (ondata)="onData($event)"></navpanel>
</div>

    </div>
    <div class="mdl-dialog__actions">
        <button autofocus mdl-button (click)="closeDialog()" mdl-ripple>Cancel</button>
    </div>

`,
    inputs: [ 'numitems', 'autohidepanel', 'qparent', 'qvalue'],
    providers: [AppService]
})
export class PersonAddFaceDlgComponent implements IMdlCustomDialog, AfterViewInit {
    protected search: any;
    private _navdata: INavpanelData = <INavpanelData>{ oid: 'face' };
    protected callerObj: PersonDetailComponent;

    get oid(): string {
        return this._navdata.oid;
    }
    get items(): Array<IFaceTableItem> {
        return this._navdata.items;
    }
    onData(data: INavpanelData) {
        this._navdata = data;
    }

    public editdata: IFaceTableItem = <IFaceTableItem>{};
    private _selrow: IFaceTableItem;



    @ViewChild('faceid') private inputElement: MdlTextFieldComponent;


    constructor(
        private vcRef: ViewContainerRef,
        private dialog: MdlDialogReference,
        @Inject('caller') callerObj: PersonDetailComponent,
    ) {
        this.callerObj = callerObj;
        this.dialog.onHide().subscribe(() => console.log('Facerules dialog hidden'));
    }

    get viewContainerRef() {
        return this.vcRef;
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.inputElement.setFocus();
        }, 1);
    }

    protected doSearch(faceid: string, faceweight: string) {
        this.search = { 'faceid': faceid, 'faceweight': faceweight};
    }

    protected doSearchEvnt($event: KeyboardEvent, faceid: string, faceweight: string) {
        if ($event.keyCode === 13) {
            $event.preventDefault();
            this.search = { 'faceid': faceid, 'faceweight': faceweight };     
        }
    }

    public closeDialog() {
        this.dialog.hide();
    }

    public selectItem(event: MouseEvent, faceid:string, item: any) {
        this.callerObj.savePersonFace(faceid, {
            faceid: item.id,
            faceweight: item.weight,
            facesource: item.source
        }, this.dialog);
    }


    @HostListener('keydown.esc')
    public onEsc(): void {
        this.dialog.hide();
    }
}

export function callFaceAddFace(caller: FaceDetailComponent, dialogService: MdlDialogService, event: MouseEvent, item?: any) {

    let pDialog = dialogService.showCustomDialog({
        component: PersonAddFaceDlgComponent,
        providers: [
            { provide: 'caller', useValue: caller },
            { provide: 'editdata', useValue: item },
        ],
        isModal: true,
        openFrom: event,
        styles: { 'width': '550px' },
        clickOutsideToClose: true,
        enterTransitionDuration: 400,
        leaveTransitionDuration: 400
    });

    pDialog.subscribe((dialogReference: any) => console.log('FacerulesDlgComponent visible', dialogReference));
}
@Component({
    selector: 'face-addface-dialog',
    template: `
<div class="exc-table_options">            
    <button mdl-button mdl-button-type="icon" class="exc-dimmed" (click)="closeDialog()">
        <mdl-icon>close</mdl-icon>
    </button>
</div>

    <h4 class="mdl-dialog__title">Add face <small></small></h4>
    <div class="mdl-dialog__content" style="padding-top:0px;">

        <div class="exc-cmdline">
            <mdl-textfield
                class="mdl-cell--6-col"
                type="text"
                #faceid 
                (keyup)="doSearch(faceid.value,faceweight.value)" 
                label="Search face ID"></mdl-textfield>

            <mdl-textfield
                class="mdl-cell--4-col"
                type="text"
                #faceweight 
                pattern="-?[0-9]*(\.[0-9]+)?" 
                error-msg="Input is not a number!"
                (keyup)="doSearch(faceid.value,faceweight.value)" 
                label="Search weight"></mdl-textfield>
        </div>

        <div class="exc-facelist">
            <div class="exc-facelist-face" *ngFor="let item of items; let row_num = index" (click)="selectItem($event,faceid.value,item)" >
                <span mdl-badge-overlap mdl-badge="2510">
                    <nasfile [src]="item.thumbnail_url"></nasfile>
                </span>     
            </div>
            <navpanel [oid]="'addfacelist'" [qvalue]="search" [numitems]="50" [autohide]="autohidepanel" (ondata)="onData($event)"></navpanel>
        </div>

    </div>
    <div class="mdl-dialog__actions">
        <button autofocus mdl-button (click)="closeDialog()" mdl-ripple>Cancel</button>
    </div>

`,
    inputs: [ 'numitems', 'autohidepanel', 'qparent', 'qvalue'],
    providers: [AppService]
})
export class FaceAddFaceDlgComponent implements IMdlCustomDialog, AfterViewInit {
    protected search: any;
    private _navdata: INavpanelData = <INavpanelData>{ oid: 'face' };
    protected callerObj: PersonDetailComponent;

    get oid(): string {
        return this._navdata.oid;
    }
    get items(): Array<IFaceTableItem> {
        return this._navdata.items;
    }
    onData(data: INavpanelData) {
        this._navdata = data;
    }

    public editdata: IFaceTableItem = <IFaceTableItem>{};
    private _selrow: IFaceTableItem;

    @ViewChild('faceid') private inputElement: MdlTextFieldComponent;


    constructor(
        private vcRef: ViewContainerRef,
        private dialog: MdlDialogReference,
        @Inject('caller') callerObj: PersonDetailComponent,
    ) {
        this.callerObj = callerObj;
        this.dialog.onHide().subscribe(() => console.log('Facerules dialog hidden'));
    }

    get viewContainerRef() {
        return this.vcRef;
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.inputElement.setFocus();
        }, 1);
    }

    protected doSearch(faceid: string, faceweight: string) {
        this.search = { 'faceid': faceid, 'faceweight': faceweight};
    }

    public closeDialog() {
        this.dialog.hide();
    }

    public selectItem(event: MouseEvent, faceid:string, item: IFaceTableItem) {
        this.callerObj.savePersonFace(faceid, item, this.dialog);
    }

    @HostListener('keydown.esc')
    public onEsc(): void {
        this.dialog.hide();
    }
}
