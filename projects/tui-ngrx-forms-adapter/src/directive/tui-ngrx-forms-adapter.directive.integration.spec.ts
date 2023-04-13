import {ChangeDetectionStrategy, Component, DebugElement} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {TuiFieldErrorModule, TuiInputComponent, TuiInputModule} from '@taiga-ui/kit';
import {TuiNgrxFormsAdapterDirective} from '@tinkoff/tui-ngrx-forms-adapter';
import {cold} from 'jasmine-marbles';
import {
    createFormControlState,
    disable,
    enable,
    FormControlState,
    MarkAsDirtyAction,
    markAsTouched,
    MarkAsTouchedAction,
    markAsUntouched,
    NgrxFormsModule,
    setErrors,
    setValue,
    SetValueAction,
} from 'ngrx-forms';
import {BehaviorSubject} from 'rxjs';
import {shareReplay} from 'rxjs/operators';
import {TuiNgrxFormsAdapterModule} from '../module';

describe('NgrxTuiControlViewAdapterDirective', () => {
    let fixture: ComponentFixture<TestedComponentWrapper>;
    let inputElem: DebugElement;
    let inputComponent: TuiInputComponent;
    let adapterDirective: TuiNgrxFormsAdapterDirective<string>;

    @Component({
        template: `
            <tui-input [ngrxFormControlState]="formControl$ | async">
                test input label
            </tui-input>
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
            providers: [provideMockStore()],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestedComponentWrapper);
        // formControlState$ = fixture.componentInstance.formControl$;
        inputElem = fixture.debugElement.query(By.css('tui-input'));
        inputComponent = inputElem.componentInstance;
        adapterDirective = inputElem.injector.get(TuiNgrxFormsAdapterDirective);
        fixture.detectChanges();
    });

    it('Если вводим значениие в поле, то отправляется события setValue и markAsDirty в стор', () => {
        const storeMock = TestBed.inject(MockStore);
        const nativeInput = inputElem.query(By.css('input')).nativeElement;

        const replayActions$ = storeMock.scannedActions$.pipe(shareReplay(2));

        replayActions$.subscribe();

        nativeInput.value = 'hello';
        nativeInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(replayActions$).toBeObservable(
            cold('(ab)', {
                a: new SetValueAction('test', 'hello'),
                b: new MarkAsDirtyAction('test'),
            }),
        );
    });

    it('Если ставим фокус на поле, а потом убираем, то отправляем в стор событие markAsTouched', () => {
        const storeMock = TestBed.inject(MockStore);
        const nativeInput = inputElem.query(By.css('input')).nativeElement;

        nativeInput.focus();
        nativeInput.blur();

        expect(storeMock.scannedActions$).toBeObservable(
            cold('a', {
                a: new MarkAsTouchedAction('test'),
            }),
        );
    });

    it('Если устанавливаем значение через control.setValue, то отправляем события setValue и markAsDirty в стор', () => {
        const storeMock = TestBed.inject(MockStore);

        const replayActions$ = storeMock.scannedActions$.pipe(shareReplay(2));

        replayActions$.subscribe();

        adapterDirective.control.setValue('hello');

        expect(replayActions$).toBeObservable(
            cold('(ab)', {
                a: new SetValueAction('test', 'hello'),
                b: new MarkAsDirtyAction('test'),
            }),
        );
    });

    it('Если отмечаем поле как touched через control.markAsTouched, то отправляем событие markAsTouched в стор', () => {
        const storeMock = TestBed.inject(MockStore);

        inputComponent.control!.markAsTouched();

        expect(storeMock.scannedActions$).toBeObservable(
            cold('a', {
                a: new MarkAsTouchedAction('test'),
            }),
        );
    });

    it('Если в сторе меняется значение поля, то оно меняется в контроле', () => {
        fixture.componentInstance.formControl$.next(
            setValue(fixture.componentInstance.formControl$.value, 'world'),
        );

        fixture.detectChanges();

        expect(inputComponent.control!.value).toBe('world');
    });

    it('Если в сторе поле отмечено как touched, то контрол становится touched', () => {
        fixture.componentInstance.formControl$.next(
            markAsTouched(fixture.componentInstance.formControl$.value),
        );

        fixture.detectChanges();

        expect(inputComponent.control!.touched).toBeTrue();
    });

    it('Если в сторе поле отмечено как untouched, то контрол становится untouched', () => {
        fixture.componentInstance.formControl$.next(
            markAsTouched(fixture.componentInstance.formControl$.value),
        );

        fixture.detectChanges();

        fixture.componentInstance.formControl$.next(
            markAsUntouched(fixture.componentInstance.formControl$.value),
        );

        fixture.detectChanges();

        expect(inputComponent.control!.touched).toBeFalse();
    });

    it('Если в сторе поле становится невалидным, то в контроле появляются ошибки', () => {
        fixture.componentInstance.formControl$.next(
            setErrors(fixture.componentInstance.formControl$.value, {
                equalTo: {actual: 5, comparand: 4},
            }),
        );

        fixture.detectChanges();

        expect(inputComponent.control!.errors).toEqual({
            equalTo: {actual: 5, comparand: 4},
        });
    });

    it('Если в сторе дизейблится поле, то контрол дизейблится', () => {
        fixture.componentInstance.formControl$.next(
            disable(fixture.componentInstance.formControl$.value),
        );

        fixture.detectChanges();

        expect(inputComponent.control!.disabled).toBeTrue();
    });

    it('Если в сторе энейблится поле, то контрол энейблится', () => {
        fixture.componentInstance.formControl$.next(
            disable(fixture.componentInstance.formControl$.value),
        );

        fixture.detectChanges();

        fixture.componentInstance.formControl$.next(
            enable(fixture.componentInstance.formControl$.value),
        );

        fixture.detectChanges();

        expect(inputComponent.control!.disabled).toBeFalse();
    });
});
