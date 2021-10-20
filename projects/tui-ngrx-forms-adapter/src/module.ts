import {NgModule} from '@angular/core';
import {TuiNgrxFormsAdapterDirective} from './directives/tui-ngrx-forms-adapter.directive';

@NgModule({
    declarations: [TuiNgrxFormsAdapterDirective],
    exports: [TuiNgrxFormsAdapterDirective],
})
export class TuiNgrxFormsAdapterModule {}
