import React, { Component, PropTypes } from 'react';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import config from '../../config';
import * as propTypes from '../../util/propTypes';
import { types } from '../../util/sdkLoader';
import { createSlug } from '../../util/urlHelpers';
import { convertMoneyToNumber } from '../../util/currency';
import { createResourceLocatorString, findRouteByRouteName } from '../../util/routes';
import { ensureListing, ensureUser } from '../../util/data';
import {
  Avatar,
  Button,
  Map,
  ModalInMobile,
  PageLayout,
  ResponsiveImage,
  Topbar,
  NamedLink,
} from '../../components';
import { BookingDatesForm } from '../../containers';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import { logout, authenticationInProgress } from '../../ducks/Auth.duck';
import { manageDisableScrolling, isScrollingDisabled } from '../../ducks/UI.duck';
import { showListing } from './ListingPage.duck';

import css from './ListingPage.css';

const EditIcon = props => {
  const { className } = props;
  return (
    <svg
      className={className}
      width="16px"
      height="16px"
      viewBox="0 0 16 16"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="translate(-255.000000, -76.000000)" stroke="#FFFFFF">
          <g transform="translate(0.000000, 60.000000)">
            <g transform="translate(256.000000, 16.000000)">
              <polygon
                points="5.1611 12.8804 0.2121 15.0004 2.3331 10.0504 11.1721 1.2124 14.0001 4.0404"
              />
              <path d="M12.1641,5.876 L9.3361,3.048" />
              <path d="M5.1611,12.8804 L2.3331,10.0504" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

EditIcon.defaultProps = { className: null };

const { arrayOf, bool, func, instanceOf, number, object, oneOf, shape, string } = PropTypes;

EditIcon.propTypes = { className: string };

// This defines when ModalInMobile shows content as Modal
const MODAL_BREAKPOINT = 1023;

const { UUID } = types;

const priceData = (price, currencyConfig, intl) => {
  if (price && price.currency === currencyConfig.currency) {
    const priceAsNumber = convertMoneyToNumber(price, currencyConfig.subUnitDivisor);
    const formattedPrice = intl.formatNumber(priceAsNumber, currencyConfig);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: `(${price.currency})`,
      priceTitle: `Unsupported currency (${price.currency})`,
    };
  }
  return {};
};

// TODO: price unit (per x), custom fields, contact, reviews
// N.B. All the presentational content needs to be extracted to their own components
export class ListingPageComponent extends Component {
  constructor(props) {
    super(props);
    const tab = props.tab;
    this.state = {
      isBookingModalOpenOnMobile: tab && tab === 'book',
      pageClassNames: [],
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(values) {
    const { flattenedRoutes, history, getListing, params, useInitialValues } = this.props;
    const listing = getListing(new UUID(params.id));

    this.setState({ isBookingModalOpenOnMobile: false });

    // Customize checkout page state with current listing and selected bookingDates
    const { setInitialValues } = findRouteByRouteName('CheckoutPage', flattenedRoutes);
    const { startDate: bookingStart, endDate: bookingEnd } = values.bookingDates;
    const bookingDates = { bookingStart, bookingEnd };
    useInitialValues(setInitialValues, { listing, bookingDates, initiateOrderError: null });

    // Redirect to CheckoutPage
    history.push(
      createResourceLocatorString(
        'CheckoutPage',
        flattenedRoutes,
        { id: listing.id.uuid, slug: createSlug(listing.attributes.title) },
        {}
      )
    );
  }

  render() {
    const {
      authInfoError,
      authInProgress,
      currentUser,
      currentUserHasListings,
      getListing,
      history,
      intl,
      isAuthenticated,
      location,
      logoutError,
      notificationCount,
      onLogout,
      onManageDisableScrolling,
      params,
      scrollingDisabled,
      showListingError,
    } = this.props;
    const currencyConfig = config.currencyConfig;
    const currentListing = ensureListing(getListing(new UUID(params.id)));
    const {
      address = '',
      description = '',
      geolocation = null,
      price = null,
      title = '',
    } = currentListing.attributes;

    if (!currentListing.id && showListingError) {
      const noDataMsg = { id: 'ListingPage.noListingData' };
      return <PageLayout title={intl.formatMessage(noDataMsg)} />;
    } else if (!currentListing.id) {
      const loadingPageMsg = { id: 'ListingPage.loadingListingData' };
      return <PageLayout title={intl.formatMessage(loadingPageMsg)} />;
    }

    const firstImage = currentListing.images && currentListing.images.length > 0
      ? currentListing.images[0]
      : null;

    const authorAvailable = currentListing && currentListing.author;
    const userAndListingAuthorAvailable = currentUser && authorAvailable;
    const isOwnListing = userAndListingAuthorAvailable &&
      currentListing.author.id.uuid === currentUser.id.uuid;

    const currentAuthor = ensureUser(authorAvailable ? currentListing.author : {});
    const currentAuthorDisplayName = currentAuthor.attributes.profile.displayName;

    // TODO location address is currently serialized inside address field (API will change later)
    // Content is something like { locationAddress: 'Street, Province, Country', building: 'A 42' };
    let locationAddress = '';
    try {
      const deserializedAddress = JSON.parse(address || '{}');
      locationAddress = deserializedAddress.locationAddress;
    } catch (e) {
      locationAddress = address;
    }

    const bookBtnMessage = intl.formatMessage({ id: 'ListingPage.ctaButtonMessage' });
    const { formattedPrice, priceTitle } = priceData(price, currencyConfig, intl);
    const map = geolocation
      ? <div className={css.locationContainer}>
          <h3 className={css.locationTitle}>
            <FormattedMessage id="ListingPage.locationTitle" />
          </h3>
          <div className={css.map}><Map center={geolocation} address={locationAddress} /></div>
        </div>
      : null;

    const bookingHeading = (
      <div className={css.bookingHeading}>
        <h2 className={css.bookingTitle}>
          <FormattedMessage id="ListingPage.bookingTitle" values={{ title }} />
        </h2>
        <div className={css.bookingHelp}>
          <FormattedMessage id="ListingPage.bookingHelp" />
        </div>
      </div>
    );

    const handleBookingSubmit = values => {
      if (!isOwnListing) {
        this.onSubmit(values);
      } else {
        window.scrollTo(0, 0);
      }
    };

    const bookingDatesForm = (
      <BookingDatesForm className={css.bookingForm} onSubmit={handleBookingSubmit} price={price} />
    );

    const editParams = { ...params, type: 'edit', tab: 'description' };
    const ownListingActionBar = isOwnListing
      ? <div className={css.ownListingActionBar}>
          <p className={css.ownListingText}>
            <FormattedMessage id="ListingPage.ownListing" />
          </p>
          <NamedLink className={css.editListingLink} name="EditListingPage" params={editParams}>
            <EditIcon className={css.editIcon} />
            <FormattedMessage id="ListingPage.editListing" />
          </NamedLink>
        </div>
      : null;

    const listingClasses = classNames(css.pageRoot);

    const handleBookButtonClick = () => {
      if (!isOwnListing) {
        this.setState({ isBookingModalOpenOnMobile: true });
      } else {
        window.scrollTo(0, 0);
      }
    };

    return (
      <PageLayout
        authInfoError={authInfoError}
        logoutError={logoutError}
        title={`${title} ${formattedPrice}`}
        scrollingDisabled={scrollingDisabled}
      >
        <Topbar
          isAuthenticated={isAuthenticated}
          authInProgress={authInProgress}
          currentUser={currentUser}
          currentUserHasListings={currentUserHasListings}
          notificationCount={notificationCount}
          history={history}
          location={location}
          onLogout={onLogout}
          onManageDisableScrolling={onManageDisableScrolling}
        />
        <div className={listingClasses}>
          <div className={css.threeToTwoWrapper}>
            <div className={css.aspectWrapper}>
              {ownListingActionBar}
              <ResponsiveImage
                rootClassName={css.rootForImage}
                alt={title}
                image={firstImage}
                nameSet={[
                  { name: 'landscape-crop', size: '400w' },
                  { name: 'landscape-crop2x', size: '800w' },
                ]}
                sizes="100vw"
              />
            </div>
          </div>

          <div className={css.contentContainer}>
            <div className={css.avatarWrapper}>
              <Avatar rootClassName={css.avatar} user={currentAuthor} />
            </div>

            <div className={css.mainContent}>
              <div className={css.headingContainer}>
                <div className={css.desktopPriceContainer}>
                  <div className={css.desktopPriceValue} title={priceTitle}>
                    {formattedPrice}
                  </div>
                  <div className={css.desktopPerNight}>
                    <FormattedMessage id="ListingPage.perNight" />
                  </div>
                </div>
                <div className={css.heading}>
                  <h1 className={css.title}>{title}</h1>
                  <div className={css.author}>
                    <span className={css.authorName}>
                      <FormattedMessage
                        id="ListingPage.hostedBy"
                        values={{ name: currentAuthorDisplayName }}
                      />
                    </span>
                  </div>
                </div>
              </div>

              <div className={css.descriptionContainer}>
                <h3 className={css.descriptionTitle}>
                  <FormattedMessage id="ListingPage.descriptionTitle" />
                </h3>
                <p className={css.description}>{description}</p>
              </div>

              {map}
            </div>

            <ModalInMobile
              className={css.modalInMobile}
              id="BookingDatesFormInModal"
              isModalOpenOnMobile={this.state.isBookingModalOpenOnMobile}
              onClose={() => this.setState({ isBookingModalOpenOnMobile: false })}
              showAsModalMaxWidth={MODAL_BREAKPOINT}
              onManageDisableScrolling={onManageDisableScrolling}
            >
              <div className={css.modalHeading}>
                <h1 className={css.title}>{title}</h1>
                <div className={css.author}>
                  <span className={css.authorName}>
                    <FormattedMessage
                      id="ListingPage.hostedBy"
                      values={{ name: currentAuthorDisplayName }}
                    />
                  </span>
                </div>
              </div>

              {bookingHeading}
              {bookingDatesForm}
            </ModalInMobile>
            <div className={css.openBookingForm}>
              <div className={css.priceContainer}>
                <div className={css.priceValue} title={priceTitle}>
                  {formattedPrice}
                </div>
                <div className={css.perNight}>
                  <FormattedMessage id="ListingPage.perNight" />
                </div>
              </div>

              <Button rootClassName={css.bookButton} onClick={handleBookButtonClick}>
                {bookBtnMessage}
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }
}

ListingPageComponent.defaultProps = {
  authInfoError: null,
  currentUser: null,
  logoutError: null,
  notificationCount: 0,
  showListingError: null,
  tab: 'listing',
};

ListingPageComponent.propTypes = {
  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: object.isRequired,
  flattenedRoutes: arrayOf(propTypes.route).isRequired,
  // from injectIntl
  intl: intlShape.isRequired,
  params: shape({
    id: string.isRequired,
    slug: string.isRequired,
  }).isRequired,
  authInfoError: instanceOf(Error),
  authInProgress: bool.isRequired,
  currentUser: propTypes.currentUser,
  currentUserHasListings: bool.isRequired,
  getListing: func.isRequired,
  isAuthenticated: bool.isRequired,
  logoutError: instanceOf(Error),
  notificationCount: number,
  onLogout: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  scrollingDisabled: bool.isRequired,
  showListingError: instanceOf(Error),
  tab: oneOf(['book', 'listing']),
  useInitialValues: func.isRequired,
};

const mapStateToProps = state => {
  const { showListingError } = state.ListingPage;
  const { authInfoError, isAuthenticated, logoutError } = state.Auth;
  const {
    currentUser,
    currentUserHasListings,
    currentUserNotificationCount: notificationCount,
  } = state.user;

  const getListing = id => {
    const listings = getListingsById(state, [id]);
    return listings.length === 1 ? listings[0] : null;
  };

  return {
    authInfoError,
    authInProgress: authenticationInProgress(state),
    currentUser,
    currentUserHasListings,
    getListing,
    isAuthenticated,
    logoutError,
    notificationCount,
    scrollingDisabled: isScrollingDisabled(state),
    showListingError,
  };
};

const mapDispatchToProps = dispatch => ({
  onLogout: historyPush => dispatch(logout(historyPush)),
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  useInitialValues: (setInitialValues, { listing, bookingDates, initiateOrderError }) =>
    dispatch(setInitialValues({ listing, bookingDates, initiateOrderError })),
});

const ListingPage = compose(connect(mapStateToProps, mapDispatchToProps), withRouter, injectIntl)(
  ListingPageComponent
);

ListingPage.loadData = params => {
  const id = new UUID(params.id);
  return showListing(id);
};

export default ListingPage;
