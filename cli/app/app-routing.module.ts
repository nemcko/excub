import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CanDeactivateGuard } from './lib/can-deactivate-guard.service';
import { AuthGuard } from './lib/auth-guard.service';
import { PreloadSelectedModules } from './lib/selective-preload-strategy';

import { HomeComponent } from './home/home.component';
import { SourceComponent } from './source/source.component';
import { PersonComponent } from './person/index';
import { FaceComponent } from './face/index';

const appRoutes: Routes = [
  {
    path: 'home',
    component: HomeComponent,    
    canLoad: [AuthGuard]
  },
  {
    path: 'sources',
    component: SourceComponent,    
    canLoad: [AuthGuard]
  },
  {
    path: 'persons',
    component: PersonComponent,    
    canLoad: [AuthGuard]
  },
  {
    path: 'faces',
    component: FaceComponent,    
    canLoad: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { preloadingStrategy: PreloadSelectedModules }
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [
    CanDeactivateGuard,
    PreloadSelectedModules
  ]
})
export class AppRoutingModule {}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/