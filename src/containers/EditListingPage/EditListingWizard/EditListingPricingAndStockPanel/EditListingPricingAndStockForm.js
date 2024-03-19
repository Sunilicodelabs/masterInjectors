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
          <FieldCurrencyInput
            id={`${formId}.price`}
            name="price"
            className={css.input}
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
            className={css.input}
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


          <div className={css.tagsInput}>
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
            <div className={css.formRow}>
              <div>
                <div>
                  {values.listItems && values.listItems.length
                    ? values.listItems.map((hk, i) => (
                      <div key={hk + i}>
                        <span >{hk}</span>
                        <span
                          className={css.tagClose}
                          onClick={() => {
                            form.change('listItems', values.listItems.filter(h => h != hk));
                          }}
                        >
                          <svg
                            width="10"
                            height="11"
                            viewBox="0 0 10 11"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.05541 10.0554C8.83037 10.2804 8.52516 10.4069 8.20691 10.4069C7.88866 10.4069 7.58345 10.2804 7.35841 10.0554L4.70741 7.02541L2.05641 10.0544C1.94531 10.1673 1.81296 10.2571 1.66698 10.3187C1.52101 10.3802 1.36429 10.4122 1.20589 10.4128C1.04748 10.4135 0.890512 10.3827 0.744038 10.3224C0.597565 10.2621 0.464484 10.1734 0.352472 10.0613C0.24046 9.94934 0.151734 9.81626 0.091412 9.66978C0.0310898 9.52331 0.000364857 9.36634 0.00100988 9.20793C0.0016549 9.04953 0.0336569 8.89281 0.09517 8.74684C0.156683 8.60086 0.24649 8.46851 0.35941 8.35741L3.11741 5.20741L0.35841 2.05541C0.24549 1.94431 0.155683 1.81196 0.09417 1.66598C0.0326569 1.52001 0.000654968 1.36329 9.94895e-06 1.20489C-0.00063507 1.04648 0.0300898 0.889512 0.0904121 0.743038C0.150734 0.596565 0.23946 0.463484 0.351472 0.351472C0.463484 0.23946 0.596565 0.150734 0.743038 0.0904121C0.889512 0.0300898 1.04648 -0.00063507 1.20489 9.94895e-06C1.36329 0.000654968 1.52001 0.0326569 1.66598 0.09417C1.81196 0.155683 1.94431 0.24549 2.05541 0.35841L4.70741 3.38941L7.35841 0.35841C7.46951 0.24549 7.60186 0.155683 7.74784 0.09417C7.89382 0.0326569 8.05053 0.000654968 8.20893 9.94895e-06C8.36734 -0.00063507 8.52431 0.0300898 8.67078 0.0904121C8.81726 0.150734 8.95034 0.23946 9.06235 0.351472C9.17436 0.463484 9.26309 0.596565 9.32341 0.743038C9.38373 0.889512 9.41445 1.04648 9.41381 1.20489C9.41317 1.36329 9.38116 1.52001 9.31965 1.66598C9.25814 1.81196 9.16833 1.94431 9.05541 2.05541L6.29741 5.20741L9.05541 8.35741C9.16698 8.46886 9.25549 8.6012 9.31588 8.74688C9.37627 8.89256 9.40735 9.04871 9.40735 9.20641C9.40735 9.36411 9.37627 9.52026 9.31588 9.66594C9.25549 9.81162 9.16698 9.94396 9.05541 10.0554Z"
                              fill="#353535"
                            />
                          </svg>
                        </span>
                      </div>
                    ))
                    : null}
                </div>
              </div>
            </div>
          </div>

          <div onClick={() => { addValue() }}>
            +Add
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
            Location
            {/* {saveActionMsg} */}
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
