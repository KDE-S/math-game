import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class CheckEqualityValidator {
  static checkEquality(firstField: string, secondField: string, answerField: string): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const first = form.value[firstField];
      const second = form.value[secondField];
      const answer = form.value[answerField];
      return first + second == answer ? null : { answerNotCorrect: true }
    }
  }
}