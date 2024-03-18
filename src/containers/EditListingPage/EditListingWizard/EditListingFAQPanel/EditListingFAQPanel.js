import React, { useState } from 'react';
import PropTypes, { arrayOf, number, oneOf, shape } from 'prop-types';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT, STOCK_INFINITE_ITEMS, STOCK_TYPES } from '../../../../util/types';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import css from './EditListingFAQPanel.module.css';
import EditListingFAQForm from './EditListingFAQForm';

const { Money } = sdkTypes;

const getListingTypeConfig = (publicData, listingTypes) => {
  const selectedListingType = publicData.listingType;
  return listingTypes.find(conf => conf.listingType === selectedListingType);
};

const getInitialValues = props => {
  const { listing, listingTypes } = props;
  const isPublished = listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;
  const price = listing?.attributes?.price;
  const publicData = listing?.attributes?.publicData;
  const { FAQs } = publicData || {};

  return { FAQs: FAQs && FAQs.length > 0 ? FAQs : [{}]};
};

const EditListingFAQPanel = props => {
  // State is needed since re-rendering would overwrite the values during XHR call.
  const [state, setState] = useState({ initialValues: getInitialValues(props) });
  const {
    className,
    rootClassName,
    listing,
    marketplaceCurrency,
    listingMinimumPriceSubUnits,
    listingTypes,
    disabled,
    ready,
    onSubmit,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const initialValues = state.initialValues;

  // Form needs to know data from listingType
  const publicData = listing?.attributes?.publicData;
  const unitType = publicData.unitType;
  const listingTypeConfig = getListingTypeConfig(publicData, listingTypes);


  const isPublished = listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;
 

  return (
    <div className={classes}>
      <H3 as="h1">
        {isPublished ? (
          <FormattedMessage
            id="EditListingFAQPanel.title"
            values={{ listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> }}
          />
        ) : (
          <FormattedMessage
            id="EditListingFAQPanel.createListingTitle"
            values={{ lineBreak: <br /> }}
          />
        )}
      </H3>
        <EditListingFAQForm
          className={css.form}
          initialValues={initialValues}
          onSubmit={values => {
            const { FAQs } = values;

            const updateValues = {
              publicData:{
                FAQs
              },
            };
          
            onSubmit(updateValues);
          }}
          listingMinimumPriceSubUnits={listingMinimumPriceSubUnits}
          marketplaceCurrency={marketplaceCurrency}
          listingType={listingTypeConfig}
          unitType={unitType}
          saveActionMsg={submitButtonText}
          disabled={disabled}
          ready={ready}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
          fetchErrors={errors}
        />
     
    </div>
  );
};

const { func, object, string, bool } = PropTypes;

EditListingFAQPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
};

EditListingFAQPanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,
  marketplaceCurrency: string.isRequired,
  listingMinimumPriceSubUnits: number.isRequired,
  listingTypes: arrayOf(
    shape({
      stockType: oneOf(STOCK_TYPES),
    })
  ).isRequired,

  disabled: bool.isRequired,
  ready: bool.isRequired,
  onSubmit: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingFAQPanel;
