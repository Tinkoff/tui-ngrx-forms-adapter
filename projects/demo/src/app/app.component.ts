import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {TuiNgrxFormsAdapterDirective} from '@tinkoff/tui-ngrx-forms-adapter';
import {
    DisableAction,
    EnableAction,
    FormGroupState,
    MarkAsTouchedAction,
    ResetAction,
    SetValueAction,
} from 'ngrx-forms';
import {formId} from './common';
import {FormValue} from './common/form-value.interface';
import {selectFormState} from './store';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    @ViewChild(TuiNgrxFormsAdapterDirective)
    adapterDir!: TuiNgrxFormsAdapterDirective<string>;

    formGroupState$ = this.store.select<FormGroupState<FormValue> | undefined>(
        selectFormState as any,
    );

    constructor(private store: Store) {}

    disable() {
        this.store.dispatch(new DisableAction(`${formId}.textInput`));
    }

    enable() {
        this.store.dispatch(new EnableAction(`${formId}.textInput`));
    }

    reset() {
        this.store.dispatch(new ResetAction(`${formId}.textInput`));
    }

    changeValueFromStore() {
        this.store.dispatch(new SetValueAction(`${formId}.textInput`, 'store'));
    }

    markAsTouched() {
        this.store.dispatch(new MarkAsTouchedAction(`${formId}.textInput`));
    }
}
