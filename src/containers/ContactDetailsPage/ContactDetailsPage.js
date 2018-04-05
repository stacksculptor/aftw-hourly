import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import { fetchCurrentUser, sendVerificationEmail } from '../../ducks/user.duck';
import {
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  Page,
  UserNav,
} from '../../components';
import { ContactDetailsForm, TopbarContainer } from '../../containers';

import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  saveContactDetails,
  saveContactDetailsClear,
  saveEmail,
  savePhoneNumber,
} from './ContactDetailsPage.duck';
import css from './ContactDetailsPage.css';

export const ContactDetailsPageComponent = props => {
  const {
    saveContactDetailsError,
    saveContactDetailsInProgress,
    currentUser,
    contactDetailsChanged,
    onChange,
    scrollingDisabled,
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
    onResendVerificationEmail,
    onSubmitContactDetails,
    onSubmitEmail,
    onSubmitPhoneNumber,
    intl,
  } = props;

  const handleSubmit = (values, currentEmail, currentPhoneNumber) => {
    const { email, currentPassword, phoneNumber } = values;
    const emailChanged = email !== currentEmail;
    const phoneNumberChanged = phoneNumber !== currentPhoneNumber;

    if (emailChanged && phoneNumberChanged) {
      onSubmitContactDetails({ email, currentPassword, phoneNumber });
    } else if (emailChanged) {
      onSubmitEmail({ email, currentPassword });
    } else if (phoneNumberChanged) {
      onSubmitPhoneNumber({ phoneNumber });
    }
  };

  const tabs = [
    {
      text: <FormattedMessage id="ContactDetailsPage.contactDetailsTabTitle" />,
      selected: true,
      linkProps: {
        name: 'ContactDetailsPage',
      },
    },
    {
      text: <FormattedMessage id="ContactDetailsPage.passwordTabTitle" />,
      selected: false,
      linkProps: {
        name: 'PasswordChangePage',
      },
    },
    {
      text: <FormattedMessage id="ContactDetailsPage.paymentsTabTitle" />,
      selected: false,
      linkProps: {
        name: 'PayoutPreferencesPage',
      },
    },
  ];

  const user = ensureCurrentUser(currentUser);
  const email = user.attributes.email || '';
  const protectedData = user.attributes.profile.protectedData || {};
  const phoneNumber = protectedData.phoneNumber || '';
  const contactInfoForm = user.id ? (
    <ContactDetailsForm
      className={css.form}
      initialValues={{ email, phoneNumber }}
      saveContactDetailsError={saveContactDetailsError}
      currentUser={currentUser}
      onResendVerificationEmail={onResendVerificationEmail}
      onSubmit={values => handleSubmit(values, email, phoneNumber)}
      onChange={onChange}
      inProgress={saveContactDetailsInProgress}
      ready={contactDetailsChanged}
      sendVerificationEmailInProgress={sendVerificationEmailInProgress}
      sendVerificationEmailError={sendVerificationEmailError}
    />
  ) : null;

  const title = intl.formatMessage({ id: 'ContactDetailsPage.title' });

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation>
        <LayoutWrapperTopbar>
          <TopbarContainer
            currentPage="ContactDetailsPage"
            desktopClassName={css.desktopTopbar}
            mobileClassName={css.mobileTopbar}
          />
          <UserNav selectedPageName="ContactDetailsPage" />
        </LayoutWrapperTopbar>
        <LayoutWrapperSideNav tabs={tabs} />
        <LayoutWrapperMain>
          <div className={css.content}>
            <h1 className={css.title}>
              <FormattedMessage id="ContactDetailsPage.heading" />
            </h1>
            {contactInfoForm}
          </div>
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSideNavigation>
    </Page>
  );
};

ContactDetailsPageComponent.defaultProps = {
  saveContactDetailsError: null,
  currentUser: null,
  sendVerificationEmailError: null,
};

const { bool, func } = PropTypes;

ContactDetailsPageComponent.propTypes = {
  saveContactDetailsError: propTypes.error,
  saveContactDetailsInProgress: bool.isRequired,
  currentUser: propTypes.currentUser,
  contactDetailsChanged: bool.isRequired,
  onChange: func.isRequired,
  onSubmitContactDetails: func.isRequired,
  onSubmitEmail: func.isRequired,
  onSubmitPhoneNumber: func.isRequired,
  scrollingDisabled: bool.isRequired,
  sendVerificationEmailInProgress: bool.isRequired,
  sendVerificationEmailError: propTypes.error,
  onResendVerificationEmail: func.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  // Topbar needs user info.
  const { currentUser, sendVerificationEmailInProgress, sendVerificationEmailError } = state.user;
  const {
    saveContactDetailsError,
    saveContactDetailsInProgress,
    contactDetailsChanged,
  } = state.ContactDetailsPage;
  return {
    saveContactDetailsError,
    saveContactDetailsInProgress,
    currentUser,
    contactDetailsChanged,
    scrollingDisabled: isScrollingDisabled(state),
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
  };
};

const mapDispatchToProps = dispatch => ({
  onChange: () => dispatch(saveContactDetailsClear()),
  onResendVerificationEmail: () => dispatch(sendVerificationEmail()),
  onSubmitContactDetails: values => dispatch(saveContactDetails(values)),
  onSubmitEmail: values => dispatch(saveEmail(values)),
  onSubmitPhoneNumber: values => dispatch(savePhoneNumber(values)),
});

const ContactDetailsPage = compose(connect(mapStateToProps, mapDispatchToProps), injectIntl)(
  ContactDetailsPageComponent
);

ContactDetailsPage.loadData = () => {
  // Since verify email happens in separate tab, current user's data might be updated
  return fetchCurrentUser();
};

export default ContactDetailsPage;
