import React from 'react';
import { bool, object, string } from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';
import config from '../../config';
import {
  Button,
  ExternalLink,
  StripeBankAccountTokenInputField,
  FieldSelect,
  FieldBirthdayInput,
  FieldTextInput,
  Form,
} from '../../components';
import * as validators from '../../util/validators';
import { isStripeInvalidPostalCode } from '../../util/errors';

import css from './PayoutDetailsForm.css';

const MIN_STRIPE_ACCOUNT_AGE = 18;

const supportedCountries = config.stripe.supportedCountries.map(c => c.code);

export const stripeCountryConfigs = countryCode => {
  const country = config.stripe.supportedCountries.find(c => c.code === countryCode);

  if (!country) {
    throw new Error(`Country code not found in Stripe config ${countryCode}`);
  }
  return country;
};

const requiresAddress = countryCode => {
  const country = stripeCountryConfigs(countryCode);
  return country.payoutAddressRequired;
};

const countryCurrency = countryCode => {
  const country = stripeCountryConfigs(countryCode);
  return country.currency;
};

const PayoutDetailsFormComponent = props => (
  <FinalForm
    {...props}
    render={fieldRenderProps => {
      const {
        className,
        createStripeAccountError,
        disabled,
        form,
        handleSubmit,
        inProgress,
        intl,
        invalid,
        pristine,
        ready,
        submitButtonText,
        values,
      } = fieldRenderProps;
      const { country } = values;

      const firstNameLabel = intl.formatMessage({ id: 'PayoutDetailsForm.firstNameLabel' });
      const firstNamePlaceholder = intl.formatMessage({
        id: 'PayoutDetailsForm.firstNamePlaceholder',
      });
      const firstNameRequired = validators.required(
        intl.formatMessage({
          id: 'PayoutDetailsForm.firstNameRequired',
        })
      );

      const lastNameLabel = intl.formatMessage({ id: 'PayoutDetailsForm.lastNameLabel' });
      const lastNamePlaceholder = intl.formatMessage({
        id: 'PayoutDetailsForm.lastNamePlaceholder',
      });
      const lastNameRequired = validators.required(
        intl.formatMessage({
          id: 'PayoutDetailsForm.lastNameRequired',
        })
      );

      const birthdayLabel = intl.formatMessage({ id: 'PayoutDetailsForm.birthdayLabel' });
      const birthdayLabelMonth = intl.formatMessage({
        id: 'PayoutDetailsForm.birthdayLabelMonth',
      });
      const birthdayLabelYear = intl.formatMessage({ id: 'PayoutDetailsForm.birthdayLabelYear' });
      const birthdayRequired = validators.required(
        intl.formatMessage({
          id: 'PayoutDetailsForm.birthdayRequired',
        })
      );
      const birthdayMinAge = validators.ageAtLeast(
        intl.formatMessage(
          {
            id: 'PayoutDetailsForm.birthdayMinAge',
          },
          {
            minAge: MIN_STRIPE_ACCOUNT_AGE,
          }
        ),
        MIN_STRIPE_ACCOUNT_AGE
      );

      const countryLabel = intl.formatMessage({ id: 'PayoutDetailsForm.countryLabel' });
      const countryPlaceholder = intl.formatMessage({
        id: 'PayoutDetailsForm.countryPlaceholder',
      });
      const countryRequired = validators.required(
        intl.formatMessage({
          id: 'PayoutDetailsForm.countryRequired',
        })
      );

      const streetAddressLabel = intl.formatMessage({
        id: 'PayoutDetailsForm.streetAddressLabel',
      });
      const streetAddressPlaceholder = intl.formatMessage({
        id: 'PayoutDetailsForm.streetAddressPlaceholder',
      });
      const streetAddressRequired = validators.required(
        intl.formatMessage({
          id: 'PayoutDetailsForm.streetAddressRequired',
        })
      );

      const postalCodeLabel = intl.formatMessage({ id: 'PayoutDetailsForm.postalCodeLabel' });
      const postalCodePlaceholder = intl.formatMessage({
        id: 'PayoutDetailsForm.postalCodePlaceholder',
      });
      const postalCodeRequired = validators.required(
        intl.formatMessage({
          id: 'PayoutDetailsForm.postalCodeRequired',
        })
      );

      const cityLabel = intl.formatMessage({ id: 'PayoutDetailsForm.cityLabel' });
      const cityPlaceholder = intl.formatMessage({ id: 'PayoutDetailsForm.cityPlaceholder' });
      const cityRequired = validators.required(
        intl.formatMessage({
          id: 'PayoutDetailsForm.cityRequired',
        })
      );

      const showAddressFields = country && requiresAddress(country);

      // StripeBankAccountTokenInputField handles the error messages
      // internally, we just have to make sure we require a valid token
      // out of the field. Therefore the empty validation message.
      const bankAccountRequired = validators.required(' ');

      const classes = classNames(css.root, className, {
        [css.disabled]: disabled,
      });
      const submitInProgress = inProgress;
      const submitDisabled = pristine || invalid || disabled || submitInProgress;

      let error = null;

      if (isStripeInvalidPostalCode(createStripeAccountError)) {
        error = (
          <div className={css.error}>
            <FormattedMessage id="PayoutDetailsForm.createStripeAccountFailedInvalidPostalCode" />
          </div>
        );
      } else if (createStripeAccountError) {
        error = (
          <div className={css.error}>
            <FormattedMessage id="PayoutDetailsForm.createStripeAccountFailed" />
          </div>
        );
      }

      const stripeConnectedAccountTermsLink = (
        <ExternalLink href="https://stripe.com/connect-account/legal" className={css.termsLink}>
          <FormattedMessage id="PayoutDetailsForm.stripeConnectedAccountTermsLink" />
        </ExternalLink>
      );

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <div className={css.sectionContainer}>
            <h3 className={css.subTitle}>
              <FormattedMessage id="PayoutDetailsForm.personalDetailsTitle" />
            </h3>
            <div className={css.formRow}>
              <FieldTextInput
                id="fname"
                name="fname"
                disabled={disabled}
                className={css.firstName}
                type="text"
                autoComplete="given-name"
                label={firstNameLabel}
                placeholder={firstNamePlaceholder}
                validate={firstNameRequired}
              />
              <FieldTextInput
                id="lname"
                name="lname"
                disabled={disabled}
                className={css.lastName}
                type="text"
                autoComplete="family-name"
                label={lastNameLabel}
                placeholder={lastNamePlaceholder}
                validate={lastNameRequired}
              />
            </div>
            <FieldBirthdayInput
              id="birthDate"
              name="birthDate"
              disabled={disabled}
              className={css.field}
              label={birthdayLabel}
              labelForMonth={birthdayLabelMonth}
              labelForYear={birthdayLabelYear}
              format={null}
              valueFromForm={values.birthDate}
              validate={validators.composeValidators(birthdayRequired, birthdayMinAge)}
            />
          </div>

          <div className={css.sectionContainer}>
            <h3 className={css.subTitle}>
              <FormattedMessage id="PayoutDetailsForm.addressTitle" />
            </h3>
            <FieldSelect
              id="country"
              name="country"
              disabled={disabled}
              className={css.selectCountry}
              autoComplete="country"
              label={countryLabel}
              validate={countryRequired}
            >
              <option value="">{countryPlaceholder}</option>
              {supportedCountries.map(c => (
                <option key={c} value={c}>
                  {intl.formatMessage({ id: `PayoutDetailsForm.countryNames.${c}` })}
                </option>
              ))}
            </FieldSelect>
            {showAddressFields ? (
              <div>
                <FieldTextInput
                  id="streetAddress"
                  name="streetAddress"
                  disabled={disabled}
                  className={css.field}
                  type="text"
                  autoComplete="street-address"
                  label={streetAddressLabel}
                  placeholder={streetAddressPlaceholder}
                  validate={streetAddressRequired}
                  onUnmount={() => form.change('streetAddress', undefined)}
                />
                <div className={css.formRow}>
                  <FieldTextInput
                    id="postalCode"
                    name="postalCode"
                    disabled={disabled}
                    className={css.postalCode}
                    type="text"
                    autoComplete="postal-code"
                    label={postalCodeLabel}
                    placeholder={postalCodePlaceholder}
                    validate={postalCodeRequired}
                    onUnmount={() => form.change('postalCode', undefined)}
                  />
                  <FieldTextInput
                    id="city"
                    name="city"
                    disabled={disabled}
                    className={css.city}
                    type="text"
                    autoComplete="address-level2"
                    label={cityLabel}
                    placeholder={cityPlaceholder}
                    validate={cityRequired}
                    onUnmount={() => form.change('city', undefined)}
                  />
                </div>
              </div>
            ) : null}
          </div>
          {country ? (
            <div className={css.sectionContainer}>
              <h3 className={css.subTitle}>
                <FormattedMessage id="PayoutDetailsForm.bankDetails" />
              </h3>
              <StripeBankAccountTokenInputField
                disabled={disabled}
                name="bankAccountToken"
                formName="PayoutDetailsForm"
                country={country}
                currency={countryCurrency(country)}
                validate={bankAccountRequired}
              />
            </div>
          ) : null}
          {error}
          <p className={css.termsText}>
            <FormattedMessage
              id="PayoutDetailsForm.stripeToSText"
              values={{ stripeConnectedAccountTermsLink }}
            />
          </p>
          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={ready}
          >
            {submitButtonText ? (
              submitButtonText
            ) : (
              <FormattedMessage id="PayoutDetailsForm.submitButtonText" />
            )}
          </Button>
        </Form>
      );
    }}
  />
);

PayoutDetailsFormComponent.defaultProps = {
  className: null,
  country: null,
  createStripeAccountError: null,
  disabled: false,
  inProgress: false,
  ready: false,
  submitButtonText: null,
};

PayoutDetailsFormComponent.propTypes = {
  className: string,
  createStripeAccountError: object,
  disabled: bool,
  inProgress: bool,
  ready: bool,
  submitButtonText: string,

  // from injectIntl
  intl: intlShape.isRequired,
};

const PayoutDetailsForm = compose(injectIntl)(PayoutDetailsFormComponent);

export default PayoutDetailsForm;
