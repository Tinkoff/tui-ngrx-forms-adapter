import {Action, createReducer} from '@ngrx/store';
import {
    createFormGroupState,
    onNgrxForms,
    updateGroup,
    validate,
    wrapReducerWithFormStateUpdate,
} from 'ngrx-forms';
import {required} from 'ngrx-forms/validation';
import {formId, StoreState} from '../common';
import {FormValue} from '../common/form-value.interface';

const initialState: StoreState = {
    formState: updateGroup<FormValue>({
        textInput: validate(required),
    })(
        createFormGroupState<FormValue>(formId, {
            textInput: 'hello',
        }),
    ),
};

const reducer = wrapReducerWithFormStateUpdate(
    createReducer(initialState, onNgrxForms()),
    s => s.formState,
    updateGroup<FormValue>({
        textInput: validate(required),
    }),
);

export function storeReducer(state: StoreState | undefined, action: Action): StoreState {
    return reducer(state, action);
}
