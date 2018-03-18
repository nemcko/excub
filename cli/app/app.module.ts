import { NgModule, APP_INITIALIZER} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdlModule } from 'angular2-mdl';
import { MdlPopoverModule } from '@angular2-mdl-ext/popover';
import { MdlSelectModule } from '@angular2-mdl-ext/select';
import { HttpModule } from "@angular/http";
//import { MdlDialogComponent, MdlDialogService, MdlDialogReference } from 'angular2-mdl';

import { AppComponent, MenuComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginRoutingModule, LoginComponent, LoginButton, LoginMenuComponent } from './login/index';
import { ConfigService } from './lib/config.service';

import { NavpanelComponent, CrudService } from './lib/navpanel';
import { DialogService } from './lib/dialog.service';
import { AppService} from './app.service';

import { HomeComponent, HomeMenuComponent } from './home/home.component';
import {
    SourceComponent,
    SourceMenuComponent,
    SourceDetailComponent,
    SourceDataComponent,
    SourcePageComponent,
    SourcelistDirComponent,
    SourceAddWordComponent,
    NasVideoComponent,
    StringToDateTime,
} from './source/index';
import {
    PersonComponent,
    PersonMenuComponent,
    PersonDetailComponent,
    PersonDataComponent,
    PersonPageComponent,
} from './person/index';
import {
    FaceComponent,
    FaceMenuComponent,
    PersonfacesDirComponent,
    SourcefacesDirComponent,
    Person5facesDirComponent,
    FacePageComponent,
    FaceDetailComponent,
    FaceDataComponent,
    FacerulesDlgComponent,
    FacerulesDirComponent,
    PersonAddFaceDlgComponent,
    NasfileComponent,
    FaceAddFaceDlgComponent,
    FacefacesDirComponent,
} from './face/index';
import {
    HlsPlayerComponent,
    PlayerService
} from './hls/index';

@NgModule({
    declarations: [
        AppComponent, MenuComponent,
        LoginComponent, LoginMenuComponent,
        LoginButton,
        NavpanelComponent,
        //MdlDialogComponent,

        HomeComponent, HomeMenuComponent,
        SourceComponent, SourceMenuComponent, SourcelistDirComponent, SourceDetailComponent, SourceDataComponent, SourcePageComponent, StringToDateTime, SourceAddWordComponent, NasVideoComponent,
        PersonComponent, PersonMenuComponent, PersonDetailComponent, PersonDataComponent, PersonPageComponent,
        FaceComponent, FaceMenuComponent, FacePageComponent, FaceDetailComponent, PersonfacesDirComponent, SourcefacesDirComponent, FaceDataComponent, FacerulesDlgComponent, FacerulesDirComponent, PersonAddFaceDlgComponent, NasfileComponent, Person5facesDirComponent, FaceAddFaceDlgComponent, FacefacesDirComponent,
        HlsPlayerComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        MdlModule,
        MdlPopoverModule,
        MdlSelectModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        HttpModule,
        LoginRoutingModule,
    ],
    entryComponents: [
        SourceDetailComponent,
        SourceDataComponent,
        SourcePageComponent,
        SourcelistDirComponent,
        SourceAddWordComponent,
        PersonDetailComponent,
        PersonDataComponent,
        PersonPageComponent,
        FacePageComponent,
        FaceDetailComponent,
        FaceDataComponent,
        FacerulesDlgComponent,
        PersonAddFaceDlgComponent,
        FaceAddFaceDlgComponent,
        HlsPlayerComponent,
    ],
    providers: [
        DialogService,
//        MdlDialogReference,
        CrudService,
        AppService,
        ConfigService,
        PlayerService,
        { provide: APP_INITIALIZER, useFactory: (config: ConfigService) => () => config.load(), deps: [ConfigService], multi: true }
    ],
    bootstrap: [
        AppComponent
    ],
})
export class AppModule { }
