import { Observable } from 'rxjs/Rx';
import { Component, Injector, ViewChild, OnInit } from '@angular/core';
import { MdlPopoverModule } from '@angular2-mdl-ext/popover';
import { MdlSelectModule } from '@angular2-mdl-ext/select';
import { AppService } from '../app.service';


declare var __moduleName: string;
@Component({
    selector: 'source-menu',
    template: `
  `,
})
export class HomeMenuComponent {
    page: any;

    constructor(private injector: Injector) {
        this.page = this.injector.get('page');
    }
}

@Component({
    moduleId: __moduleName,
    templateUrl: 'home.component.html',
})
export class HomeComponent {

    constructor(
        public appsvc: AppService,
    ) {
        this.appsvc.header = {
            title: '',
            desc: '',
            mainmenu: {
                component: HomeMenuComponent,
                inputs: { page: this }
            }
        };
    }

}

