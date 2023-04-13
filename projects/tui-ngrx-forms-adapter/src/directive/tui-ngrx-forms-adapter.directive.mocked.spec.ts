import {ChangeDetectionStrategy, Component, DebugElement} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, NgControl, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MockDirective} from 'ng-mocks';
import {
    createFormControlState,
    markAsTouched,
    markAsUntouched,
    NgrxFormControlDirective,
    setErrors,
} from 'ngrx-forms';
import {BehaviorSubject} from 'rxjs';
import {TuiNgrxFormsAdapterDirective} from '../directive/tui-ngrx-forms-adapter.directive';

@Component({
    selector: 'fake-input',
    template: '',
})
class FakeInput {
    valueAccessor = {
        writeValue: jasmine.createSpy(),
        registerOnChange: jasmine.createSpy(),
        registerOnTouched: jasmine.createSpy(),
        setDisabledState: jasmine.createSpy(),
    };

    constructor(ngControl: NgControl) {
        ngControl.valueAccessor = this.valueAccessor;
    }
}

describe('NgrxTuiControlViewAdapterDirective tests with mock', () => {
    let fixture: ComponentFixture<TestedComponentWrapper>;
    let inputElem: DebugElement;
    let inputComponent: FakeInput;
    let adapterDirective: TuiNgrxFormsAdapterDirective<string>;

    @Component({
        template: `
            <fake-input [ngrxFormControlState]="formState$ | async"></fake-input>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class TestedComponentWrapper {
        formState$ = new BehaviorSubject(createFormControlState<string>('test', ''));
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                FakeInput,
                TestedComponentWrapper,
                TuiNgrxFormsAdapterDirective,
                MockDirective(NgrxFormControlDirective),
            ],
            imports: [FormsModule, ReactiveFormsModule, BrowserAnimationsModule],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestedComponentWrapper);
        inputElem = fixture.debugElement.query(By.css('fake-input'));
        inputComponent = inputElem.injector.get(FakeInput);
        adapterDirective = inputElem.injector.get(TuiNgrxFormsAdapterDirective);

        spyOn(adapterDirective.control, 'markAsUntouched');
        spyOn(adapterDirective.control, 'setErrors');
        spyOn(adapterDirective.control, 'disable');
        spyOn(adapterDirective.control, 'enable');

        fixture.detectChanges();
    });

    it('Если на вход подается значение и поле untouched, то вызываем markAsUntouched', () => {
        fixture.componentInstance.formState$.next(
            markAsUntouched(fixture.componentInstance.formState$.value),
        );

        fixture.detectChanges();

        expect(adapterDirective.control.markAsUntouched).toHaveBeenCalledTimes(1);
    });

    it('Если на вход подается значение и поле touched, то вызываем markAsTouched', () => {
        fixture.componentInstance.formState$.next(
            markAsTouched(fixture.componentInstance.formState$.value),
        );

        fixture.detectChanges();

        expect(adapterDirective.control.touched).toBeTrue();
    });

    it('Если на вход подается значение и поле валидно, то обнуляем ошибки', () => {
        fixture.componentInstance.formState$.next(
            setErrors(fixture.componentInstance.formState$.value, {}),
        );

        fixture.detectChanges();

        expect(adapterDirective.control.setErrors).toHaveBeenCalledOnceWith(null);
    });

    it('Если на вход подается значение и поле невалидно, то проставляем ошибки', () => {
        fixture.componentInstance.formState$.next(
            setErrors(fixture.componentInstance.formState$.value, {
                equalTo: {
                    actual: 'a',
                    comparand: 'b',
                },
            }),
        );

        fixture.detectChanges();

        expect(adapterDirective.control.setErrors).toHaveBeenCalledWith({
            equalTo: {
                actual: 'a',
                comparand: 'b',
            },
        });
    });

    it('Если вызываем setViewValue, то устанавливаем значение в контрол', () => {
        const onChangeCallback = jasmine.createSpy();

        adapterDirective.setOnChangeCallback(onChangeCallback);

        adapterDirective.setViewValue('hello');

        expect(adapterDirective.control.value).toBe('hello');
    });

    it('Если вызываем setViewValue, то не вызываем коллбэк изменения значения', () => {
        const onChangeCallback = jasmine.createSpy();

        adapterDirective.setOnChangeCallback(onChangeCallback);

        adapterDirective.setViewValue('hello');

        expect(onChangeCallback).toHaveBeenCalledTimes(0);
    });

    it('Если вызываем setViewValue, то вызываем метод valueAccessor.writeValue', () => {
        const onChangeCallback = jasmine.createSpy();

        adapterDirective.setOnChangeCallback(onChangeCallback);

        adapterDirective.setViewValue('hello');

        expect(inputComponent.valueAccessor.writeValue).toHaveBeenCalledWith('hello');
    });

    it('Если вызываем setOnChangeCallback и после этого взыываем control.setValue, то вызывается коллбэк, котобрый мы передали', () => {
        const onChangeCallback = jasmine.createSpy();

        adapterDirective.setOnChangeCallback(onChangeCallback);

        adapterDirective.control.setValue('hello');

        expect(onChangeCallback).toHaveBeenCalledWith('hello');
    });

    it('Если вызываем setOnChangeCallback, то вызываем valueAccessor.registerOnChange', () => {
        const onChangeCallback = jasmine.createSpy();

        adapterDirective.setOnChangeCallback(onChangeCallback);

        expect(inputComponent.valueAccessor.registerOnChange).toHaveBeenCalledTimes(1);
    });

    it('Если вызываем setOnTouchedCallback и после этого взыываем control.markAsTouched, то вызывается коллбэк, котобрый мы передали', () => {
        const onTouchedCallback = jasmine.createSpy();

        adapterDirective.setOnTouchedCallback(onTouchedCallback);

        adapterDirective.control.markAsTouched();

        expect(onTouchedCallback).toHaveBeenCalledWith();
    });

    it('Если вызываем setOnTouchedCallback и после этого взыываем markControlAsTouched, то вызывается коллбэк, котобрый мы передали', () => {
        const onTouchedCallback = jasmine.createSpy();

        adapterDirective.setOnTouchedCallback(onTouchedCallback);

        adapterDirective.markControlAsTouched();

        expect(onTouchedCallback).toHaveBeenCalledWith();
    });

    it('Если вызываем setOnTouchedCallback, то вызываем valueAccessor.registerOnTouched', () => {
        const onTouchedCallback = jasmine.createSpy();

        adapterDirective.setOnTouchedCallback(onTouchedCallback);

        expect(inputComponent.valueAccessor.registerOnTouched).toHaveBeenCalledTimes(1);
    });

    it('Если вызываем setIsDisabled со значением true, то дизейблим контрол', () => {
        adapterDirective.setIsDisabled(true);

        expect(adapterDirective.control.disable).toHaveBeenCalledTimes(1);
    });

    it('Если вызываем setIsDisabled со значением false, то энейблим контрол', () => {
        adapterDirective.setIsDisabled(false);

        expect(adapterDirective.control.enable).toHaveBeenCalledTimes(1);
    });

    it('Если вызываем setIsDisabled с каким-то значением, то вызвваем valueAccessor.setDisabledState с этим значением', () => {
        adapterDirective.setIsDisabled('someValue' as any);

        expect(inputComponent.valueAccessor.setDisabledState).toHaveBeenCalledWith(
            'someValue' as any,
        );
    });
});
