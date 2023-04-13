import {LocationStrategy, PathLocationStrategy} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {StoreModule} from '@ngrx/store';
import {TuiButtonModule, TuiErrorModule} from '@taiga-ui/core';
import {TuiFieldErrorPipeModule, TuiInputModule} from '@taiga-ui/kit';
import {TuiNgrxFormsAdapterModule} from '@tinkoff/tui-ngrx-forms-adapter';
import {NgrxFormsModule} from 'ngrx-forms';
import {AppComponent} from './app.component';
import {storeReducer} from './store/store.reducer';

@NgModule({
    bootstrap: [AppComponent],
    imports: [
        BrowserModule.withServerTransition({
            appId: 'demo',
        }),
        StoreModule.forRoot({store: storeReducer}),
        TuiInputModule,
        TuiButtonModule,
        TuiErrorModule,
        TuiFieldErrorPipeModule,
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
