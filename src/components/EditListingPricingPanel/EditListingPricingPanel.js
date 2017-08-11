import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { EditListingPricingForm } from '../../containers';

import css from './EditListingPricingPanel.css';

const EditListingPricingPanel = props => {
  const {
    className,
    rootClassName,
    listing,
    onSubmit,
    onChange,
    submitButtonText,
    panelUpdated,
    errors,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const { attributes: { price } } = listing || { attributes: {} };

  return (
    <div className={classes}>
      <h1 className={css.title}><FormattedMessage id="EditListingPricingPanel.title" /></h1>
      <EditListingPricingForm
        className={css.form}
        initialValues={{ price }}
        onSubmit={onSubmit}
        onChange={onChange}
        saveActionMsg={submitButtonText}
        updated={panelUpdated}
        updateError={errors.updateListingError}
      />
    </div>
  );
};

const { func, object, string, bool } = PropTypes;

EditListingPricingPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
};

EditListingPricingPanel.propTypes = {
  className: string,
  rootClassName: string,
  listing: object, // TODO Should be propTypes.listing after API support is added.
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingPricingPanel;
