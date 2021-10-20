import {createSelector} from '@ngrx/store';
import {AppState} from '../common/app-state.interface';

const selectStore = (state: AppState) => state.store;

export const selectFormState = createSelector(selectStore, ({formState}) => formState);
