import { Component, OnInit, OnDestroy, ViewContainerRef, AfterViewInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { IMdlTableModelItem, MdlDefaultTableModel, MdlDialogComponent, MdlDialogReference, MdlDialogService, IMdlCustomDialog, MdlTextFieldComponent } from 'angular2-mdl';
import { ViewChild } from "@angular/core";
import { HostListener } from "@angular/core";
import { NavpanelComponent, CrudService, INavpanelData } from '../lib/navpanel';
import { AppService } from '../app.service';

import { SourceList, ISourceTableItem} from '../source/source.component';
import { HlsPlayerComponent, PlayerModel } from '../hls/index';


@Component({
    selector: 'nasvideo',
    inputs: ['src', 'class','processed'],
    template: `
<video #video controls width="360" height="202" [ngSwitch]="fileext">
    <source *ngSwitchCase="mp4" src="{{nasuri}}" type="video/mp4">
    <source *ngSwitchCase="webm" src="{{nasuri}}" type="video/webm">
    <source *ngSwitchCase="mov" src="{{nasuri}}" type="video/quicktime">
    <source *ngSwitchCase="ogv" src="{{nasuri}}" type="video/ogg">
    <source *ngSwitchCase="mpg" src="{{nasuri}}" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'>
    <source *ngSwitchCase="mpeg" src="{{nasuri}}" type='video/mp4; codecs="mp4v.20.8, mp4a.40.2"'>
    <source *ngSwitchDefault src="{{nasuri}}">
</video>
`,
    providers: [AppService]
})
export class NasVideoComponent implements OnInit, OnDestroy {
    protected src: string;
    protected nasuri: string;
    protected fileext: string;
    protected processed: boolean = false;

    constructor(
        protected appsvc: AppService,
    ) { }

    ngOnInit() {
        this.nasuri = this.getUriFilename(this.src);
        this.fileext = this.src.substr(this.src.lastIndexOf('.') + 1);
    }

    ngOnDestroy() {
    }

    public getUriFilename(str?: string): string {
        if (str && this.processed && str.lastIndexOf(".") >= 0) {
            str = str.substr(0, str.lastIndexOf(".")) + '-processed' + str.substr(str.lastIndexOf("."));
        }
        return this.appsvc.apiUri + '/video/' + window.btoa(encodeURIComponent(str)) + '/' + encodeURIComponent(Date.now().toString());
    }

}

@Component({
    selector: 'sourcepage',
    inputs: ['editdata'],
    template: `

        <mdl-textfield #firstElement type="text" class="mdl-cell--3-col" label="Name" [(ngModel)]="editdata.name" floating-label autofocus></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--9-col" label="Note" [(ngModel)]="editdata.note" floating-label></mdl-textfield>

        <mdl-textfield type="text" class="mdl-cell--6-col" label="Source link" [(ngModel)]="editdata.source.source_link" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--2-col" label="Frame rate" [disabled]="!editdata.id" [(ngModel)]="editdata.source.frame_rate" floating-label></mdl-textfield>

        <div class="mdl-cell--3-col" style="display:inline-block">
            <mdl-select floating-label [(ngModel)]="editdata.source.source_type" placeholder="Source">
                <mdl-option value="video">video</mdl-option>
                <mdl-option value="image">image</mdl-option>
                <mdl-option value="camera">camera</mdl-option>
                <mdl-option value="folder">folder</mdl-option>
                <mdl-option value="scan_input">Scan folder (Input)</mdl-option>
                <mdl-option value="scan_training">Scan folder (Training)</mdl-option>
            </mdl-select>
        </div>

        <mdl-checkbox class="mdl-cell--1-col" [disabled]="!editdata.id" [(ngModel)]="editdata.source.training">
            Training
        </mdl-checkbox>


        <mdl-textfield type="text" class="mdl-cell--4-col" label="Rancher configuration" [(ngModel)]="editdata.processing.rancher_configuration" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--3-col" label="Graph group" [(ngModel)]="editdata.processing.graph_group" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--4-col" label="Filter mask" [disabled]="!editdata.id" [(ngModel)]="editdata.processing.filter_mask" floating-label></mdl-textfield>
        <mdl-textfield type="number" class="mdl-cell--1-col" label="Skip frames" [disabled]="!editdata.id" [(ngModel)]="editdata.processing.skip_frames" floating-label></mdl-textfield>

        <mdl-textfield type="text" class="mdl-cell--6-col" label="Output file" [(ngModel)]="editdata.output_file" floating-label></mdl-textfield>
        <mdl-textfield type="text" class="mdl-cell--6-col" label="Output rtmp" [(ngModel)]="editdata.output_rtmp" floating-label></mdl-textfield>

        <mdl-textfield type="text" class="mdl-cell--4-col" label="Key words" [disabled]="!editdata.id" [(ngModel)]="editdata.training.key_words" floating-label></mdl-textfield> <!--Array-->
        <mdl-textfield type="text" class="mdl-cell--3-col" label="Parent" [(ngModel)]="editdata.parent" floating-label></mdl-textfield>


        <div class="mdl-cell--2-col" style="display:inline-block">
            <mdl-select floating-label [disabled]="!editdata.id" [(ngModel)]="editdata.status" placeholder="Status">
                <mdl-option value="new">new</mdl-option>
                <mdl-option value="processing">processing</mdl-option>
                <mdl-option value="completed">completed</mdl-option>
            </mdl-select>
        </div>

        <mdl-textfield type="text" class="mdl-cell--6-col" label="Thumbnail url" [disabled]="!editdata.id" [(ngModel)]="editdata.thumbnail_url" floating-label></mdl-textfield> <!--Array-->

        <div class="mdl-cell--12-col"><small>Creation date: {{editdata.created | toDateTime | date: 'dd.MM.yy HH:mm'}}</small></div>

`,
    providers: [AppService, CrudService]
})
export class SourcePageComponent implements AfterViewInit {
    @ViewChild('firstElement') private inputElement: MdlTextFieldComponent;
    protected editdata: ISourceTableItem;

    constructor(
        protected appsvc: AppService,
    ) { }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.inputElement.setFocus();
        }, 1);
    }

}

export function callSourceDetail(caller: SourceList, dialogService: MdlDialogService, event: MouseEvent, item?: any) {

    let pDialog = dialogService.showCustomDialog({
        component: SourceDetailComponent,
        providers: [
            { provide: 'caller', useValue: caller },
            { provide: 'editdata', useValue: item },
        ],
        isModal: true,
        openFrom: event,
        styles: { 'width': '840px', 'max-height': '100%', 'overflow-y':'scroll'                /*,'box-shadow': '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12)'*/ },
        clickOutsideToClose: true,
        enterTransitionDuration: 400,
        leaveTransitionDuration: 400
    });

    pDialog.subscribe((dialogReference: MdlDialogReference) => console.log('SourceDetail visible', dialogReference));
}


@Component({
    selector: 'source-dialog',
    template: `

<div class="exc-table_options">            
    <button mdl-button mdl-button-type="icon" class="exc-dimmed" (click)="closeDialog()">
        <mdl-icon>close</mdl-icon>
    </button>
</div>

    <h4 class="mdl-dialog__title">Source <small><small>{{editdata.id}}</small></small></h4>
    <div class="mdl-dialog__content" style="min-height:480px;">

<mdl-tabs mdl-ripple mdl-tab-active-index="0" (mdl-tab-active-changed)="tabChanged($event)" style="align-items: left;">

    <mdl-tab-panel>
      <mdl-tab-panel-title>
        <mdl-icon class="mdl-color-text--primary">camera</mdl-icon> <span>Source data &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </mdl-tab-panel-title>
      <mdl-tab-panel-content>
            <br/>          
            <sourcepage [editdata]="editdata"></sourcepage>
            <br/>
            <br/>
            <div class="exc-cmdline mdl-cell--12-col">
                <button mdl-button (click)="saveData()" mdl-ripple mdl-colored="primary">Save data source</button>
            </div>
      </mdl-tab-panel-content>
    </mdl-tab-panel>





    <mdl-tab-panel [disabled]="editdata.source.source_type==='folder'">
      <mdl-tab-panel-title>
        <mdl-icon class="mdl-color-text--primary">movie_filter</mdl-icon> <span>Processed &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </mdl-tab-panel-title>
      <mdl-tab-panel-content>
            <br/>         
            <div class="exc-imagegrid" *ngIf="editdata.source.source_type==='image'">
                <div class="mdl-cell mdl-cell--6-col exc-imagegrid-cell">
                    <nasfile [src]="editdata.thumbnail_url" [period]="10" class="exc-image"></nasfile>
                </div>
                <div class="mdl-cell mdl-cell--6-col exc-imagegrid-cell">
                    <nasfile [src]="editdata.thumbnail_url" [period]="10" [processed]="true" class="exc-image"></nasfile>
                </div>
            </div>
            <div class="exc-imagegrid" *ngIf="editdata.source.source_type==='video'">
                <div class="mdl-cell mdl-cell--6-col exc-imagegrid-cell">
                    <nasvideo [src]="editdata.source.source_link"></nasvideo>
                </div>
                <div class="mdl-cell mdl-cell--6-col exc-imagegrid-cell">
                    <nasvideo [src]="editdata.source.source_link" [processed]="true"></nasvideo>
                </div>
            </div>
            <div class="exc-imagegrid" *ngIf="editdata.source.source_type==='camera'">
                <div class="mdl-cell mdl-cell--6-col exc-imagegrid-cell">
                    <hls-player [config]="playerConfig"></hls-player>                
                </div>
                <div class="mdl-cell mdl-cell--6-col exc-imagegrid-cell">
                    <hls-player [config]="playerConfig" [processed]="true"></hls-player>                
                </div>
            </div>

      </mdl-tab-panel-content>
    </mdl-tab-panel>


    <mdl-tab-panel [disabled]="editdata.source.source_type==='folder'">
      <mdl-tab-panel-title>
        <mdl-icon class="mdl-color-text--primary">face</mdl-icon> <span>Detected faces&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </mdl-tab-panel-title>
      <mdl-tab-panel-content>
            <br/>  
            <div class="exc-grid">
                <mdl-textfield type="time" class="mdl-cell--4-col" label="From time" [(ngModel)]="datfrom" floating-label></mdl-textfield>
                <mdl-textfield type="time" class="mdl-cell--4-col" label="To time" [(ngModel)]="datto" floating-label></mdl-textfield>
            </div>   
            <sourcefaces [oid]="'sourcefdet'" [qparent]="editdata.id" [numitems]="100" [autohidepanel]="false"></sourcefaces>
      </mdl-tab-panel-content>
    </mdl-tab-panel>


 </mdl-tabs>
  

    </div>
    <div class="mdl-dialog__actions">
        <button mdl-button (click)="closeDialog()" mdl-ripple>Cancel</button>
    </div>




`,
    providers: [AppService, CrudService, MdlDialogService]
})
export class SourceDetailComponent implements OnInit, IMdlCustomDialog, AfterViewInit {
    protected editdata: ISourceTableItem;
    protected callerObj: SourceList;
    protected playerConfig: PlayerModel;

    constructor(
        public appsvc: AppService,
        private vcRef: ViewContainerRef,
        private dialog: MdlDialogReference,
        @Inject('editdata') editdata: ISourceTableItem,
        @Inject('caller') callerObj: SourceList,
        @Inject(DOCUMENT) private document: any
   ) {
        this.editdata = editdata;
        this.callerObj = callerObj;
        this.dialog.onHide().subscribe(() => console.log('SourceDetail dialog hidden'));

        if (this.editdata.source.source_type === 'video' || this.editdata.source.source_type === 'camera') {
            this.playerConfig = new PlayerModel();
            this.playerConfig.width = 420;
            this.playerConfig.height = 230;
            this.playerConfig.source.url = (this.editdata.source.source_link && this.editdata.source.source_link.substring(0, 1) !== '/' ? this.editdata.source.source_link : this.document.location.protocol + '//' + this.document.location.host + this.editdata.source.source_link);
        }
    }

    public ngOnInit() {
    }
    public ngAfterViewInit() {
    }

    get viewContainerRef() {
        return this.vcRef;
    }

    public saveData() {
        this.callerObj.storeData(this.editdata);
    }

    public closeDialog() {
        this.dialog.hide();
    }

    public openItem(event: MouseEvent) {
        callSourceData(this.callerObj, this.appsvc.dialogService, null, this.editdata);
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



export function callSourceData(caller: SourceList, dialogService: MdlDialogService, event: MouseEvent, item?: any) {

    let pDialog = dialogService.showCustomDialog({
        component: SourceDataComponent,
        providers: [
            { provide: 'caller', useValue: caller },
            { provide: 'editdata', useValue: item },
        ],
        isModal: true,
        openFrom: event,
        styles: { 'width': '840px', 'max-height': '100%', 'overflow-y': 'scroll'},
        clickOutsideToClose: true,
        enterTransitionDuration: 400,
        leaveTransitionDuration: 400
    });

    pDialog.subscribe((dialogReference: MdlDialogReference) => console.log('SourceData visible', dialogReference));
}
@Component({
    selector: 'source-dialog2',
    template: `
<div class="exc-table_options">            
    <button mdl-button mdl-button-type="icon" class="exc-dimmed" (click)="closeDialog()">
        <mdl-icon>close</mdl-icon>
    </button>
</div>

    <h4 class="mdl-dialog__title">Source <small><small>{{editdata.id}}</small></small></h4>
    <div class="mdl-dialog__content">
        <sourcepage [editdata]="editdata"></sourcepage>
    </div>
    <div class="mdl-dialog__actions">

        <button mdl-button (click)="saveData()" mdl-ripple mdl-colored="primary">Save</button>
        <button mdl-button (click)="closeDialog()" mdl-ripple>Cancel</button>
    </div>

`,
    providers: [AppService, CrudService]
})
export class SourceDataComponent implements OnInit, IMdlCustomDialog {
    protected editdata: ISourceTableItem;
    protected callerObj: SourceList;

    constructor(
        public appsvc: AppService,
        private vcRef: ViewContainerRef,
        private dialog: MdlDialogReference,
        @Inject('editdata') editdata: ISourceTableItem,
        @Inject('caller') callerObj: SourceList,
    ) {
        this.editdata = editdata;
        this.callerObj = callerObj;
        this.editdata.parent = this.callerObj['rootElement'];

        this.dialog.onHide().subscribe(() => console.log('SourceData dialog hidden'));
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

