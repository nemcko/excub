import { Component, Directive, Injector }        from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AppService } from '../app.service';
import { AuthService } from '../lib/auth.service';

declare var __moduleName: string;

@Component({
    selector: 'login-menu',
    template: `
  `,
})
export class LoginMenuComponent {
    page: any;

    constructor(private injector: Injector) {
        this.page = this.injector.get('page');
    }
}

class Login {
    protected message: string;

    constructor(
      public appsvc: AppService,
      public authService: AuthService,
      public router: Router
    ) {
    this.authService=authService;
    this.router=router;
    this.setMessage();
    this.appsvc.header = {
        title: '',
        desc: '',
        mainmenu: {
            component: LoginMenuComponent,
            inputs: { page: this }
        }
    };

  }

  setMessage(msg?:string) {
      this.message = (msg ? msg : '');
  }

  logInMe() {
    this.router.navigate(['/login']);
  }

  login(usr: string, pwd: string) {
      this.message = 'Trying to log in ...';
      this.authService.login(usr, pwd).subscribe(
          (res) => {

              let token:string = res.json();

              if (token) {
                  localStorage.setItem('currentUser', JSON.stringify({ username: usr, token: token }));
                  let redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/home';
                  let navigationExtras: NavigationExtras = {
                      preserveQueryParams: true,
                      preserveFragment: true
                  };

                  this.router.navigate([redirect], navigationExtras);
              }
          },
          err => {
              this.setMessage(err.statusText);
              this.appsvc.showSnackbar(err);
          },
          () => { }
      )
  };

  logout() {
    if (this.authService.isLoggedIn){
        this.authService.logout();
        this.setMessage();
        this.router.navigate(['/login']);
    }
  }

}



@Component({
    selector: 'loginbtn',
    template: `
        <a *ngIf="!authService.isLoggedIn" class="mdl-navigation__link" [ngClass]="{short: !largeMenu}" href="javascript:void(0)" (click)="logInMe()" style="padding-left: 40px !important;">
            <i class="mdl-color-text--blue-grey-500 material-icons" role="presentation">touch_app</i>
            <span class="hide-tabphone">LogIn</span>
        </a>
        <a *ngIf="authService.isLoggedIn" class="mdl-navigation__link" [ngClass]="{short: !largeMenu}" href="javascript:void(0)" (click)="logout()" style="padding-left: 40px !important;">
            <i class="mdl-color-text--blue-grey-500 material-icons" role="presentation">power_settings_new</i>
            <span class="hide-tabphone">LogOut</span>
        </a>
    `})
export class LoginButton extends Login {
    constructor(appsvc: AppService,authService: AuthService, router: Router) {
        super(appsvc,authService,router);
    }
}


@Component({
    moduleId: __moduleName,
    templateUrl: 'login.component.html',
    selector: 'login'
})
export class LoginComponent extends Login {
    public username = '';
    public password = '';

    constructor(appsvc: AppService,authService: AuthService, router: Router) {
        super(appsvc,authService,router);
    }
    submit(form:any) {
        this.login(form.username,form.password);
    }
}

