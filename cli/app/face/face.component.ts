import { Observable } from 'rxjs/Rx';
import { Component, Injector, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs";
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { IMdlTableModelItem, MdlDefaultTableModel, MdlDialogComponent, MdlDialogReference, MdlDialogService } from 'angular2-mdl';
import { MdlPopoverModule } from '@angular2-mdl-ext/popover';
import { MdlSelectModule } from '@angular2-mdl-ext/select';
import { AuthService } from '../lib/auth.service';
import { NavpanelComponent, CrudService, INavpanelData } from '../lib/navpanel';
import { AppService } from '../app.service';
import { callFaceDetail } from '../face/index';

export interface IFaceTableItem {
    id: string,
    type: string,
    source_id: string,
    timecode: string,
    person_id: string,
    person_id_type: string,
    thumbnail_url: string,
    status: string,
    face_detection: {
        box_original: [number],
        box_display: [number],
        completed: string
    },
    face_recognition: {
        face_fingerprint: [number],
        completed: string
    },
    graph_analysis: {
        graph_group: string,
        completed: string
    },
    training: {
        gender: string,
        age: string,
        race: string,
        mood: string
    },
    rules: {
        completed: string,
    },
    created: string
}



@Component({
    selector: 'nasfile',
    inputs: ['src', 'delay', 'period', 'class','processed'],
    template: '<img [src]="nasuri" [ngClass]="class" />',
    providers: [AppService]
})
export class NasfileComponent implements  OnInit, OnDestroy {
    protected subscription: Subscription;
    protected src: string;
    protected nasuri: string;
    protected delay: number = 0;
    protected period: number = 0;
    protected processed: boolean = false;

    constructor(
        protected appsvc: AppService,
    ) {
        this.src = this.nasuri = this.getUriFilename();
    }

    ngOnInit() {
        if (this.src) {
            if (this.period) {
                let timer = TimerObservable.create(this.delay*1000, this.period*1000);
                this.subscription = timer.subscribe(t => {
                    if (this.src) {
                        this.nasuri = this.getUriFilename(this.src);
                    }
                });
            } else {
                this.nasuri = this.getUriFilename(this.src);
            }
        }
    }

    ngOnDestroy() {
        if (this.period && this.subscription) this.subscription.unsubscribe();
    }

    public getUriFilename(str?: string): string {
        if (str && this.processed && str.lastIndexOf(".") >= 0) {
            str = str.substr(0, str.lastIndexOf(".")) + '-processed' + str.substr(str.lastIndexOf("."));
        }
        if (this.period) {
            let file: string = this.appsvc.apiUri + '/file/' + window.btoa(encodeURIComponent(str)) + '/' + encodeURIComponent(Date.now().toString())
            return (file ? file :'assets/null.png');
        } else {
            return (str ? 'static/' + str :'assets/null.png');
        }
    }

}

declare var __moduleName: string;

@Component({
    selector: 'source-menu',
    template: `
  `,
})
export class FaceMenuComponent {
    page: any;

    constructor(private injector: Injector) {
        this.page = this.injector.get('page');
    }
}

export class FaceList {
    protected search: any;
    protected navdata: INavpanelData = <INavpanelData>{ oid: 'face' };
    protected selrow: IFaceTableItem;
    public editdata: IFaceTableItem = <IFaceTableItem>{};
    public autohidepanel: boolean = false;
    public change: number = Date.now();

    get oid(): string {
        return this.navdata.oid;
    }
    get items(): Array<IFaceTableItem> {
        return this.navdata.items;
    }
    onData(data: INavpanelData) {
        this.navdata = data;
        for (let row in this.navdata.items) {
            this.navdata.items[row].type = this.navdata.items[row].type || '';
            this.navdata.items[row].source_id = this.navdata.items[row].source_id || '';
            this.navdata.items[row].timecode = this.navdata.items[row].timecode || '';
            this.navdata.items[row].person_id = this.navdata.items[row].person_id || '';
            this.navdata.items[row].person_id_type = this.navdata.items[row].person_id_type || '';
            this.navdata.items[row].thumbnail_url = this.navdata.items[row].thumbnail_url || '';
            this.navdata.items[row].status = this.navdata.items[row].status || '';
            this.navdata.items[row].face_detection = this.navdata.items[row].face_detection || {};
            this.navdata.items[row].face_detection.box_original = this.navdata.items[row].face_detection.box_original || 0;
            this.navdata.items[row].face_detection.box_display = this.navdata.items[row].face_detection.box_display || 0;
            this.navdata.items[row].face_detection.completed = this.navdata.items[row].face_detection.completed || '';
            this.navdata.items[row].face_recognition = this.navdata.items[row].face_recognition || {};
            this.navdata.items[row].face_recognition.face_fingerprint = this.navdata.items[row].face_recognition.face_fingerprint || 0;
            this.navdata.items[row].face_recognition.completed = this.navdata.items[row].face_recognition.completed || '';
            this.navdata.items[row].graph_analysis = this.navdata.items[row].graph_analysis || {};
            this.navdata.items[row].graph_analysis.graph_group = this.navdata.items[row].graph_analysis.graph_group || '';
            this.navdata.items[row].graph_analysis.completed = this.navdata.items[row].graph_analysis.completed || '';
            this.navdata.items[row].training = this.navdata.items[row].training || {};
            this.navdata.items[row].training.gender = this.navdata.items[row].training.gender || '';
            this.navdata.items[row].training.age = this.navdata.items[row].training.age || '';
            this.navdata.items[row].training.race = this.navdata.items[row].training.race || '';
            this.navdata.items[row].training.mood = this.navdata.items[row].training.mood || '';
            this.navdata.items[row].rules = this.navdata.items[row].rules || {};
            this.navdata.items[row].rules.completed = this.navdata.items[row].rules.completed || '';
            this.navdata.items[row].created = this.navdata.items[row].created || '';
        }
    }

    constructor(
        public appsvc: AppService,
        public crudSvc: CrudService,
        public authService?: AuthService,
    ) {
    };

    protected setQueryParam(uri: string) {
    }

    public preOpenDetail($event: MouseEvent, item?: IFaceTableItem) {
        if (item) {
            this.selrow = item;
            this.assignData(this.editdata, this.selrow);
        }
    }

    protected assignData(target: IFaceTableItem, source?: IFaceTableItem) {
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
        console.log(`dialog hidden`);
    }

    public openFaceDetail(event: MouseEvent, item?: IFaceTableItem) {
        this.crudSvc.postItem({ oid: 'sourceface', id: item.id, cmd: item.person_id }, {}).subscribe(
            body => {
                callFaceDetail(this, this.appsvc.dialogService, event, this.crudSvc.getReceivedData(body));
            },
            err => {
                this.appsvc.showSnackbar(err);
            },
            () => { }
        );
    }

    public removeFace(event: MouseEvent, item?: IFaceTableItem, refdlg?: MdlDialogReference) {

        let result = this.appsvc.dialogService.confirm('Do you want to remove this face?', 'No', 'Yes', '');
        event.preventDefault();
        result.subscribe(() => {
            this.crudSvc.command(`delpersonface/${item.id}`, {}).subscribe(
                body => {
                    (refdlg ? refdlg.hide() : null);
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
    templateUrl: 'face.component.html',
    providers: [AuthService, AppService, CrudService, MdlDialogService]
})
export class FaceComponent extends FaceList {
    @ViewChild('editDialog') public editDialog: MdlDialogComponent;


    constructor(
        appsvc: AppService,
        crudSvc: CrudService,
        authService: AuthService,
    ) {
        super(appsvc, crudSvc, authService);

        appsvc.header = {
            title: 'Faces',
            desc: 'Mantain application data sources',
            mainmenu: {
                component: FaceMenuComponent,
                inputs: { page: this }
            }
        };
    }



    public openDetail($event: MouseEvent, item?: IFaceTableItem) {
        super.preOpenDetail($event, item);
        this.editDialog.config.openFrom = $event;
        this.editDialog.show();

    }

}
