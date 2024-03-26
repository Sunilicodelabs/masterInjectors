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
  required,
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
      const currentDate = new Date().toISOString().split('T')[0]
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
                          min={currentDate}
                          label={index == 1 ? "Select Date #2 (optional)" : "Select Date #1"}
                          placeholder={"Select Date #1"}
                          validate={index > 0 ? false :required(
                            intl.formatMessage({
                              id: 'EditListingDetailsForm.dateRequired',
                            })
                          )}
                        />
                        <FieldSelect
                          className={css.quantityField}
                          name={`${name}.startTime`}
                          id={`${name}.startTime`}
                          label={'Start Time'}
                          validate={index > 0 ? false : required(
                            intl.formatMessage({
                              id: 'EditListingDetailsForm.dateRequired',
                            })
                          )}
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
                          validate={index > 0 ? false : required(
                            intl.formatMessage({
                              id: 'EditListingDetailsForm.dateRequired',
                            })
                          )}
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
                            <svg fill="#000000" height="22px" width="22px" version="1.1" id="Layer_1" viewBox="0 0 14.08 14.08" enableBackground="new 0 0 512 512" ><path d="M1.174 12.906c0 0.646 0.525 1.174 1.174 1.174h9.386c0.646 0 1.174 -0.525 1.174 -1.174V5.28H1.174zm8.8 -5.866h1.174v5.28h-1.174zm-3.52 0h1.174v5.28h-1.174zm-3.52 0h1.174v5.28h-1.174zm10.56 -4.694h-3.52V1.174C9.974 0.525 9.446 0 8.8 0H5.28c-0.646 0 -1.174 0.525 -1.174 1.174v1.174h-3.52C0.261 2.346 0 2.61 0 2.934V3.52c0 0.325 0.261 0.586 0.586 0.586h12.906c0.325 0 0.586 -0.261 0.586 -0.586v-0.586c0.003 -0.325 -0.259 -0.588 -0.583 -0.588m-4.694 0H5.28V1.174h3.52z" /></svg>
                          </button>
                        </div>
                      </div>

                    </div>
                  )
                })}

                <div type="button" className={css.addButton} onClick={() => fields.push({})}>
                  + Add A Day
                </div>
              </React.Fragment>
            )}
          />

          <div className={css.fieldsWrapper}>
            <FieldSelect
              className={css.quantityField}
              name={"capacity"}
              id={`capacity`}
              label={'Select the capacity:'}
              validate={required(
                intl.formatMessage({
                  id: 'EditListingDetailsForm.dateRequired',
                })
              )}
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
              validate={required(
                intl.formatMessage({
                  id: 'EditListingDetailsForm.dateRequired',
                })
              )}
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
          </div>

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
