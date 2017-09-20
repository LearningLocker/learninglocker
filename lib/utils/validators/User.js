import validator from 'validator';

/**
 * Takes in a password to validate against defined settings
 * @param  {String}   value    The password to validate
 * @param  {Object}   settings An object con
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
const validatePasswordUtil = (value, settings) => {
  let success = true;
  const messages = [];

  // Blank passwords never update the document (see preSave), so only validate if more than 0 chars
  if (value.length > 0) {
    // Check for length requirements
    if (!validator.isLength(value, { min: settings.PASSWORD_MIN_LENGTH })) {
      success = false;
      messages.push(`The password must be at least ${settings.PASSWORD_MIN_LENGTH} characters long`);
    }

    let hasValidCustomPattern = false;
    let customPattern;

    // Check for use of custom regex which will override use of other password requirements
    // (other than length)
    if (settings.PASSWORD_USE_CUSTOM_REGEX && settings.PASSWORD_CUSTOM_REGEX.length > 0) {
      try {
        customPattern = new RegExp(settings.PASSWORD_CUSTOM_REGEX);
        hasValidCustomPattern = true;
      } catch (e) {
        // Regex must be invalid, so lets not use it eh?
        hasValidCustomPattern = false;
      }
    }

    if (hasValidCustomPattern && customPattern) {
      // Test the password against the valid pattern
      if (!customPattern.test(value)) {
        const settingsMessage = settings.PASSWORD_CUSTOM_MESSAGE;
        let hasMessage = false;
        if (settingsMessage) {
          hasMessage = settingsMessage.length > 0;
        }
        const customMessage = hasMessage ? settings.PASSWORD_CUSTOM_MESSAGE : 'The password does not meet this organisations minimum requirements';
        success = false;
        messages.push(customMessage);
      }
    } else {
      // Check for alpha inclusion requirements
      if (settings.PASSWORD_REQUIRE_ALPHA) {
        if (!/[a-zA-Z]/.test(value)) {
          success = false;
          messages.push('The password must include at least one letter');
        }
      }

      // Check for numeric inclusion requirements
      if (settings.PASSWORD_REQUIRE_NUMBER) {
        if (!/[0-9]/.test(value)) {
          success = false;
          messages.push('The password must include at least one number');
        }
      }
    }
  }

  // If everything is cushty...
  return {
    success,
    messages
  };
};

export {
  validatePasswordUtil //eslint-disable-line
};
