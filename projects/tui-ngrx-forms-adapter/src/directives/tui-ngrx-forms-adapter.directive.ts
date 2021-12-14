import {Directive, forwardRef, Injector, Input, OnInit} from '@angular/core';
import {FormControl, NgControl} from '@angular/forms';
import {AbstractTuiNullableControl, TUI_FOCUSABLE_ITEM_ACCESSOR} from '@taiga-ui/cdk';
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
    private tuiControl!: AbstractTuiNullableControl<T>;
    private onChangeCallback!: (val: T | null) => void;
    private onTouchedCallback!: () => void;

    readonly control = new FormControl();

    @Input('ngrxFormControlState')
    set controlState(ctrState: FormControlState<FormControlValueTypes>) {
        if (ctrState.isUntouched) {
            this.control.markAsUntouched();
        }

        if (ctrState.isTouched) {
            this.control.markAsTouched();
        }

        this.control.setErrors(ctrState.isValid ? null : ctrState.errors);
    }

    constructor(private injector: Injector) {
        super();
    }

    ngOnInit() {
        this.tuiControl = this.injector.get<AbstractTuiNullableControl<T>>(
            TUI_FOCUSABLE_ITEM_ACCESSOR,
        );
    }

    setViewValue(value: T | null) {
        this.control.setValue(value);
        this.tuiControl.writeValue(value);
    }

    setOnChangeCallback(fn: (value: T | null) => void) {
        this.onChangeCallback = this.generateOnChangeCallback(fn);
        this.tuiControl.registerOnChange(this.onChangeCallback);
    }

    setOnTouchedCallback(fn: () => void) {
        this.onTouchedCallback = fn;
        this.tuiControl.registerOnTouched(this.onTouchedCallback);
    }

    setIsDisabled(isDisabled: boolean) {
        if (isDisabled) {
            this.control.disable();
        } else {
            this.control.enable();
        }

        this.tuiControl.setDisabledState();
    }

    viewToModelUpdate() {}

    setControlStateValue(value: T | null) {
        if (this.onChangeCallback) {
            this.onChangeCallback(value);
        }
    }

    markControlAsTouched() {
        if (this.onTouchedCallback) {
            this.control.markAsTouched();
            this.onTouchedCallback();
        }
    }

    private generateOnChangeCallback(
        fn: (value: T | null) => void,
    ): (val: T | null) => void {
        return (val: T | null) => {
            this.control.setValue(val);
            fn(val);
        };
    }
}
