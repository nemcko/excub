import { Observable } from 'rxjs/Rx';
import { Component, Injector, ViewChild, OnInit, Pipe, PipeTransform, ViewContainerRef, AfterViewInit, Inject, HostListener} from '@angular/core';
import { IMdlTableModelItem, MdlDefaultTableModel, MdlDialogComponent, MdlDialogReference, MdlDialogService, IMdlCustomDialog, MdlTextFieldComponent } from 'angular2-mdl';
import { MdlPopoverModule } from '@angular2-mdl-ext/popover';
import { MdlSelectModule } from '@angular2-mdl-ext/select';
import { AuthService } from '../lib/auth.service';
import { NavpanelComponent, CrudService, INavpanelData } from '../lib/navpanel';
import { AppService } from '../app.service';
import { ConfigService } from '../lib/config.service';

import { callSourceDetail, callSourceData } from '../source/sourcedlg.component';

export interface ISourceTableItem {
    id: string,
    type: string,
    name: string,
    note: string,
    source: {
        source_link: string,
        frame_rate: string,
        total_frames: number,
        source_type: string,
        training: 'boolean'
    },
    processing: {
        rancher_configuration: string,
        graph_group: string,
        filter_mask: string,
        skip_frames: number
    },
    output: {
        output_file: string,
        output_rtmp: string
    },
    training: {
        key_words: [string]
    },
    parent: string,
    status: string,
    created: string,
    thumbnail_url: string
}

declare var __moduleName: string;

@Component({
    selector: 'source-menu',
    template: `
    <div class="mdl-button mdl-button--raised" (click)="page.cleanTraining($event)">clean training tags</div>
    <div class="mdl-button mdl-button--raised" (click)="page.addKeyword($event)">add keyword</div>
    <div class="mdl-button mdl-button--raised" (click)="page.deleteSources($event)">delete sources</div>
  `,
})
export class SourceMenuComponent {
    page: any;

    constructor(private injector: Injector) {
        this.page = this.injector.get('page');
    }
}

export class SourceList {
    protected qparent: string;
    protected qtype: string;
    protected qvalue: string;
    protected navdata: any = <INavpanelData>{ oid: 'source' };
    protected selrow: ISourceTableItem;
    public editdata: ISourceTableItem = <ISourceTableItem>{ source: {}, processing: {}, output: {} };
    public autohidepanel: boolean = false;
    protected qtime: number;

    get oid(): string {
        return this.navdata.oid;
    }
    get items(): Array<ISourceTableItem> {
        return this.navdata.items;
    }
    onData(xdata: any) {
        this.navdata.pageNumber = xdata.pageNumber;
        this.navdata.pageLimit = xdata.pageLimit;
        this.navdata.pageCount = xdata.pageCount;
        this.navdata.items = xdata.items;
        for (let row in this.navdata.items) {
            this.navdata.items[row].type = this.navdata.items[row].type || '';
            this.navdata.items[row].name = this.navdata.items[row].name || '';
            this.navdata.items[row].note = this.navdata.items[row].note || '';
            this.navdata.items[row].source = this.navdata.items[row].source || {};
            this.navdata.items[row].source.source_link = this.navdata.items[row].source.source_link || '';
            this.navdata.items[row].source.frame_rate = this.navdata.items[row].source.frame_rate || '';
            this.navdata.items[row].source.total_frames = this.navdata.items[row].source.total_frames || 0;
            this.navdata.items[row].source.source_type = this.navdata.items[row].source.source_type || '';
            this.navdata.items[row].source.training = this.navdata.items[row].source.training || false;
            this.navdata.items[row].processing = this.navdata.items[row].processing || {};
            this.navdata.items[row].processing.rancher_configuration = this.navdata.items[row].processing.rancher_configuration || '';
            this.navdata.items[row].processing.graph_group = this.navdata.items[row].processing.graph_group || '';
            this.navdata.items[row].processing.filter_mask = this.navdata.items[row].processing.filter_mask || '';
            this.navdata.items[row].processing.skip_frames = this.navdata.items[row].processing.skip_frames || 0;
            this.navdata.items[row].output = this.navdata.items[row].output || {};
            this.navdata.items[row].output.output_file = this.navdata.items[row].output.output_file || '';
            this.navdata.items[row].output.output_rtmp = this.navdata.items[row].output.output_rtmp || '';
            this.navdata.items[row].training = this.navdata.items[row].training || {};
            this.navdata.items[row].training.key_words = this.navdata.items[row].training.key_words || [];
            this.navdata.items[row].parent = this.navdata.items[row].parent || '';
            this.navdata.items[row].status = this.navdata.items[row].status || '';
            this.navdata.items[row].created = this.navdata.items[row].created || '';
            this.navdata.items[row].thumbnail_url = this.navdata.items[row].thumbnail_url || '';
        }
    }

    constructor(
        protected appsvc: AppService,
        protected crudSvc: CrudService,
        protected authService?: AuthService,
    ) {
    };

    protected doSearch(value: string) {
        this.qvalue = value;
    }

    protected setQueryParam(value: string) {
        this.qtype = value;
    }

    public preOpenDetail($event: MouseEvent, item?: ISourceTableItem) {
        if (item) {
            this.selrow = item;
            this.assignData(this.editdata, this.selrow);
        }
    }

    protected assignData(target: ISourceTableItem, source?: ISourceTableItem) {
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

    public addQparam(data?: any): any {
        let qpval: any = {};
        if (this.qparent) (<any>qpval).qparent = this.qparent;
        if (this.qtype) (<any>qpval).qtype = this.qtype;
        if (this.qvalue) (<any>qpval).qvalue = this.qvalue;

        if (data) {
            if (data.training && data.training.key_words && typeof data.training.key_words === 'string') data.training.key_words = data.training.key_words.split(',');
            (<any>data).qparam = qpval;
            return data;
        } else {
            return { qparam: qpval };
        }
    }

    public storeData(data: ISourceTableItem, refdlg?: MdlDialogReference) {
        this.crudSvc.saveData({ oid: this.oid, id: data.id, pageLimit: this.navdata.pageLimit }, this.addQparam(data)).subscribe(
            body => {
                this.crudSvc.getReceivedItems(body, this.navdata);
                this.refresh();
            },
            err => {
                this.appsvc.showSnackbar(err);
            },
            () => {
                (refdlg ? refdlg.hide() : this.appsvc.showSnackbar('The data were stored.'));
            }
        );
    }

    public onDialogHide() {
        console.log(`dialog hidden`);
    }

    public refresh() {
        this.qtime = Date.now();
    }

};

@Pipe({ name: 'toDateTime' })
export class StringToDateTime implements PipeTransform {
    transform(value: any, args: string[]): any {
        if (value) {
            var timebits = /^([0-9]{4})-([0-9]{2})-([0-9]{2}).([0-9]{2}):([0-9]{2})(?::([0-9]*)(\.[0-9]*)?)?(?:([+-])([0-9]{2})([0-9]{2}))?/;
            var m = timebits.exec(value);
            if (m) {
                var utcdate = Date.UTC(parseInt(m[1]),
                    parseInt(m[2]) - 1,
                    parseInt(m[3]),
                    parseInt(m[4]), parseInt(m[5]),
                    (m[6] && parseInt(m[6]) || 0),
                    (m[7] && parseFloat(m[7]) * 1000) || 0);
                if (m[9] && m[10]) {
                    var offsetMinutes = parseInt(m[9]) * 60 + parseInt(m[10]);
                    utcdate += (m[8] === '+' ? -1 : +1) * offsetMinutes * 60000;
                }
                return new Date(utcdate);
            }
        }
    }
}

@Component({
    moduleId: __moduleName,
    templateUrl: 'source.component.html',
    providers: [AuthService, AppService, CrudService,MdlDialogService]
})
export class SourceComponent extends SourceList implements AfterViewInit {
    public editdata: ISourceTableItem = <ISourceTableItem>{};
    private _selrow: ISourceTableItem;
    public rconfig: any;

    @ViewChild('editDialog') public editDialog: MdlDialogComponent;
    public parentFolders: any;
    public rootElement: string;

    constructor(
        private _cfgsvc: ConfigService,
        public appsvc: AppService,
        public crudSvc: CrudService,
        authService: AuthService,
    ) {
        super(appsvc, crudSvc, authService); 
        this.rconfig = _cfgsvc.rancher;

        appsvc.header = {
            title: 'Sources',
            desc: 'Maintenance of application media data sources',
            mainmenu: {
                component: SourceMenuComponent,
                inputs: { page: this }
            }
        };
    }

    public ngAfterViewInit() {
        if (!this.appsvc.isLoggedIn) {
            this.appsvc.logInMe();
        }
    }

    onData(xdata: any) {
        this.rootElement = xdata.qparent;
        this.parentFolders = xdata.parentFolders;
        super.onData(xdata);
    }

    public onChangeParent(value:string) {
        this.qparent = value;
    }

    public editDetail(event: MouseEvent, item?: ISourceTableItem) {
        if (item) {
            this._selrow = item;
            this.assignData(this.editdata, this._selrow);
            callSourceDetail(this, this.appsvc.dialogService, event, item);
        } else {
            this.editdata = <ISourceTableItem>{ source: {}, processing: {}, output: {}, training: {}, status: 'new' };
            callSourceData(this, this.appsvc.dialogService, event, this.editdata);
        }
    }

    public isFolder(item: ISourceTableItem): boolean {
        return item && (item.source.source_type === String('folder') || item.source.source_type === String('scan_input') || item.source.source_type === String('scan_training'));
    }

    public openDetail(event: MouseEvent, item?: ISourceTableItem) {
        if (this.isFolder(item)) {
            this.onChangeParent(item.id);
        } else {
            this.editDetail(event, item);
        }
    }

    public activeIndex = 0;
    public tabChanged(index: any) {
        this.activeIndex = index;
    }

    public cleanTraining(event: MouseEvent) {
        let result = this.appsvc.dialogService.confirm('To clean all training tags in specific folder assigned to source type image and training?', 'No', 'Yes','');
        result.subscribe(() => {
            this.crudSvc.command('sourceclean', { source: this.qparent }).subscribe(
                body => {
                    this.appsvc.snackbarService.showToast('Folder was cleaned.');
                    this.refresh();
                },
                err => {
                    this.appsvc.showSnackbar(err);
                },
                () => {}
            );
        }, (err) => { });
    }

    public deleteSources(event: MouseEvent) {
        let result = this.appsvc.dialogService.confirm('Do you wish to delete all sources of current folder?', 'No', 'Yes', '');
        result.subscribe(() => {
            this.crudSvc.command('sourcedelete', { source: this.qparent }).subscribe(
                body => {
                    this.appsvc.snackbarService.showToast('Sources was cleaned.');
                },
                err => {
                    this.appsvc.showSnackbar(err);
                },
                () => { }
            );
        }, (err) => { });
    }

    public addKeyword(event: MouseEvent) {
        let pDialog = this.appsvc.dialogService.showCustomDialog({
            component: SourceAddWordComponent,
            providers: [
                { provide: 'caller', useValue: this },
            ],
            isModal: true,
            styles: { 'width': '380px', 'max-height': '100%', 'overflow-y': 'scroll'},
            clickOutsideToClose: true,
            enterTransitionDuration: 400,
            leaveTransitionDuration: 400
        });

        pDialog.subscribe((dialogReference: MdlDialogReference) => console.log('SourceDetail visible', dialogReference));
    }

    public saveKeyword(keyword: string, refdlg?: MdlDialogReference) {
        this.crudSvc.command('sourcekeyword', { source: this.qparent, keyword: keyword}).subscribe(
            body => {
                this.appsvc.snackbarService.showToast('Keyword ${keyword} was added.');
                this.refresh();
            },
            err => {
                this.appsvc.showSnackbar(err);
            },
            () => {
                (refdlg ? refdlg.hide() : null);
            }
        );
    }

    public removeRow(item: any, event?: MouseEvent) {
        this.crudSvc.command(`removesource/${item.id}/${this.navdata.pageLimit}`, this.addQparam()).subscribe(
            body => {
                this.crudSvc.getReceivedItems(body, this.navdata);
            },
            err => this.appsvc.showSnackbar(err),
            () => {
                this.refresh();
            }
        );
    }

    public deleteAll(item: any, event?: MouseEvent) {
        this.crudSvc.command('sourcedelall', { id: item.id, pageLimit: this.navdata.pageLimit }).subscribe(
            body => {
                this.crudSvc.getReceivedItems(body, this.navdata);
            },
            err => this.appsvc.showSnackbar(err),
            () => {
                this.refresh();
            }
        );
    }

    public deleteExc(item: any, event?: MouseEvent) {
        this.crudSvc.command('sourcedelexc', { id: item.id, pageLimit: this.navdata.pageLimit }).subscribe(
            body => {
                this.crudSvc.getReceivedItems(body, this.navdata);
            },
            err => this.appsvc.showSnackbar(err),
            () => {
                this.refresh(); 
            }
        );
    }

    public bgproc(id: string, menuitem: string, event?: MouseEvent) {
        this.crudSvc.command(`bgproc/run`, { source_id: id, rancher_configuration: menuitem }).subscribe(
            body => { },
            err => this.appsvc.showSnackbar(err),
            () => {
                this.refresh();
            }
        );
    }

}

@Component({
    selector: 'addkeyword-dialog',
    template: `

    <div class="mdl-dialog__content">

        <mdl-textfield #firstElement type="text" label="Add keyword" [(ngModel)]="keyword" floating-label autofocus></mdl-textfield>

    </div>
    <div class="mdl-dialog__actions">

        <button mdl-button (click)="saveData()" mdl-ripple mdl-colored="primary">Save</button>
        <button mdl-button (click)="closeDialog()" mdl-ripple>Cancel</button>
    </div>

`,
    providers: [AppService]
})
export class SourceAddWordComponent implements  IMdlCustomDialog, AfterViewInit {
    @ViewChild('firstElement') private inputElement: MdlTextFieldComponent;
    protected editdata: ISourceTableItem;
    protected callerObj: SourceComponent;
    public keyword: string;


    constructor(
        public appsvc: AppService,
        private vcRef: ViewContainerRef,
        private dialog: MdlDialogReference,
        @Inject('caller') callerObj: SourceComponent,
    ) {
        this.callerObj = callerObj;
        this.dialog.onHide().subscribe(() => console.log('addkeyword dialog hidden'));
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
        this.callerObj.saveKeyword(this.keyword, this.dialog);
    }

    public closeDialog() {
        this.dialog.hide();
    }

    @HostListener('keydown.esc')
    public onEsc(): void {
        this.dialog.hide();
    }
}
