import {FormGroupState} from 'ngrx-forms';
import {FormValue} from './form-value.interface';

export interface StoreState {
    formState: FormGroupState<FormValue>;
}
