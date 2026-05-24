import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {

  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      try {
        const url = new URL(control.value);
        return url.protocol === 'http:' || url.protocol === 'https:' 
          ? null 
          : { invalidUrl: true };
      } catch {
        return { invalidUrl: true };
      }
    };
  }


  static backHalf(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const pattern = /^[a-zA-Z0-9_-]+$/;
      return pattern.test(control.value) ? null : { invalidBackHalf: true };
    };
  }

  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value;
      const errors: ValidationErrors = {};

      if (password.length < 8) {
        errors['minLength'] = true;
      }

      if (!/[A-Z]/.test(password)) {
        errors['requiresUppercase'] = true;
      }

      if (!/[a-z]/.test(password)) {
        errors['requiresLowercase'] = true;
      }

      if (!/[0-9]/.test(password)) {
        errors['requiresNumber'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  static matchFields(fieldName: string, matchFieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const field = control.get(fieldName);
      const matchField = control.get(matchFieldName);

      if (!field || !matchField) {
        return null;
      }

      if (matchField.errors && !matchField.errors['fieldsMismatch']) {
        return null;
      }

      if (field.value !== matchField.value) {
        matchField.setErrors({ fieldsMismatch: true });
        return { fieldsMismatch: true };
      } else {
        matchField.setErrors(null);
        return null;
      }
    };
  }
}