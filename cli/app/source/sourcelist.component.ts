import { Component, ViewChild, ViewContainerRef, Inject, HostListener } from '@angular/core';
import { IMdlTableModelItem, MdlDefaultTableModel, MdlDialogService, IMdlCustomDialog, MdlDialogReference, MdlButtonComponent } from 'angular2-mdl';
import { MdlSelectModule } from '@angular2-mdl-ext/select';
import { NavpanelComponent, CrudService, INavpanelData } from '../lib/navpanel';
import { AppService } from '../app.service';

import { SourceList, ISourceTableItem, SourceDetailComponent, callSourceDetail} from '../source/index';

declare var __moduleName: string;


@Component({
    moduleId: __moduleName,
    selector: 'sourcelist',
    templateUrl: 'sourcelist.component.html',
    inputs: ['oid','qvalue', 'numitems', 'autohidepanel'],
    providers: [AppService, CrudService]
})
export class SourcelistDirComponent extends SourceList {
    constructor(
        appsvc: AppService,
        crudSvc: CrudService,
    ) {
        super(appsvc, crudSvc);
    }

    public openDetail(event: MouseEvent, item?: ISourceTableItem) {

        this.crudSvc.command('getdetail', { source: item.id }).subscribe(
            body => {
                let xdata: any = this.crudSvc.getReceivedData(body);
                callSourceDetail(this, this.appsvc.dialogService, event, xdata);
            },
            err => {
                this.appsvc.showSnackbar(err);
            },
            () => { }
        );

    }
};

export function callSourceList(dialogService: MdlDialogService, event: MouseEvent, item?: any) {

    let pDialog = dialogService.showCustomDialog({
        component: SourcelistDlgComponent,
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

    pDialog.subscribe((dialogReference: MdlDialogReference) => console.log('SourcelistDlgComponent visible', dialogReference));
}

@Component({
    selector: 'source-list-dialog',
    template: `
<div class="exc-table_options">            
    <button mdl-button mdl-button-type="icon" class="exc-dimmed" (click)="closeDialog()">
        <mdl-icon>close</mdl-icon>
    </button>
</div>

    <h4 class="mdl-dialog__title">Source <small>{{editdata.id}}</small></h4>
    <div class="mdl-dialog__content">
        <sourcelist></sourcelist>
    </div>
    <div class="mdl-dialog__actions">
        <button #firstElement autofocus mdl-button (click)="closeDialog()" mdl-ripple>Cancel</button>
    </div>
`
})
export class SourcelistDlgComponent implements IMdlCustomDialog {
    @ViewChild('firstElement') private inputElement: MdlButtonComponent;
    protected editdata: ISourceTableItem;

    constructor(
        private vcRef: ViewContainerRef,
        private dialog: MdlDialogReference,
        @Inject('editdata') editdata: ISourceTableItem,
    ) {
        this.editdata = editdata;
        this.dialog.onHide().subscribe(() => console.log('SourceList dialog hidden'));
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

