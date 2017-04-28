import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { OrderDetailsPanel, PageLayout } from '../../components';
import * as propTypes from '../../util/propTypes';
import { ensureBooking, ensureListing, ensureTransaction, ensureUser } from '../../util/data';
import { getEntities } from '../../ducks/sdk.duck';
import { loadData } from './OrderPage.duck';

import css from './OrderPage.css';

// OrderPage handles data loading
// It show loading data text or OrderDetailsPanel (and later also another panel for messages).
export const OrderPageComponent = props => {
  const { intl, transaction } = props;
  const currentTransaction = ensureTransaction(transaction);
  const currentListing = ensureListing(currentTransaction.listing);
  const title = currentListing.attributes.title;

  const detailsProps = {
    totalPrice: currentTransaction.attributes.total,
    orderState: currentTransaction.attributes.state,
    lastTransitionedAt: currentTransaction.attributes.lastTransitionedAt,
    listing: currentListing,
    booking: ensureBooking(currentTransaction.booking),
    provider: ensureUser(currentTransaction.provider),
  };

  const detailsClassName = classNames(css.tabContent, {
    [css.tabContentVisible]: props.tab === 'details',
  });

  const panel = currentTransaction.id
    ? <OrderDetailsPanel className={detailsClassName} {...detailsProps} />
    : <h1 className={css.title}><FormattedMessage id="OrderPage.loadingData" /></h1>;

  return (
    <PageLayout title={intl.formatMessage({ id: 'OrderPage.title' }, { title })}>
      {panel}
    </PageLayout>
  );
};

OrderPageComponent.defaultProps = { transaction: null };

const { oneOf } = PropTypes;

OrderPageComponent.propTypes = {
  intl: intlShape.isRequired,
  tab: oneOf(['details', 'discussion']).isRequired,
  transaction: propTypes.transaction,
};

const mapStateToProps = state => {
  const transactionRef = state.OrderPage.transactionRef;
  const transactions = getEntities(state.data, transactionRef ? [transactionRef] : []);
  const transaction = transactions.length > 0 ? transactions[0] : null;
  return {
    transaction,
    showOrderError: state.ListingPage.showListingError,
    currentUser: state.user.currentUser,
  };
};

const OrderPage = connect(mapStateToProps)(injectIntl(OrderPageComponent));

OrderPage.loadData = loadData;

export default OrderPage;
