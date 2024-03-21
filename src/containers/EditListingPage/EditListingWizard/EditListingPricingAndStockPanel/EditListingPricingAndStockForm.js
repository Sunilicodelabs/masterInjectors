import React from 'react';
import { bool, func, number, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

// Import configs and util modules
import appSettings from '../../../../config/settings';
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { STOCK_INFINITE_ITEMS, STOCK_MULTIPLE_ITEMS, propTypes } from '../../../../util/types';
import { isOldTotalMismatchStockError } from '../../../../util/errors';
import * as validators from '../../../../util/validators';
import { formatMoney } from '../../../../util/currency';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import {
  Button,
  Form,
  FieldCurrencyInput,
  FieldCheckboxGroup,
  FieldTextInput,
} from '../../../../components';

// Import modules from this directory
import css from './EditListingPricingAndStockForm.module.css';

const { Money } = sdkTypes;
const MILLION = 1000000;

const getPriceValidators = (listingMinimumPriceSubUnits, marketplaceCurrency, intl) => {
  const priceRequiredMsgId = { id: 'EditListingPricingAndStockForm.priceRequired' };
  const priceRequiredMsg = intl.formatMessage(priceRequiredMsgId);
  const priceRequired = validators.required(priceRequiredMsg);

  const minPriceRaw = new Money(listingMinimumPriceSubUnits, marketplaceCurrency);
  const minPrice = formatMoney(intl, minPriceRaw);
  const priceTooLowMsgId = { id: 'EditListingPricingAndStockForm.priceTooLow' };
  const priceTooLowMsg = intl.formatMessage(priceTooLowMsgId, { minPrice });
  const minPriceRequired = validators.moneySubUnitAmountAtLeast(
    priceTooLowMsg,
    listingMinimumPriceSubUnits
  );

  return listingMinimumPriceSubUnits
    ? validators.composeValidators(priceRequired, minPriceRequired)
    : priceRequired;
};

/**
 * If stock type is changed to infinity (on the fly),
 * we show checkbox for providers to update their current stock to infinity.
 * This is created to avoid overselling problem, if operator changes stock type
 * from finite to infinite. I.e. the provider notices, if stock management configuration has changed.
 *
 * Note 1: infinity is faked using billiard aka 10^15
 * Note 2: If stock is less than a million (10^6) items, we show this checkbox component.
 *
 * @param {Object} props contains { hasInfiniteStock, currentStock, formId, intl }
 * @returns a component containing checkbox group (stockTypeInfinity) with one key: infinity
 */
const UpdateStockToInfinityCheckboxMaybe = ({ hasInfiniteStock, currentStock, formId, intl }) => {
  return hasInfiniteStock && currentStock != null && currentStock < MILLION ? (
    <div className={css.input}>
      <p>
        <FormattedMessage
          id="EditListingPricingAndStockForm.updateToInfiniteInfo"
          values={{
            currentStock,
            b: msgFragment => <b>{msgFragment}</b>,
          }}
        />
      </p>
      <FieldCheckboxGroup
        id={`${formId}.stockTypeInfinity`}
        name="stockTypeInfinity"
        options={[
          {
            key: 'infinity',
            label: intl.formatMessage({
              id: 'EditListingPricingAndStockForm.updateToInfinite',
            }),
          },
        ]}
        validate={validators.requiredFieldArrayCheckbox(
          intl.formatMessage({
            id: 'EditListingPricingAndStockForm.updateToInfiniteRequired',
          })
        )}
      />
    </div>
  ) : null;
};

export const EditListingPricingAndStockFormComponent = props => (
  <FinalForm
    {...props}
    keepDirtyOnReinitialize={true}

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
        marketplaceCurrency,
        unitType,
        listingMinimumPriceSubUnits,
        listingType,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        values,
        form,
      } = formRenderProps;
      const priceValidators = getPriceValidators(
        listingMinimumPriceSubUnits,
        marketplaceCurrency,
        intl
      );
      // Note: outdated listings don't have listingType!
      // I.e. listings that are created with previous listing type setup.
      const hasStockManagement = listingType?.stockType === STOCK_MULTIPLE_ITEMS;
      const stockValidator = validators.numberAtLeast(
        intl.formatMessage({ id: 'EditListingPricingAndStockForm.stockIsRequired' }),
        0
      );
      const hasInfiniteStock = STOCK_INFINITE_ITEMS.includes(listingType?.stockType);
      const currentStock = values.stock;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;
      const { updateListingError, showListingsError, setStockError } = fetchErrors || {};

      const stockErrorMessage = isOldTotalMismatchStockError(setStockError)
        ? intl.formatMessage({ id: 'EditListingPricingAndStockForm.oldStockTotalWasOutOfSync' })
        : intl.formatMessage({ id: 'EditListingPricingAndStockForm.stockUpdateFailed' });

      const addValue = () => {

        const listItems = values.listItems || [];
        listItems.push(values.list);
        form.change('listItems', listItems);
        form.change('list', '');
      }
      return (
        <Form onSubmit={handleSubmit} className={classes}>
          {updateListingError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPricingAndStockForm.updateFailed" />
            </p>
          ) : null}
          {showListingsError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPricingAndStockForm.showListingFailed" />
            </p>
          ) : null}
          <div className={css.fieldsWrapper}>


            <FieldCurrencyInput
              id={`${formId}.price`}
              name="price"

              autoFocus={autoFocus}
              label={intl.formatMessage(
                { id: 'EditListingPricingAndStockForm.pricePerProduct' },
                { unitType }
              )}
              placeholder={intl.formatMessage({
                id: 'EditListingPricingAndStockForm.priceInputPlaceholder',
              })}
              currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
              validate={priceValidators}
            />
            <FieldCurrencyInput
              id={`${formId}.coursePrice`}
              name="coursePrice"

              label={intl.formatMessage(
                { id: 'EditListingPricingAndStockForm.pricePerCourseValue' },
                { unitType }
              )}
              placeholder={intl.formatMessage({
                id: 'EditListingPricingAndStockForm.priceInputPlaceholder',
              })}
              currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
              validate={priceValidators}
            />

          </div>
          <div className={css.tagsInput}>
            <div className={css.fieldsWrapperWithBtn}>
              <FieldTextInput
                id="list"
                name="list"
                className={css.inputBox}
                type="text"
                label={intl.formatMessage({ id: 'EditListingPricingAndStockForm.listItemLabel' })}
                placeholder={intl.formatMessage({ id: 'EditListingDetailsForm.listItemLabelPlaceholder' })}
                onKeyUp={event => {
                  event.preventDefault();
                  if (event.keyCode === 13 && event.target.value) {
                    event.preventDefault();
                    const listItems = values.listItems || [];
                    listItems.push(event.target.value);
                    form.change('listItems', listItems);
                    form.change('list', '');
                  }
                }}

              />
              <div onClick={() => { addValue() }} className={css.addValue}>
                <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 0C7.3875 0 0 7.3875 0 16.5C0 25.6125 7.3875 33 16.5 33C25.6125 33 33 25.6125 33 16.5C33 7.3875 25.6125 0 16.5 0ZM18 22.5C18 22.8978 17.842 23.2794 17.5607 23.5607C17.2794 23.842 16.8978 24 16.5 24C16.1022 24 15.7206 23.842 15.4393 23.5607C15.158 23.2794 15 22.8978 15 22.5V18H10.5C10.1022 18 9.72064 17.842 9.43934 17.5607C9.15804 17.2794 9 16.8978 9 16.5C9 16.1022 9.15804 15.7206 9.43934 15.4393C9.72064 15.158 10.1022 15 10.5 15H15V10.5C15 10.1022 15.158 9.72064 15.4393 9.43934C15.7206 9.15804 16.1022 9 16.5 9C16.8978 9 17.2794 9.15804 17.5607 9.43934C17.842 9.72064 18 10.1022 18 10.5V15H22.5C22.8978 15 23.2794 15.158 23.5607 15.4393C23.842 15.7206 24 16.1022 24 16.5C24 16.8978 23.842 17.2794 23.5607 17.5607C23.2794 17.842 22.8978 18 22.5 18H18V22.5Z" fill="#FE02BF" />
                </svg>

              </div>
            </div>
            <div className={css.formRow}>
              <div>
                <div>
                  {values.listItems && values.listItems.length
                    ? values.listItems.map((hk, i) => (
                      <div key={hk + i} className={css.lineItem}>
                        <div>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6.5" cy="6.5" r="6.5" fill="#FD0578" />
                          </svg>

                          <span >{hk}</span>
                        </div>
                        <span
                          className={css.tagClose}
                          onClick={() => {
                            form.change('listItems', values.listItems.filter(h => h != hk));
                          }}
                        >
                          <svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.2698 6.59998L7.9481 11.4M13.2698 11.4L7.9481 6.59998L13.2698 11.4Z" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" />
                            <path d="M10.6087 17C15.5072 17 19.4782 13.4183 19.4782 9C19.4782 4.58172 15.5072 1 10.6087 1C5.71021 1 1.7392 4.58172 1.7392 9C1.7392 13.4183 5.71021 17 10.6087 17Z" stroke="black" stroke-opacity="0.6" stroke-width="2" />
                          </svg>

                        </span>
                      </div>
                    ))
                    : null}
                </div>
              </div>
            </div>
          </div>


          {/* 
          <UpdateStockToInfinityCheckboxMaybe
            formId={formId}
            hasInfiniteStock={hasInfiniteStock}
            currentStock={currentStock}
            intl={intl}
          /> */}

          {hasStockManagement ? (
            <FieldTextInput
              className={css.input}
              id={`${formId}.stock`}
              name="stock"
              label={intl.formatMessage({ id: 'EditListingPricingAndStockForm.stockLabel' })}
              placeholder={intl.formatMessage({
                id: 'EditListingPricingAndStockForm.stockPlaceholder',
              })}
              type="number"
              min={0}
              validate={stockValidator}
            />
          ) : (
            <Field id="stock" name="stock" type="hidden" className={css.unitTypeHidden}>
              {fieldRenderProps => <input {...fieldRenderProps?.input} />}
            </Field>
          )}
          {setStockError ? <p className={css.error}>{stockErrorMessage}</p> : null}

          <FieldCheckboxGroup
            name="isPriceEditable"
            id="isPriceEditable"
            optionLabelClassName={css.finePrint}
            className={css.checkbox}
            options={[
              {
                key: 'isPriceEditable',
                label: intl.formatMessage(
                  { id: 'EditListingPricingAndStockForm.isPriceEditable' },
                ),
              },
            ]}
          // validate={validators.requiredFieldArrayCheckbox(
          //   intl.formatMessage({ id: 'AuthenticationPage.termsAndConditionsAcceptRequired' })
          // )}
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

EditListingPricingAndStockFormComponent.defaultProps = {
  fetchErrors: null,
  listingMinimumPriceSubUnits: 0,
  formId: 'EditListingPricingAndStockForm',
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
