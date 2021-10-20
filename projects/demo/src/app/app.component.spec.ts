import {DebugElement} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {MockStore, MockStoreConfig, provideMockStore} from '@ngrx/store/testing';
import {TuiInputComponent} from '@taiga-ui/kit';
import {createFormGroupState} from 'ngrx-forms';
import {TuiNgrxFormsAdapterDirective} from '../../../tui-ngrx-forms-adapter/src/directives/tui-ngrx-forms-adapter.directive';
import {AppBrowserModule} from './app.browser.module';
import {AppComponent} from './app.component';

describe('AppComponent', () => {
    let fixture: ComponentFixture<AppComponent>;
    let inputElem: DebugElement;
    let adapterDirective: TuiNgrxFormsAdapterDirective<string>;
    let storeMock: MockStore;

    const initialState = {
        store: {
            formState: createFormGroupState('test', {
                textInput: 'hello',
            }),
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppBrowserModule],
            providers: [provideMockStore({initialState} as MockStoreConfig<any>)],
        });

        fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
    });

    it('Если в сторе есть состояние формы, то инитится директива TuiNgrxFormsAdapterDirective', () => {
        // arrange
        storeMock = TestBed.inject(Store) as MockStore;

        storeMock.setState({
            ...initialState,
        });

        fixture.detectChanges();

        fixture.detectChanges();
        inputElem = fixture.debugElement.query(By.directive(TuiInputComponent));
        adapterDirective = inputElem.injector.get(TuiNgrxFormsAdapterDirective);

        expect(adapterDirective).toBeTruthy();
    });
});
