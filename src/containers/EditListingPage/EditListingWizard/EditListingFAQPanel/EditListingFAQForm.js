import React, { useState } from 'react';
import { bool, func, number, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';
// Import configs and util modules
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import * as validators from '../../../../util/validators';


// Import shared components
import {
  Button,
  Form,
  FieldTextInput
} from '../../../../components';

// Import modules from this directory
import css from './EditListingFAQForm.module.css';
import { FieldArray } from 'react-final-form-arrays';



export const EditListingPricingAndStockFormComponent = props => (


  <FinalForm
    {...props}
    keepDirtyOnReinitialize={true}

    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        formId,
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        marketplaceCurrency,
        unitType,
        listingType,
        saveActionMsg,
        updated,
        updateInProgress,
        values,
        form,
      } = formRenderProps;



      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;


      return (
        <Form onSubmit={handleSubmit} className={classes}>

          <FieldArray
            name={`FAQs`}
            render={({ fields }) => (
              <React.Fragment>
                {fields.map((name, index) => {
                  return (
                  <div key={"FAQs" + index}>
                    <div className={css.nameContainer}>
                      <FieldTextInput
                        className={css.firstName}
                        type="text"
                        name={`${name}.FAQTitle`}
                        id={`${name}.firstName`}
                        label={"Title"}
                        placeholder={"Title"}
                      />
                      <FieldTextInput
                        className={css.lastName}
                        type="textarea"
                        name={`${name}.FAQPolicies`}
                        id={`${name}.FAQPolicies`}
                        label={'Write Up'}
                        placeholder={'Here are all the policies...'}
                      />
                      <div className={css.removeBoxFirst}>
                        <button
                          className={css.removeButton}
                          type="button"
                          onClick={() => fields.remove(index)}
                        >
                         Delete
                        </button>
                      </div>
                    </div>

                  </div>
                  )
                })}
                <Button type="button" className={css.addButton} onClick={() => fields.push({})}>
                  Add
                </Button>
              </React.Fragment>
            )}
          />

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            Media
          </Button>
        </Form>
      );
    }}
  />
);

EditListingPricingAndStockFormComponent.defaultProps = {
  fetchErrors: null,
  listingMinimumPriceSubUnits: 0,
  formId: 'EditListingFAQForm',
};

EditListingPricingAndStockFormComponent.propTypes = {
  formId: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  marketplaceCurrency: string.isRequired,
  listingMinimumPriceSubUnits: number,
  unitType: string.isRequired,
  listingType: shape({ stockType: string }).isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
};

export default compose(injectIntl)(EditListingPricingAndStockFormComponent);
