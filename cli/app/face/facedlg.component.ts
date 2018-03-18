import { Component, OnInit, ViewContainerRef, AfterViewInit, Inject } from '@angular/core';
import { IMdlTableModelItem, MdlDefaultTableModel, MdlDialogComponent, MdlDialogReference, MdlDialogService, IMdlCustomDialog, MdlTextFieldComponent } from 'angular2-mdl';
import { ViewChild } from "@angular/core";
import { HostListener } from "@angular/core";
import { NavpanelComponent, CrudService, INavpanelData } from '../lib/navpanel';

import { AppService } from '../app.service';
import { FaceList, IFaceTableItem, callFaceAddFace} from '../face/index';

@Component({
    selector: 'facepagepage',
    inputs: ['editdata'],
    template: `
        <mdl-textfield #firstElement type="text" class="mdl-cell--3-col" label="ID" [(ngModel)]="editdata.source_id" floating-label autofocus></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--3-col" label="Time code" [(ngModel)]="editdata.timecode" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--3-col" label="Type" [(ngModel)]="editdata.type" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--3-col" label="ID code" [(ngModel)]="editdata.person_id" floating-label></mdl-textfield>
        <div class="mdl-cell--2-col" style="display:inline-block">
            <mdl-select floating-label [(ngModel)]="editdata.person_id_type" placeholder="Status">
                <mdl-option value="generated">generated</mdl-option>
                <mdl-option value="manual">manual</mdl-option>
            </mdl-select>
        </div>
        <mdl-textfield type="text" class="mdl-cell--7-col" label="Thumbnail url" [(ngModel)]="editdata.thumbnail_url" floating-label></mdl-textfield>
        <div class="mdl-cell--3-col" style="display:inline-block">
            <mdl-select floating-label [(ngModel)]="editdata.status" placeholder="status">
                <mdl-option value="detected">detected</mdl-option>
                <mdl-option value="facefingerprint">facefingerprint</mdl-option>
                <mdl-option value="facegraph">facegraph</mdl-option>
                <mdl-option value="completed">completed</mdl-option>
            </mdl-select>
        </div>

        <mdl-textfield type="text" class="mdl-cell--6-col" label="Box original" [(ngModel)]="editdata.face_detection.box_original" floating-label></mdl-textfield>

        <mdl-textfield type="text" class="mdl-cell--6-col" label="Box display" [(ngModel)]="editdata.face_detection.box_display" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--3-col" label="Det.compl." [(ngModel)]="editdata.face_detection.completed" floating-label></mdl-textfield>

        <mdl-textfield type="text" class="mdl-cell--3-col" label="fingerprint" [(ngModel)]="editdata.face_recognition.ace_fingerprint" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--3-col" label="Rec.compl." [(ngModel)]="editdata.face_recognition.completed" floating-label></mdl-textfield>

        <mdl-textfield type="text" class="mdl-cell--3-col" label="Graph group" [(ngModel)]="editdata.graph_analysis.graph_group" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--3-col" label="Anal.compl." [(ngModel)]="editdata.graph_analysis.completed" floating-label></mdl-textfield>

        <mdl-textfield type="text" class="mdl-cell--1-col" label="Gender" [(ngModel)]="editdata.training.gender" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--1-col" label="Age" [(ngModel)]="editdata.training.age" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--1-col" label="Race" [(ngModel)]="editdata.training.race" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--2-col" label="Mood" [(ngModel)]="editdata.training.mood" floating-label></mdl-textfield>

        <mdl-textfield type="text" class="mdl-cell--3-col" label="Train.compl." [(ngModel)]="editdata.rules.completed" floating-label></mdl-textfield>

        <mdl-textfield type="text" class="mdl-cell--3-col" label="Type code" [(ngModel)]="editdata.type" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--3-col" label="Face id1" [(ngModel)]="editdata.face_id_1" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--3-col" label="Face id2" [(ngModel)]="editdata.face_id_2" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--3-col" label="Weight" [(ngModel)]="editdata.weight" floating-label></mdl-textfield>
        <div class="mdl-cell--2-col" style="display:inline-block">
            <mdl-select floating-label [(ngModel)]="editdata.source" placeholder="Source">
                <mdl-option value="facerecognition">facerecognition</mdl-option>
                <mdl-option value="opticalflow">opticalflow</mdl-option>
                <mdl-option value="manual">manual</mdl-option>
            </mdl-select>
        </div>
`,
    providers: [AppService]
})
export class FacePageComponent implements AfterViewInit {
    @ViewChild('firstElement') private inputElement: MdlTextFieldComponent;
    protected editdata: IFaceTableItem;

    constructor(
        protected appsvc: AppService,
    ) { }

    public ngAfterViewInit() {

        setTimeout(() => {
            this.inputElement.setFocus();
        }, 1);
    }

}

export function callFaceDetail(caller: FaceList,dialogService: MdlDialogService, event: MouseEvent, item?: any) {
    let pDialog = dialogService.showCustomDialog({
        component: FaceDetailComponent,
        providers: [
            { provide: 'caller', useValue: caller },
            { provide: 'editdata', useValue: item },
        ],
        isModal: true,
        openFrom: event,
        styles: { 'width': '840px', 'max-height': '100%', 'overflow-y': 'scroll'                /*,'box-shadow': '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12)'*/ },
        clickOutsideToClose: true,
        enterTransitionDuration: 400,
        leaveTransitionDuration: 400
    });

    pDialog.subscribe((dialogReference: MdlDialogReference) => console.log('FaceDetail dialog visible', dialogReference));
}
@Component({
    selector: 'facet-dialog',
    template: `

<div class="exc-table_options">            
    <button mdl-button mdl-button-type="icon" class="exc-dimmed" (click)="closeDialog()">
        <mdl-icon>close</mdl-icon>
    </button>
</div>

    <h4 class="mdl-dialog__title">Face <small><small>{{editdata.id}} ({{editdata.person_id}}) </small></small></h4>
    <div class="mdl-dialog__content" style="min-height:480px;">

<mdl-tabs mdl-ripple mdl-tab-active-index="0" (mdl-tab-active-changed)="tabChanged($event)" style="align-items: left;">

    <mdl-tab-panel>
      <mdl-tab-panel-title>
        <mdl-icon class="mdl-color-text--primary">face</mdl-icon> <span>Face cutoff&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </mdl-tab-panel-title>
      <mdl-tab-panel-content>
            <br/>  
            <div mdl-cell--1-col>&nbsp;</div>
            <div class="mdl-cell mdl-cell--10-col">
                <nasfile [src]="editdata.thumbnail_url" [period]="10" class="exc-image"></nasfile>
            </div>
      </mdl-tab-panel-content>
    </mdl-tab-panel>

    <mdl-tab-panel>
      <mdl-tab-panel-title>
        <mdl-icon class="mdl-color-text--primary">insert_drive_file</mdl-icon> <span>Face data&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </mdl-tab-panel-title>
      <mdl-tab-panel-content>
            <br/>          
            <facepagepage [editdata]="editdata"></facepagepage>
            <br/>
            <br/>
            <div class="exc-cmdline mdl-cell--12-col">
                <button mdl-button (click)="saveData()" mdl-ripple mdl-colored="primary">Save face data</button>
            </div>
      </mdl-tab-panel-content>
    </mdl-tab-panel>


    <mdl-tab-panel>
      <mdl-tab-panel-title>
        <mdl-icon class="mdl-color-text--primary">people_outline</mdl-icon> <span>Connected faces&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </mdl-tab-panel-title>
      <mdl-tab-panel-content>

            <div class="exc-cmdline">
                <button mdl-button mdl-ripple mdl-colored="primary" (click)="addFace($event)">
                    Add face
                </button>
            </div>
            <facefaces [qparent]="editdata.id" [qvalue]="change" [numitems]="2000" [autohidepanel]="true"></facefaces>

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
export class FaceDetailComponent implements OnInit, IMdlCustomDialog {
    @ViewChild('firstElement') private inputElement: MdlTextFieldComponent;
    protected editdata: IFaceTableItem;
    protected callerObj: FaceList;
    protected change: number;

    constructor(
        public appsvc: AppService,
        private vcRef: ViewContainerRef,
        private dialog: MdlDialogReference,
        @Inject('editdata') editdata: IFaceTableItem,
        @Inject('caller') callerObj: FaceList,

    ) {
        this.editdata = editdata;
        this.callerObj = callerObj;
        this.dialog.onHide().subscribe(() => console.log('SourceDetail dialog hidden'));
    }

    ngOnInit() {
    }

    get viewContainerRef() {
        return this.vcRef;
    }

    public closeDialog() {
        this.dialog.hide();
    }

    public addFace(event: MouseEvent) {
        callFaceAddFace(this, this.appsvc.dialogService, event, this.editdata);
    }

    public saveFace(item: any, refdlg?: MdlDialogReference) {
        this.callerObj.crudSvc.command(`addfaceface/${this.editdata.id}`, item).subscribe(
            body => {
                this.change = this.callerObj.change = this.change = Date.now();
            },
            err => {
                this.callerObj.appsvc.showSnackbar(err);
            },
            () => {
                (refdlg ? refdlg.hide() : null);
            }
        ); 
    }

    public savePersonFace(faceid: string, item: any, refdlg?: MdlDialogReference) {

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

    public saveData() {
        //this.callerObj.storeData(this.editdata);
    }

    public activeIndex: number = 0;
    public tabChanged(index: number) {
        this.activeIndex = index;
    }

    @HostListener('keydown.esc')
    public onEsc(): void {
        this.dialog.hide();
    }
}


export function callFaceData(caller: FaceList,dialogService: MdlDialogService, event: MouseEvent, item?: any) {

    let pDialog = dialogService.showCustomDialog({
        component: FaceDataComponent,
        providers: [
            { provide: 'caller', useValue: caller },
            { provide: 'editdata', useValue: item },
        ],
        isModal: true,
        openFrom: event,
        styles: { 'width': '840px', 'max-height': '100%', 'overflow-y': 'scroll'                /*,'box-shadow': '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12)'*/ },
        clickOutsideToClose: true,
        enterTransitionDuration: 400,
        leaveTransitionDuration: 400
    });

    pDialog.subscribe((dialogReference: MdlDialogReference) => console.log('FaceData visible', dialogReference));
}
@Component({
    selector: 'face-dialog',
    template: `
    <h4 class="mdl-dialog__title">Face <small></small></h4>
    <div class="mdl-dialog__content">
        <facepagepage></facepagepage>
    </div>
    <div class="mdl-dialog__actions">

        <button mdl-button (click)="saveData()" mdl-ripple mdl-colored="primary">Save face data</button>
        <button mdl-button (click)="closeDialog()" mdl-ripple>Cancel</button>
    </div>

`
})
export class FaceDataComponent implements OnInit, IMdlCustomDialog, AfterViewInit {
    @ViewChild('firstElement') private inputElement: MdlTextFieldComponent;
    protected editdata: IFaceTableItem;
    protected callerObj: FaceList;

    constructor(
        private vcRef: ViewContainerRef,
        private dialog: MdlDialogReference,
        @Inject('editdata') editdata: IFaceTableItem,
        @Inject('caller') callerObj: FaceList,
    ) {
        this.editdata = editdata;
        this.callerObj = callerObj;
        this.dialog.onHide().subscribe(() => console.log('FaceData dialog hidden'));
    }

    ngOnInit() {
    }
    get viewContainerRef() {
        return this.vcRef;
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.inputElement.setFocus();
        }, 1);
    }

    public saveData() {
        this.dialog.hide();
    }

    public closeDialog() {
        this.dialog.hide();
    }

    @HostListener('keydown.esc')
    public onEsc(): void {
        this.dialog.hide();
    }
}
