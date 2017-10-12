import React, { PropTypes } from 'react'; // eslint-disable-line react/no-deprecated
import { compose } from 'redux';
import { connect } from 'react-redux';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import { Page } from '../../components';
import { TopbarContainer } from '../../containers';

export const ProfilePageComponent = props => {
  const {
    authInfoError,
    logoutError,
    params,
    scrollingDisabled,
  } = props;

  return (
    <Page
      authInfoError={authInfoError}
      logoutError={logoutError}
      title={`Profile page with display name: ${params.displayName}`}
      scrollingDisabled={scrollingDisabled}
    >
      <TopbarContainer />
    </Page>
  );
};

ProfilePageComponent.defaultProps = {
  authInfoError: null,
  logoutError: null,
};

const { bool, instanceOf, shape, string } = PropTypes;

ProfilePageComponent.propTypes = {
  authInfoError: instanceOf(Error),
  logoutError: instanceOf(Error),
  params: shape({ displayName: string.isRequired }).isRequired,
  scrollingDisabled: bool.isRequired,
};

const mapStateToProps = state => {
  // Page needs authInfoError and logoutError
  const { authInfoError, logoutError } = state.Auth;
  return {
    authInfoError,
    logoutError,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const ProfilePage = compose(connect(mapStateToProps))(ProfilePageComponent);

export default ProfilePage;
