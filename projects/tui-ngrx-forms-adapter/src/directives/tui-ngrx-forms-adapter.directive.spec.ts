import {ChangeDetectionStrategy, Component, DebugElement} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    TuiFieldErrorComponent,
    TuiFieldErrorModule,
    TuiInputComponent,
    TuiInputModule,
} from '@taiga-ui/kit';
import {
    createFormControlState,
    FormControlState,
    markAsTouched,
    markAsUntouched,
    NgrxFormsModule,
    setErrors,
} from 'ngrx-forms';
import {BehaviorSubject} from 'rxjs';
import {TuiNgrxFormsAdapterModule} from '../module';
import {TuiNgrxFormsAdapterDirective} from './tui-ngrx-forms-adapter.directive';

describe('NgrxTuiControlViewAdapterDirective', () => {
    let fixture: ComponentFixture<TestedComponentWrapper>;
    let inputElem: DebugElement;
    let inputComponent: TuiInputComponent;
    let adapterDirective: TuiNgrxFormsAdapterDirective<string>;
    let formControlState$: BehaviorSubject<FormControlState<string>>;

    @Component({
        template: `
            <tui-input
                #textAdapter="adapter"
                [ngrxFormControlState]="formControl$ | async"
            >
                test input label
            </tui-input>
            <tui-field-error [formControl]="textAdapter.control"></tui-field-error>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class TestedComponentWrapper {
        formControl$ = new BehaviorSubject<FormControlState<string>>(
            createFormControlState<string>('test', ''),
        );
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestedComponentWrapper],
            imports: [
                TuiInputModule,
                NgrxFormsModule,
                TuiNgrxFormsAdapterModule,
                TuiFieldErrorModule,
                FormsModule,
                ReactiveFormsModule,
                BrowserAnimationsModule,
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestedComponentWrapper);
        formControlState$ = fixture.componentInstance.formControl$;
        inputElem = fixture.debugElement.query(By.directive(TuiInputComponent));
        inputComponent = inputElem.componentInstance;
        adapterDirective = inputElem.injector.get(TuiNgrxFormsAdapterDirective);
        fixture.detectChanges();
    });

    it('Если вызывается setViewValue директивы, то вызывается writeValue компонента с тем же аргументом', () => {
        // arrange

        spyOn(inputComponent, 'writeValue');

        // act
        adapterDirective.setViewValue('hello');

        // assert
        expect(inputComponent.writeValue).toHaveBeenCalledWith('hello');
    });

    it('Если вызывается setViewValue директивы, то это значение записывается в FormControl', () => {
        // arrange
        spyOn(inputComponent, 'writeValue');

        // act
        adapterDirective.setViewValue('hello');

        // assert
        expect(adapterDirective.control.value).toBe('hello');
    });

    it('Если вызывается setOnChangeCallback директивы, то вызывается registerOnChange компонента и туда передается колбэк, который сгенерен в generateOnChangeCallback', () => {
        // arrange
        const cb = () => {};

        // act
        fixture.detectChanges();
        // @ts-ignore
        spyOn(adapterDirective, 'generateOnChangeCallback').and.returnValue(cb);
        spyOn(inputComponent, 'registerOnChange');
        adapterDirective.setOnChangeCallback(() => {});

        // assert
        expect(inputComponent.registerOnChange).toHaveBeenCalledWith(cb);
    });

    it('Если вызывается setOnChangeCallback директивы, то колбэк, который сгенерен в generateOnChangeCallback, сохраняется в переменную onChangeCallback', () => {
        // arrange
        const cb = () => {};

        // act
        fixture.detectChanges();
        // @ts-ignore
        spyOn(adapterDirective, 'generateOnChangeCallback').and.returnValue(cb);
        spyOn(inputComponent, 'registerOnChange');
        adapterDirective.setOnChangeCallback(() => {});

        // assert
        // @ts-ignore
        expect(adapterDirective.onChangeCallback).toBe(cb);
    });

    it('Если вызывается setOnTouchedCallback директивы, то вызывается registerOnTouched компонента с тем же аргументом', () => {
        // arrange
        const callback = () => {};

        spyOn(inputComponent, 'registerOnTouched');

        // act
        fixture.detectChanges();
        adapterDirective.setOnTouchedCallback(callback);

        // assert
        expect(inputComponent.registerOnTouched).toHaveBeenCalledWith(callback);
    });

    it('Если вызывается setOnTouchedCallback директивы, то переданный в неё колбэк записывается в переменную onTouchedCallback', () => {
        // arrange
        const callback = () => {};

        spyOn(inputComponent, 'registerOnTouched');

        // act
        fixture.detectChanges();
        adapterDirective.setOnTouchedCallback(callback);

        // assert
        // @ts-ignore
        expect(adapterDirective.onTouchedCallback).toBe(callback);
    });

    it('Если вызывается setIsDisabled(true) директивы, то компонент дизейблится', () => {
        // arrange & act
        fixture.detectChanges();
        adapterDirective.setIsDisabled(true);

        // assert
        expect(inputComponent.disabled).toEqual(true);
    });

    it('Если вызывается setIsDisabled(false) директивы, то компонент энейблится', () => {
        // arrange & act
        fixture.detectChanges();
        adapterDirective.setIsDisabled(false);

        // assert
        expect(inputComponent.disabled).toEqual(false);
    });

    it('Если вызывается функция, сгенеренная методом generateOnChangeCallback, то устанавливается значение FormControl', () => {
        // arrange & act
        fixture.detectChanges();

        // @ts-ignore
        const cb = adapterDirective.generateOnChangeCallback(() => {});

        cb('hello');

        expect(adapterDirective.control.value).toBe('hello');
    });

    it('Если вызывается функция, сгенеренная методом generateOnChangeCallback, то вызывается метод, который был передан при генерации', () => {
        // arrange
        const obj = {
            // @ts-ignore
            fn: (val: string) => {},
        };

        spyOn(obj, 'fn').and.callThrough();

        // act
        fixture.detectChanges();

        // @ts-ignore
        const cb = adapterDirective.generateOnChangeCallback(obj.fn);

        cb('hello');

        expect(obj.fn).toHaveBeenCalledWith('hello');
    });

    it('Если вызывается setControlStateValue адаптера, то вызывается колбэк, сохраненный в onChangeCallback', () => {
        // arrange
        adapterDirective.setOnChangeCallback(() => {});

        // @ts-ignore
        spyOn(adapterDirective, 'onChangeCallback').and.returnValue();

        // act
        adapterDirective.setControlStateValue('hello');

        // assert
        // @ts-ignore
        expect(adapterDirective.onChangeCallback).toHaveBeenCalledWith('hello');
    });

    it('Если вызывается markControlAsTouched адаптера, то FormControl делаем touched', () => {
        // arrange
        spyOn(adapterDirective.control, 'markAsTouched').and.returnValue();
        // @ts-ignore
        spyOn(adapterDirective, 'onTouchedCallback').and.returnValue();

        // act
        adapterDirective.markControlAsTouched();

        // assert
        expect(adapterDirective.control.markAsTouched).toHaveBeenCalledTimes(1);
    });

    it('Если вызывается markControlAsTouched адаптера, то вызывается колбэк, сохраненный в onTouchedCallback', () => {
        // arrange
        // @ts-ignore
        spyOn(adapterDirective, 'onTouchedCallback').and.returnValue();

        // act
        adapterDirective.markControlAsTouched();

        // assert
        // @ts-ignore
        expect(adapterDirective.onTouchedCallback).toHaveBeenCalledTimes(1);
    });

    it('Если в состоянии isTouched становится true, то вызываем control.markAsTouched', () => {
        // arrange & act
        spyOn(adapterDirective.control, 'markAsTouched').and.returnValue();
        formControlState$.next(markAsUntouched(formControlState$.value));
        fixture.detectChanges();
        formControlState$.next(markAsTouched(formControlState$.value));
        fixture.detectChanges();

        // assert
        expect(adapterDirective.control.markAsTouched).toHaveBeenCalledTimes(1);
    });

    it('Если в состоянии isUntouched становится true, то вызываем control.markAsUntouched', () => {
        // arrange & act
        spyOn(adapterDirective.control, 'markAsUntouched').and.returnValue();
        formControlState$.next(markAsTouched(formControlState$.value));
        fixture.detectChanges();
        formControlState$.next(markAsUntouched(formControlState$.value));
        fixture.detectChanges();

        // assert
        expect(adapterDirective.control.markAsUntouched).toHaveBeenCalledTimes(1);
    });

    it('Если в состоянии приходят ошибки, то устанавливаем их в formControl', () => {
        // arrange & act
        formControlState$.next(
            setErrors(formControlState$.value, [{required: {actual: ''}}]),
        );

        fixture.detectChanges();

        // assert
        expect(adapterDirective.control.errors).toEqual({
            required: {
                actual: '',
            },
        });
    });

    it('Если состояние контрола валидное, то устанавливаем errors = null в formControl', () => {
        // arrange & act
        formControlState$.next({
            ...formControlState$.value,
            isValid: true,
        });

        fixture.detectChanges();

        // assert
        expect(adapterDirective.control.errors).toBe(null);
    });

    it('Если в состоянии приходят ошибки и isTouched = true, то в tui-field-error отображается текст', () => {
        // arrange & act
        formControlState$.next(
            markAsTouched(setErrors(formControlState$.value, [{required: {actual: ''}}])),
        );

        fixture.detectChanges();

        const errorElem = fixture.debugElement.query(
            By.directive(TuiFieldErrorComponent),
        );

        // assert
        expect(errorElem.nativeElement.textContent).toBe('Value is invalid');
    });
});
