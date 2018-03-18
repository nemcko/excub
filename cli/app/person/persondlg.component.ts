import { Component, OnInit, ViewContainerRef, AfterViewInit, Inject } from '@angular/core';
import { IMdlTableModelItem, MdlDefaultTableModel, MdlDialogComponent, MdlDialogReference, MdlDialogService, IMdlCustomDialog, MdlTextFieldComponent } from 'angular2-mdl';
import { ViewChild } from "@angular/core";
import { HostListener } from "@angular/core";

import { AppService } from '../app.service';
import { IPersonTableItem, PersonComponent } from '../person/index';
import { callPersonAddFace, IFaceTableItem } from '../face/index';


@Component({
    selector: 'personpage',
    inputs: ['editdata'],
    template: `
        <mdl-textfield #firstElement type="text" class="mdl-cell--9-col" label="First name" [(ngModel)]="editdata.details.first_name" floating-label autofocus></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--12-col" label="Middle name" [(ngModel)]="editdata.details.middle_name" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--12-col" label="Last name" [(ngModel)]="editdata.details.last_name" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--4-col" label="Gender" [(ngModel)]="editdata.details.gender" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--4-col" label="Birth date" [(ngModel)]="editdata.details.birth_date" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--4-col" label="Country" [(ngModel)]="editdata.details.country" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--4-col" label="Id.type" [(ngModel)]="editdata.details.identification_type" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--4-col" label="Id.number" [(ngModel)]="editdata.details.identification_number" floating-label></mdl-textfield>        
        <div class="mdl-cell--4-col" style="display:inline-block">
            <mdl-select floating-label [(ngModel)]="editdata.source" placeholder="Source">
                <mdl-option value="generated">generated</mdl-option>
                <mdl-option value="import">import</mdl-option>
                <mdl-option value="manual">manual</mdl-option>
            </mdl-select>
        </div>

        <mdl-textfield type="text" class="mdl-cell--12-col" label="Note" [(ngModel)]="editdata.note" floating-label></mdl-textfield>
        <div class="mdl-cell--12-col"><small>Creation date: {{editdata.created | toDateTime | date: 'dd.MM.yy HH:mm'}}</small></div>


`,
    providers: [AppService]
})
export class PersonPageComponent implements AfterViewInit {
    @ViewChild('firstElement') private inputElement: MdlTextFieldComponent;
    protected editdata: IPersonTableItem;

    constructor(
        protected appsvc: AppService,
    ) { }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.inputElement.setFocus();
        }, 1);
    }

}


export function callPersonDetail(caller: PersonComponent, dialogService: MdlDialogService, event: MouseEvent, item?: any) {

    let pDialog = dialogService.showCustomDialog({
        component: PersonDetailComponent,
        providers: [
            { provide: 'caller', useValue: caller },
            { provide: 'editdata', useValue: item },
        ],
        isModal: true,
        openFrom: event,
        styles: { 'width': '840px', 'max-height': '100%', 'overflow-y': 'scroll' },
        clickOutsideToClose: true,
        enterTransitionDuration: 400,
        leaveTransitionDuration: 400
    });

    pDialog.subscribe((dialogReference: MdlDialogReference) => console.log('PersonDetail dialog visible', dialogReference));
}


@Component({
    selector: 'person-dialog',
    template: `
<div class="exc-table_options">            
    <button mdl-button mdl-button-type="icon" class="exc-dimmed" (click)="closeDialog()">
        <mdl-icon>close</mdl-icon>
    </button>
</div>

    <h4 class="mdl-dialog__title">Person <small><small>{{editdata.id}}</small></small></h4>
    <div class="mdl-dialog__content" style="height:480px;">

<mdl-tabs mdl-ripple mdl-tab-active-index="0" (mdl-tab-active-changed)="tabChanged($event)" style="align-items: left;">
    <mdl-tab-panel>
      <mdl-tab-panel-title>
        <mdl-icon class="mdl-color-text--primary">person</mdl-icon> <span>Person data</span>
      </mdl-tab-panel-title>
      <mdl-tab-panel-content>
            <br/>          
            <personpage [editdata]="editdata"></personpage>            
            <div class="exc-cmdline">
                <button mdl-button (click)="saveData()" mdl-ripple mdl-colored="primary">Save data of person</button>
            </div>

      </mdl-tab-panel-content>
    </mdl-tab-panel>


    <mdl-tab-panel>
      <mdl-tab-panel-title>
        <mdl-icon class="mdl-color-text--primary">notifications</mdl-icon> <span>Alarm setting</span>
      </mdl-tab-panel-title>
      <mdl-tab-panel-content>
            <br/>          
                <mdl-select floating-label [(ngModel)]="editdata.alertfld" placeholder="Alert" (change)="onAlertChange(editdata.alertfld)"
                    [ngClass]="{'mdl-color--red-400': editdata.alertfld==='RED','mdl-color--green-400': editdata.alertfld==='GREEN','mdl-color--blue-400': editdata.alertfld==='BLUE','mdl-color--grey-400': editdata.alertfld==='GREY'}"
                    >
                    <mdl-option value="">--</mdl-option>
                    <mdl-option value="RED">RED</mdl-option>
                    <mdl-option value="GREEN">GREEN</mdl-option>
                    <mdl-option value="BLUE">BLUE</mdl-option>
                    <mdl-option value="GREY">GREY</mdl-option>
                </mdl-select>

      </mdl-tab-panel-content>
    </mdl-tab-panel>


    <mdl-tab-panel>
      <mdl-tab-panel-title>
        <mdl-icon class="mdl-color-text--primary">face</mdl-icon> <span>Person face</span>
      </mdl-tab-panel-title>
      <mdl-tab-panel-content>
<!--
            <div class="exc-cmdline">
                <button mdl-button mdl-ripple mdl-colored="primary" (click)="addFace($event)">
                    Add face
                </button>
            </div>
-->
           <personfaces [qparent]="editdata.id" [qvalue]="change" [numitems]="5000" [autohidepanel]="true"></personfaces>
      </mdl-tab-panel-content>
    </mdl-tab-panel>

    <mdl-tab-panel>
      <mdl-tab-panel-title>
        <mdl-icon class="mdl-color-text--primary">camera</mdl-icon> <span>Identified in sources</span>
      </mdl-tab-panel-title>
      <mdl-tab-panel-content>
            <br/>          
            <sourcelist [oid]="'persinsour'"  [qvalue]="editdata.id"  [numitems]="100" [autohidepanel]="true"></sourcelist>
      </mdl-tab-panel-content>
    </mdl-tab-panel>



 </mdl-tabs>
  

    </div>
    <div class="mdl-dialog__actions">
        <button mdl-button (click)="closeDialog()" mdl-ripple>Cancel</button>
    </div>

`,
    providers: [AppService, MdlDialogService]
})
export class PersonDetailComponent implements OnInit, IMdlCustomDialog {
    protected editdata: IPersonTableItem;
    protected callerObj: PersonComponent;
    protected change: number;

    constructor(
        public appsvc: AppService,
        private vcRef: ViewContainerRef,
        private dialog: MdlDialogReference,
        @Inject('editdata') editdata: IPersonTableItem,
        @Inject('caller') callerObj: PersonComponent,
    ) {
        this.editdata = editdata;
        this.callerObj = callerObj;
        this.dialog.onHide().subscribe(() => console.log('PersonDetail dialog hidden'));
    }

    ngOnInit() {
    }
    get viewContainerRef() {
        return this.vcRef;
    }

    public saveData() {
        this.callerObj.storeData(this.editdata, this.dialog);
    }

    public closeDialog() {
        this.dialog.hide();
    }

    public activeIndex: number = 0;
    public tabChanged(index: number) {
        this.activeIndex = index;
    }

    @HostListener('keydown.esc')
    public onEsc(): void {
        this.dialog.hide();
    }

    public addFace(event: MouseEvent) {
        callPersonAddFace(this, this.appsvc.dialogService, event, this.editdata);
    }

    public onAlertChange(alert: String) {
        this.callerObj.crudSvc.command(`alertchange/${this.editdata.id}`, { alertfld: alert}).subscribe(
            body => {
                this.callerObj.change = this.change = Date.now();
            },
            err => {
                this.callerObj.appsvc.showSnackbar(err);
            },
            () => {}
        );
    }

    public savePersonFace(faceid:string, item: any, refdlg?: MdlDialogReference) {
    
        this.callerObj.crudSvc.command(`addfaceface/${faceid}`, item).subscribe(
            body => {
                this.callerObj.change = this.change = Date.now();
            },
            err => {
                this.callerObj.appsvc.showSnackbar(err);
            },
            () => {
                (refdlg ? refdlg.hide() : null);
            }
        );
      
    }

}

export function callPersonData(caller: PersonComponent, dialogService: MdlDialogService, event: MouseEvent, item?: any) {

    let pDialog = dialogService.showCustomDialog({
        component: PersonDataComponent,
        providers: [
            { provide: 'caller', useValue: caller },
            { provide: 'editdata', useValue: item },
        ],
        isModal: true,
        openFrom: event,
        styles: { 'width': '520px', 'max-height': '100%', 'overflow-y': 'scroll' },
        clickOutsideToClose: true,
        enterTransitionDuration: 400,
        leaveTransitionDuration: 400
    });

    pDialog.subscribe((dialogReference: MdlDialogReference) => console.log('PersonData visible', dialogReference));
}


@Component({
    selector: 'person-data-dialog',
    template: `
<div class="exc-table_options">            
    <button mdl-button mdl-button-type="icon" class="exc-dimmed" (click)="closeDialog()">
        <mdl-icon>close</mdl-icon>
    </button>
</div>

    <h4 class="mdl-dialog__title">Person <small><small>{{editdata.id}}</small></small></h4>
    <div class="mdl-dialog__content">
        <personpage [editdata]="editdata"></personpage>
    </div>
    <div class="mdl-dialog__actions">

        <button mdl-button (click)="saveData()" mdl-ripple mdl-colored="primary">Save</button>
        <button mdl-button (click)="closeDialog()" mdl-ripple>Cancel</button>
    </div>

`,
    providers: [AppService]
})
export class PersonDataComponent implements OnInit, IMdlCustomDialog {
    protected editdata: IPersonTableItem;
    protected callerObj: PersonComponent;

    constructor(
        public appsvc: AppService,
        private vcRef: ViewContainerRef,
        private dialog: MdlDialogReference,
        @Inject('editdata') editdata: IPersonTableItem,
        @Inject('caller') callerObj: PersonComponent,
    ) {
        this.editdata = editdata;
        this.callerObj = callerObj;
        this.dialog.onHide().subscribe(() => console.log('PersonData dialog hidden'));
    }

    ngOnInit() {
    }
    get viewContainerRef() {
        return this.vcRef;
    }

    public saveData() {
        this.callerObj.storeData(this.editdata, this.dialog);
    }

    public closeDialog() {
        this.dialog.hide();
    }

    @HostListener('keydown.esc')
    public onEsc(): void {
        this.dialog.hide();
    }
}
