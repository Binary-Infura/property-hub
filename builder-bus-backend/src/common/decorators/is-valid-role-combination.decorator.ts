import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UserRole } from '../enums/role.enum';
import { isRoleCombinationValid } from '../utils/role-validator.util';

@ValidatorConstraint({ name: 'isValidRoleCombination', async: false })
export class IsValidRoleCombinationConstraint
  implements ValidatorConstraintInterface {
  validate(roles: any[], args: ValidationArguments) {
    if (!Array.isArray(roles)) return true; // Handled by @IsArray in DTO
    const { valid } = isRoleCombinationValid(roles as UserRole[]);
    return valid;
  }

  defaultMessage(args: ValidationArguments) {
    const roles = args.value as UserRole[];
    const { reason } = isRoleCombinationValid(roles);
    return `Invalid role combination: ${reason}`;
  }
}

export function IsValidRoleCombination(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidRoleCombinationConstraint,
    });
  };
}
