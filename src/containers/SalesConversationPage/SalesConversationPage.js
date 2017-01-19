/* eslint-disable react/no-unescaped-entities */
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Page } from '../../components';

const SalesConversationPage = props => {
  const { params } = props;
  return (
    <Page title="Sales conversation page">
      <p>Sale id: {params.id}</p>
      <Link to={`/sale/${params.id}/discussion`}>Discussion tab</Link>
      <br />
      <Link to={`/sale/${params.id}/details`}>Details tab</Link>
      <p>Mobile layout needs different views for discussion and details.</p>
      <p>
         Discussion view is the default if route doesn't specify mobile tab (e.g. <i>
          /order/1234
        </i>)
      </p>
    </Page>
  );
};

const { shape, number } = PropTypes;

SalesConversationPage.propTypes = { params: shape({ id: number.isRequired }).isRequired };

export default SalesConversationPage;
