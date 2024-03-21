import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';
import * as validators from '../../../../util/validators';
import { formatMoney } from '../../../../util/currency';
import { types as sdkTypes } from '../../../../util/sdkLoader';
// Import util modules
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { ADMIN, EXTENDED_DATA_SCHEMA_TYPES, propTypes } from '../../../../util/types';
import { maxLength, required, composeValidators } from '../../../../util/validators';

// Import shared components
import { Form, Button, FieldSelect, FieldTextInput, Heading, FieldCurrencyInput } from '../../../../components';
// Import modules from this directory
import CustomExtendedDataField from '../CustomExtendedDataField';
import css from './EditListingDetailsForm.module.css';
import appSettings from '../../../../config/settings';
import { courseDressCode, courseLevels, courseRequirements, courseType } from '../../../../config/configListing';


const { Money } = sdkTypes;
const MILLION = 1000000;

const TITLE_MAX_LENGTH = 60;

// Show various error messages
const ErrorMessage = props => {
  const { fetchErrors } = props;
  const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
  const errorMessage = updateListingError ? (
    <FormattedMessage id="EditListingDetailsForm.updateFailed" />
  ) : createListingDraftError ? (
    <FormattedMessage id="EditListingDetailsForm.createListingDraftError" />
  ) : showListingsError ? (
    <FormattedMessage id="EditListingDetailsForm.showListingFailed" />
  ) : null;

  if (errorMessage) {
    return <p className={css.error}>{errorMessage}</p>;
  }
  return null;
};

// Hidden input field
const FieldHidden = props => {
  const { name } = props;
  return (
    <Field id={name} name={name} type="hidden" className={css.unitTypeHidden}>
      {fieldRenderProps => <input {...fieldRenderProps?.input} />}
    </Field>
  );
};

// Field component that either allows selecting listing type (if multiple types are available)
// or just renders hidden fields:
// - listingType              Set of predefined configurations for each listing type
// - transactionProcessAlias  Initiate correct transaction against Marketplace API
// - unitType                 Main use case: pricing unit
const FieldSelectListingType = props => {
  const { name, listingTypes, hasExistingListingType, onListingTypeChange, formApi, intl } = props;
  const hasMultipleListingTypes = listingTypes?.length > 1;

  const handleOnChange = value => {
    const selectedListingType = listingTypes.find(config => config.listingType === value);
    formApi.change('transactionProcessAlias', selectedListingType.transactionProcessAlias);
    formApi.change('unitType', selectedListingType.unitType);

    if (onListingTypeChange) {
      onListingTypeChange(selectedListingType);
    }
  };
  const getListingTypeLabel = listingType => {
    const listingTypeConfig = listingTypes.find(config => config.listingType === listingType);
    return listingTypeConfig ? listingTypeConfig.label : listingType;
  };

  return hasMultipleListingTypes && !hasExistingListingType ? (
    <>
      <FieldSelect
        id={name}
        name={name}
        className={css.listingTypeSelect}
        label={intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeLabel' })}
        validate={required(
          intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeRequired' })
        )}
        onChange={handleOnChange}
      >
        <option disabled value="">
          {intl.formatMessage({ id: 'EditListingDetailsForm.listingTypePlaceholder' })}
        </option>
        {listingTypes.map(config => {
          const type = config.listingType;
          return (
            <option key={type} value={type}>
              {config.label}
            </option>
          );
        })}
      </FieldSelect>
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </>
  ) : hasMultipleListingTypes && hasExistingListingType ? (
    <div className={css.listingTypeSelect}>
      <Heading as="h5" rootClassName={css.selectedLabel}>
        {intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeLabel' })}
      </Heading>
      <p className={css.selectedValue}>{getListingTypeLabel(formApi.getFieldState(name)?.value)}</p>
      <FieldHidden name={name} />
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </div>
  ) : (
    <>
      <FieldHidden name={name} />
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </>
  );
};

// Add collect data for listing fields (both publicData and privateData) based on configuration
const AddListingFields = props => {
  const { listingType, listingFieldsConfig, intl } = props;
  const fields = listingFieldsConfig.reduce((pickedFields, fieldConfig) => {
    const { key, includeForListingTypes, schemaType, scope } = fieldConfig || {};
    const namespacedKey = scope === 'public' ? `pub_${key}` : `priv_${key}`;

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isTargetListingType =
      includeForListingTypes == null || includeForListingTypes.includes(listingType);
    const isProviderScope = ['public', 'private'].includes(scope);

    return isKnownSchemaType && isTargetListingType && isProviderScope
      ? [
        ...pickedFields,
        <CustomExtendedDataField
          key={namespacedKey}
          name={namespacedKey}
          fieldConfig={fieldConfig}
          defaultRequiredMessage={intl.formatMessage({
            id: 'EditListingDetailsForm.defaultRequiredMessage',
          })}
        />,
      ]
      : pickedFields;
  }, []);

  return <>{fields}</>;
};





// Form that asks title, description, transaction process and unit type for pricing
// In addition, it asks about custom fields according to marketplace-custom-config.js
const EditListingDetailsFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        autoFocus,
        className,
        disabled,
        ready,
        formId,
        form: formApi,
        handleSubmit,
        onListingTypeChange,
        intl,
        invalid,
        pristine,
        selectableListingTypes,
        hasExistingListingType,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        listingFieldsConfig,
        values,
        userType,
        listingMinimumPriceSubUnits,
        marketplaceCurrency,
        unitType
      } = formRenderProps;
      const { listingType } = values;

      const titleRequiredMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.titleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingDetailsForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);



      // Show title and description only after listing type is selected
      const showTitle = listingType;
      const showDescription = listingType;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <ErrorMessage fetchErrors={fetchErrors} />

          <FieldSelectListingType
            name="listingType"
            listingTypes={selectableListingTypes}
            hasExistingListingType={hasExistingListingType}
            onListingTypeChange={onListingTypeChange}
            formApi={formApi}
            intl={intl}
          />

          {showTitle ? (
            <FieldTextInput
              id={`${formId}title`}
              name="title"
              className={css.title}
              type="text"
              label={intl.formatMessage({ id: userType === ADMIN ? 'EditListingDetailsForm.CourseTitle' : 'EditListingDetailsForm.title' })}
              placeholder={intl.formatMessage({ id: 'EditListingDetailsForm.titlePlaceholder' })}
              maxLength={TITLE_MAX_LENGTH}
              validate={composeValidators(required(titleRequiredMessage), maxLength60Message)}
              autoFocus={autoFocus}
            />
          ) : null}

          <FieldTextInput
            id={`${formId}courseForDescription`}
            name="courseForDescription"
            className={css.description}
            type="textarea"
            label={intl.formatMessage({ id: userType === ADMIN ? 'EditListingDetailsForm.courseForDescription' : 'EditListingDetailsForm.description' })}
            placeholder={intl.formatMessage({
              id: 'EditListingDetailsForm.courseForDescriptionPlaceholder',
            })}
            validate={required(
              intl.formatMessage({
                id: 'EditListingDetailsForm.descriptionRequired',
              })
            )}
          />

          <div className={css.fieldsWrapper}>
            <FieldSelect
              className={css.customField}
              name="courseType"
              id="courseType"
              label="Is this online, in person, or a hybrid?"
            >
              <option disabled value="">
                {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
              </option>
              {courseType.map(optionConfig => {
                const key = optionConfig.key;
                return (
                  <option key={key} value={key}>
                    {optionConfig.label}
                  </option>
                );
              })}
            </FieldSelect>

            <FieldSelect
              className={css.customField}
              name="courseDressCode"
              id="courseDressCode"
              label="Select the dress code options:"
            >
              <option disabled value="">
                {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
              </option>
              {courseDressCode.map(optionConfig => {
                const key = optionConfig.key;
                return (
                  <option key={key} value={key}>
                    {optionConfig.label}
                  </option>
                );
              })}
            </FieldSelect>
          </div>

          {showDescription ? (

            <FieldTextInput
              id={`${formId}description`}
              name="description"
              className={css.description}
              type="textarea"
              label={intl.formatMessage({ id: userType === ADMIN ? 'EditListingDetailsForm.courseDescription' : 'EditListingDetailsForm.description' })}
              placeholder={intl.formatMessage({
                id: 'EditListingDetailsForm.descriptionPlaceholder',
              })}
              validate={required(
                intl.formatMessage({
                  id: 'EditListingDetailsForm.descriptionRequired',
                })
              )}
            />
          ) : null}
          <div className={css.fieldsWrapper}>
            <FieldSelect
              className={css.customField}
              name="courseLevels"
              id="courseLevels"
              label="What levels are being covered?"
            >
              <option disabled value="">
                {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
              </option>
              {courseLevels.map(optionConfig => {
                const key = optionConfig.key;
                return (
                  <option key={key} value={key}>
                    {optionConfig.label}
                  </option>
                );
              })}
            </FieldSelect>

            <FieldSelect
              className={css.customField}
              name="courseRequirements"
              id="courseRequirements"
              label="What requirements are needed?"
            >
              <option disabled value="">
                {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
              </option>
              {courseRequirements.map(optionConfig => {
                const key = optionConfig.key;
                return (
                  <option key={key} value={key}>
                    {optionConfig.label}
                  </option>
                );
              })}
            </FieldSelect>
          </div>



          {/* <AddListingFields
              listingType={listingType}
              listingFieldsConfig={listingFieldsConfig}
              intl={intl}
            /> */}


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

EditListingDetailsFormComponent.defaultProps = {
  className: null,
  formId: 'EditListingDetailsForm',
  fetchErrors: null,
  hasExistingListingType: false,
  listingFieldsConfig: [],
};

EditListingDetailsFormComponent.propTypes = {
  className: string,
  formId: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  onListingTypeChange: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    createListingDraftError: propTypes.error,
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  selectableListingTypes: arrayOf(
    shape({
      listingType: string.isRequired,
      transactionProcessAlias: string.isRequired,
      unitType: string.isRequired,
    })
  ).isRequired,
  hasExistingListingType: bool,
  listingFieldsConfig: propTypes.listingFieldsConfig,
};

export default compose(injectIntl)(EditListingDetailsFormComponent);
