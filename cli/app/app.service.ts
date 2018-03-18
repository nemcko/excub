import { Injectable, Component } from '@angular/core';
import { ViewContainerRef } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { MdlSnackbarService, MdlDialogService } from 'angular2-mdl';

import { ConfigService } from './lib/config.service';


export interface IAppMainMenuData {
    component: any,
    inputs: any
};
export interface IAppHeaderData {
    title: string;
    desc: string;
    mainmenu: IAppMainMenuData
};


export class MenuItem {
  constructor(public id: number, public name: string) { }
}

let menu: [any] = [
    {
        "title": "Settings",
        "icon": "settings",
        "name": "Settings",
        "desc": "Manage data in the application",
        "color": "mdl-color--light-blue",
        "links": [
            {
                "href": "/sources",
                "icon": "camera",
                "name": "Sources"
            },
            {
                "href": "/persons",
                "icon": "people",
                "name": "Persons"
            },
            {
                "href": "/home",
                "icon": "play_circle_filled",
                "name": "Execution"
            },
            {
                "href": "/home",
                "icon": "settings",
                "name": "Settings"
            }
        ]
    }];


let MenuPromise = Promise.resolve(menu);
let mainheaderdata: IAppHeaderData = <IAppHeaderData>{ title: '', desc: '', mainmenu: {} };

@Injectable()
export class AppService {
    public activemenu: any = menu[0];
    public viewConatinerRef: ViewContainerRef;
  
    constructor(
        private _cfgsvc: ConfigService,
        private _router: Router,
        public snackbarService: MdlSnackbarService,
        public dialogService: MdlDialogService,
    ) {}

    getMenus(): [any] { return menu[0].links; }

    get actsubmenu():any {
        return this.activemenu;
    }

    set actsubmenu(menu:any) {
        this.activemenu = menu;
    }

    getMenuItemes() { return MenuPromise; }

    getMenuItem(id: number | string) {
        return MenuPromise
            .then(heroes => heroes.find(hero => hero.id === +id));
    }

    get instName(): string {
        return this._cfgsvc.config.instname;
    }

    get apiUri(): string {
        return this._cfgsvc.config.apiUri;
    }


    get mainmenu(): any {
        return {
            component: mainheaderdata.mainmenu.component,
            inputs: mainheaderdata.mainmenu.inputs || { icon: 'exit' }
        }
    }

    set mainmenu(menu: any) {
        if (!menu) return;
        mainheaderdata.mainmenu.component = menu;
    }

    get header(): IAppHeaderData {
        return mainheaderdata;
    }
    set header(header: IAppHeaderData) {
        if (!header) return;
        mainheaderdata = header;
    }

    showSnackbar(message: string, tieout?:number) {
        this.snackbarService.showToast(message, tieout);
    }

    get token(): string {
        if (localStorage.getItem('currentUser')) {
            let currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
            return currentUser.token;
        }
        return undefined;
    }

    get isLoggedIn(): boolean {
        return typeof (this.token) !== "undefined" && this.token !== null;
    }

    logInMe() {
        localStorage.removeItem('currentUser');
        this.navigateTo('/login');
    }

    navigateTo(uri: string) {
        let navigationExtras: NavigationExtras = {
            preserveQueryParams: true,
            preserveFragment: true
        };
        this._router.navigate([uri], navigationExtras);
    }


}