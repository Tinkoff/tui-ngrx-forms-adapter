import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {DisableAction, EnableAction, MarkAsTouchedAction, ResetAction} from 'ngrx-forms';
import {TuiNgrxFormsAdapterDirective} from 'tui-ngrx-forms-adapter';
import {formId} from './common';
import {selectFormState} from './store';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    @ViewChild(TuiNgrxFormsAdapterDirective)
    adapterDir!: TuiNgrxFormsAdapterDirective<string>;

    formGroupState$ = this.store.select(selectFormState as any);

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

    markAsTouched() {
        this.store.dispatch(new MarkAsTouchedAction(`${formId}.textInput`));
    }
}
