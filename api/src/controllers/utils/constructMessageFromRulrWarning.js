import XTypeWarning from '@learninglocker/xapi-validation/dist/warnings/TypeWarning';
import { Warning, TypeWarning, RequiredWarning, RestrictedKeysWarning } from 'rulr';

export function constructMessageFromRulrWarning(warning) {
  if (warning instanceof Warning) {
    const path = warning.path.join('.');
    if (warning instanceof XTypeWarning) {
      return `Invalid ${warning.typeName} in ${path}`;
    }
    if (warning instanceof TypeWarning) {
      return `Invalid ${warning.type.name} in ${path}`;
    }
    if (warning instanceof RequiredWarning) {
      return `Missing required data in ${path}`;
    }
    if (warning instanceof RestrictedKeysWarning) {
      return `Invalid keys (${warning.keys.join(', ')}) in ${path}`;
    }
    return `${warning.message} in ${path}`;
  }
  return warning;
}
