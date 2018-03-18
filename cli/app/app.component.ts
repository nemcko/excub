import {
    Component,
    Directive,
    ViewChildren,
    QueryList,
    Input,
    ViewContainerRef,
    ViewChild,
    ReflectiveInjector,
    ComponentFactoryResolver,
    AfterViewInit
} from '@angular/core';
import { MdlMenuComponent } from 'angular2-mdl';
import { Router } from '@angular/router';
import { AuthService } from './lib/auth.service';
import { AppService, IAppMainMenuData } from './app.service';

import { LoginMenuComponent } from './login/login.component';
import { HomeMenuComponent } from './home/home.component';
import { SourceMenuComponent } from './source/source.component';
import { PersonMenuComponent } from './person/index';
import { FaceMenuComponent } from './face/index';


class User {
    fullname: string = 'Ferko Mrkvicka';
    username: string = 'fero';
    role: string = 'user';
    photo: string ='assets/camera.png';
}

declare var __moduleName: string;


@Component({
    selector: 'menu-component',
    entryComponents: [LoginMenuComponent,HomeMenuComponent, SourceMenuComponent, PersonMenuComponent, FaceMenuComponent], 
    template: `
    <div #menuComponentContainer></div>
  `,
})
export class MenuComponent {
    currentComponent:any = null;

    @ViewChild('menuComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer: ViewContainerRef;

    @Input() set menuData(data: IAppMainMenuData) {
        if (!data || !data.component || data.component === undefined) {
            return;
        }

        let inputProviders = Object.keys(data.inputs).map((inputName) => { return { provide: inputName, useValue: data.inputs[inputName] }; });
        let resolvedInputs = ReflectiveInjector.resolve(inputProviders);
        let injector = ReflectiveInjector.fromResolvedProviders(resolvedInputs, this.dynamicComponentContainer.parentInjector);
        let factory = this.resolver.resolveComponentFactory(data.component);
        let component = factory.create(injector);

        this.dynamicComponentContainer.insert(component.hostView);

        if (this.currentComponent) {
            this.currentComponent.destroy();
        }

        this.currentComponent = component;
    }

    constructor(private resolver: ComponentFactoryResolver) {

    }
}



@Component({
    moduleId: __moduleName,
    selector: 'root-app',
    templateUrl: 'app.component.html',
    providers: [AppService]
})
export class AppComponent implements AfterViewInit {
    protected user: User = new User(); 
    protected largeMenu: boolean = true;


    @ViewChildren(MdlMenuComponent) private menuComponents: QueryList<MdlMenuComponent>;

    constructor(
        public authService: AuthService,
        private appsvc: AppService,
        private router: Router
    ) { 
    }

    public ngAfterViewInit() {
    }


    get currentUser() {
        return this.user;
    }

    protected selectSubmenu(submenu: any): void {
        if (this.appsvc.activemenu === submenu) {
            this.appsvc.activemenu = {};
        } else {
            this.appsvc.activemenu = submenu;
        }
    }

    protected toggleMenu(submenu: any,imenu: string, ibtn: string, evnt: Event): void {
        let submnu: HTMLElement = document.getElementById(imenu);
        let button: HTMLElement = document.getElementById(ibtn);
        this.menuComponents.forEach((menu) => {
            if (submnu === (<any>menu).menuElement.parentElement.parentElement.parentElement) {
                this.appsvc.activemenu = submenu;
                menu.toggle(evnt, (<any>{ element: button }));
            } else {
                menu.hide();
            }
        });

    }

    protected selectMenuItem(menuitem: any) {
        this.router.navigate([menuitem.href]);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    get menuData(): any {
        return this.appsvc.mainmenu;
    }
}