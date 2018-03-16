/**
 * Error logging
 *
 * Can be used to log errors to console or and eternal
 * error logging system, like Sentry for example.
 *
 */

import Raven from 'raven-js';
import config from '../config';
import { responseApiErrorInfo } from './errors';

/**
 * Set up error handling. If a Sentry DSN is
 * provided a Sentry client will be installed.
 */
export const setup = () => {
  if (config.sentryDsn) {
    // Configures the Sentry client. Adds a handler for
    // any uncaught exception.
    Raven.config(config.sentryDsn, { environment: config.env }).install();
  }
};

/**
 * Set user ID for the logger so that it
 * can be attached to Sentry issues.
 *
 * @param {String} userId ID of current user
 */
export const setUserId = userId => {
  if (Raven.isSetup()) {
    Raven.setUserContext({ id: userId });
  }
};

/**
 * Clears the user ID.
 */
export const clearUserId = () => {
  if (Raven.isSetup()) {
    Raven.setUserContext();
  }
};

/**
 * Logs an execption. If Sentry is configured
 * sends the error information there. Otherwise
 * prints the error to the console.
 *
 * @param {Error} e Error that occurred
 * @param {String} code Error code
 * @param {Object} data Additional data to be sent to Sentry
 */
export const error = (e, code, data) => {
  if (Raven.isSetup()) {
    const extra = { ...data, apiErrorData: responseApiErrorInfo(e) };
    Raven.captureException(e, { tags: { code }, extra });
  } else {
    console.error(e); // eslint-disable-line
    console.error('Error code:', code, 'data:', data);
  }
};
