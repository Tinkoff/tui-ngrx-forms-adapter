import {LocationStrategy, PathLocationStrategy} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {StoreModule} from '@ngrx/store';
import {TuiButtonModule, TuiErrorModule} from '@taiga-ui/core';
import {TuiFieldErrorModule, TuiInputModule} from '@taiga-ui/kit';
import {NgrxFormsModule} from 'ngrx-forms';
import {TuiNgrxFormsAdapterModule} from '../../../tui-ngrx-forms-adapter/src/module';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app.routes';
import {StaticModule} from './modules/static/static.module';
import {storeReducer} from './store/store.reducer';

@NgModule({
    bootstrap: [AppComponent],
    imports: [
        BrowserModule.withServerTransition({
            appId: 'demo',
        }),
        AppRoutingModule,
        StaticModule,
        StoreModule.forRoot({store: storeReducer}),
        TuiInputModule,
        TuiButtonModule,
        TuiErrorModule,
        TuiFieldErrorModule,
        BrowserAnimationsModule,
        NgrxFormsModule,
        TuiNgrxFormsAdapterModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [AppComponent],
    providers: [
        {
            provide: LocationStrategy,
            useClass: PathLocationStrategy,
        },
    ],
})
export class AppBrowserModule {}
