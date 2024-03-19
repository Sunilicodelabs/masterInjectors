import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';

// Import configs and util modules
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import {
  autocompleteSearchRequired,
  autocompletePlaceSelected,
  composeValidators,
} from '../../../../util/validators';

// Import shared components
import {
  Form,
  FieldLocationAutocompleteInput,
  Button,
  FieldTextInput,
  FieldSelect,
} from '../../../../components';

// Import modules from this directory
import css from './EditListingLocationForm.module.css';
import { FieldArray } from 'react-final-form-arrays';
import { courseHosts } from '../../../../config/configListing';

const identity = v => v;

export const EditListingLocationFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        formId,
        autoFocus,
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        values,
      } = formRenderProps;

      const addressRequiredMessage = intl.formatMessage({
        id: 'EditListingLocationForm.addressRequired',
      });
      const addressNotRecognizedMessage = intl.formatMessage({
        id: 'EditListingLocationForm.addressNotRecognized',
      });

      const optionalText = intl.formatMessage({
        id: 'EditListingLocationForm.optionalText',
      });

      const { updateListingError, showListingsError } = fetchErrors || {};

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;
      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {updateListingError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingLocationForm.updateFailed" />
            </p>
          ) : null}

          {showListingsError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingLocationForm.showListingFailed" />
            </p>
          ) : null}

          <FieldLocationAutocompleteInput
            rootClassName={css.locationAddress}
            inputClassName={css.locationAutocompleteInput}
            iconClassName={css.locationAutocompleteInputIcon}
            predictionsClassName={css.predictionsRoot}
            validClassName={css.validLocation}
            // autoFocus={autoFocus}
            name="location"
            label={intl.formatMessage({ id: 'EditListingLocationForm.address' })}
            placeholder={intl.formatMessage({
              id: 'EditListingLocationForm.addressPlaceholder',
            })}
            useDefaultPredictions={false}
            format={identity}
            valueFromForm={values.location}
            validate={composeValidators(
              autocompleteSearchRequired(addressRequiredMessage),
              autocompletePlaceSelected(addressNotRecognizedMessage)
            )}
          />

          <FieldArray
            name={`dateAndTime`}
            render={({ fields }) => (
              <React.Fragment>
                {fields.map((name, index) => {
                  return (
                    <div key={"date" + index}>
                      <div className={css.nameContainer}>
                        <FieldTextInput
                          className={css.firstName}
                          type="date"
                          name={`${name}.date`}
                          id={`${name}.date`}
                          label={index == 1 ? "Select Date #2 (optional)" : "Select Date #1"}
                          placeholder={"Select Date #1"}
                        />
                        <FieldSelect
                          className={css.quantityField}
                          name={`${name}.startTime`}
                          id={`${name}.startTime`}
                          label={'Start Time'}
                        >
                          <option disabled value="">
                            {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
                          </option>
                          {[...Array(12).keys()].map(hour => {
                            const time = hour === 0 ? 12 : hour; // Adjusting 0 to 12 for AM format
                            const formattedTime = `${time}:00 AM`;
                            return (
                              <option key={formattedTime} value={formattedTime}>
                                {formattedTime}
                              </option>
                            );
                          })}
                        </FieldSelect>

                        <FieldSelect

                          className={css.quantityField}
                          name={`${name}.endTime`}
                          id={`${name}.endTime`}
                          label={'End Time'}
                        >
                          <option disabled value="">
                            {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
                          </option>
                          {[...Array(12).keys()].map(hour => {
                            const time = hour === 0 ? 12 : hour; // Adjusting 0 to 12 for AM format
                            const formattedTime = `${time}:00 PM`;
                            return (
                              <option key={formattedTime} value={formattedTime}>
                                {formattedTime}
                              </option>
                            );
                          })}
                        </FieldSelect>


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


          <FieldSelect
            className={css.quantityField}
            name={"capacity"}
            id={`capacity`}
            label={'Select the capacity:'}
          >
            <option disabled value="">
              {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
            </option>
            {[...Array(50).keys()].map(cap => {
              const value = cap + 1; // Adjusting value to start from 1
              return (
                <option key={value} value={value}>
                  {value}
                </option>
              );
            })}
          </FieldSelect>

          <FieldSelect
            className={css.quantityField}
            name={"courseHost"}
            id={`courseHost`}
            label={'Select the primary host:'}
          >
            <option disabled value="">
              {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
            </option>
            {courseHosts?.map(host => {
              return (
                <option key={host.key} value={host.value}>
                  {host.label}
                </option>
              );
            })}
          </FieldSelect>

          <FieldTextInput
            className={css.building}
            type="textarea"
            name="additionalDetails"
            id={`${formId}additionalDetails`}
            label={'Write any additional details (this will be visible at checkout)'}
            placeholder={'This course is for those who....'}
          />

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingLocationFormComponent.defaultProps = {
  selectedPlace: null,
  fetchErrors: null,
  formId: 'EditListingLocationForm',
};

EditListingLocationFormComponent.propTypes = {
  formId: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  selectedPlace: propTypes.place,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
};

export default compose(injectIntl)(EditListingLocationFormComponent);
