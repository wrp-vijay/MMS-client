import { AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

export function atLeastOneItemValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control instanceof FormArray) {
      return control.length > 0 ? null : { 'atLeastOneItem': true };
    }
    return null;
  };
} 
