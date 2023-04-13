import {Directive, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NgControl} from '@angular/forms';
import {
    FormControlState,
    FormControlValueTypes,
    FormViewAdapter,
    NGRX_FORM_VIEW_ADAPTER,
} from 'ngrx-forms';

@Directive({
    selector: '[ngrxFormControlState]',
    providers: [
        {
            provide: NGRX_FORM_VIEW_ADAPTER,
            useExisting: forwardRef(() => TuiNgrxFormsAdapterDirective),
            multi: true,
        },
        {
            provide: NgControl,
            useExisting: forwardRef(() => TuiNgrxFormsAdapterDirective),
        },
    ],
    exportAs: 'adapter',
})
export class TuiNgrxFormsAdapterDirective<T>
    extends NgControl
    implements FormViewAdapter, OnInit
{
    private readonly rawSetValue: (value: any, options?: any) => void;
    private readonly rawMarkAsTouched: () => void;
    private onTouchedCallback: (() => void) | null = null;
    private onChangeCallback: ((value: unknown) => void) | null = null;

    private _valueAccessor!: ControlValueAccessor;

    readonly control: FormControl;

    @Input('ngrxFormControlState')
    set controlState(ctrState: FormControlState<FormControlValueTypes>) {
        if (ctrState.isUntouched) {
            this.control.markAsUntouched();
        }

        if (ctrState.isTouched) {
            this.rawMarkAsTouched();
        }

        this.control.setErrors(ctrState.isValid ? null : ctrState.errors);
    }

    constructor() {
        super();

        const {control, rawSetValue, rawMarkAsTouched} = this.getPatchedFormControl();

        this.control = control;
        this.rawSetValue = rawSetValue;
        this.rawMarkAsTouched = rawMarkAsTouched;
    }

    ngOnInit() {
        // Value Accessor must be defined by TUI kit component
        this._valueAccessor = this.checkValueAccessor();
    }

    setViewValue(value: T | null) {
        this.rawSetValue(value, {
            onlySelf: true,
            emitEvent: false,
            emitViewToModelChange: false,
        });
        this._valueAccessor.writeValue(value);
    }

    setOnChangeCallback(onChangeCallback: (value: T | unknown) => void) {
        this.onChangeCallback = onChangeCallback;

        this._valueAccessor.registerOnChange((value: any) => {
            this.control.setValue(value);
        });
    }

    setOnTouchedCallback(onTouchedCallback: () => void) {
        this.onTouchedCallback = onTouchedCallback;

        this._valueAccessor.registerOnTouched(() => {
            this.control.markAsTouched();
        });
    }

    setIsDisabled(isDisabled: boolean) {
        if (isDisabled) {
            this.control.disable();
        } else {
            this.control.enable();
        }

        if (this._valueAccessor.setDisabledState) {
            this._valueAccessor.setDisabledState(isDisabled);
        }
    }

    viewToModelUpdate() {}

    markControlAsTouched() {
        this.control.markAsTouched();
    }

    private checkValueAccessor(): ControlValueAccessor {
        if (this.valueAccessor) {
            return this.valueAccessor;
        }

        throw new Error('Value accessor is not defined by TUI component');
    }

    private getPatchedFormControl(): {
        control: FormControl;
        rawSetValue: (value: any, options?: any) => void;
        rawMarkAsTouched: () => void;
    } {
        const control = new FormControl();
        const rawSetValue = control.setValue.bind(control);
        const rawMarkAsTouched = control.markAsTouched.bind(control);

        control.setValue = (value, ...args) => {
            rawSetValue(value, ...args);

            if (this.onChangeCallback) {
                this.onChangeCallback(value);
            }
        };

        control.markAsTouched = () => {
            rawMarkAsTouched();

            if (this.onTouchedCallback) {
                this.onTouchedCallback();
            }
        };

        return {control, rawSetValue, rawMarkAsTouched};
    }
}
