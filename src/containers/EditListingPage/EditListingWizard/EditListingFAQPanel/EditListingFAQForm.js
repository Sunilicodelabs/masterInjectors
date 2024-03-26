import React, { useEffect, useState } from 'react';
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
        onSubmit,
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
        publicData,
        handleSubmitFAQ
      } = formRenderProps;

      const { FAQs } = publicData || {};
      var isTemplate = typeof window!="undefined" && localStorage.getItem('isTemplate');

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      const initialFormData = FAQs || [];

      const [formData, setFormData] = useState(initialFormData);
      const [editId, setEditId] = useState(null);
      const [FAQTitle, setFAQTitle] = useState('');
      const [FAQPolicies, setFAQPolicies] = useState('');

      const handleEdit = (id) => {
        const editItem = formData.find(item => item.id === id);
        setEditId(id);
        setFAQTitle(editItem.FAQTitle);
        setFAQPolicies(editItem.FAQPolicies);
      };

      const handleDelete = (id) => {
        const updatedFormData = formData.filter(item => item.id !== id);
        setFormData(updatedFormData);
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        const updatedFormData = editId ? formData.map(item => {
          if (item.id === editId) {
            return { ...item, FAQTitle, FAQPolicies };
          }
          return item;
        }) : [...formData, { id: formData && formData.length + 1, FAQTitle: FAQTitle, FAQPolicies: FAQPolicies }];

        setFormData(updatedFormData);
        setEditId(null);
        setFAQTitle('');
        setFAQPolicies('');
      };

      return (

        <div>
          <form onSubmit={handleSubmit}>
            <label>
              Title:
              <input type="text" value={FAQTitle} onChange={(e) => setFAQTitle(e.target.value)} />
            </label>
            <div className={css.inputsSm}>
              <label>
                Here are all the policies...
              </label>
              <textarea  value={FAQPolicies} onChange={(e) => setFAQPolicies(e.target.value)} />
            </div>
            <button className={css.addbtn} type="submit">{editId ? 'Update FAQ' : '+Add FAQ'}</button>
          </form>
          <ul>
            {formData && formData.map(item => (
              <li key={item.id} className={css.faqItems}>
                <div className={css.FaqHeader}>
                  <h4> {item.FAQTitle} </h4>
                  <div>
                    <button onClick={() => handleEdit(item.id)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.3 6.19998H5C4.46957 6.19998 3.96086 6.41069 3.58579 6.78576C3.21071 7.16084 3 7.66954 3 8.19998V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H16C17.1 21 18 20 18 18.9V11L14 15.2C13.7 15.5 13.3 15.8 12.8 15.9L10.1 16.5C8.4 16.8 6.8 15.2 7.1 13.4L7.7 10.5C7.8 9.99998 8.1 9.49998 8.4 9.19998L11.4 6.09998L11.3 6.19998Z" fill="#FC0483" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M19.8 4.29999C19.6119 3.82366 19.2563 3.43246 18.8 3.19999C18.4352 3.03997 18.0308 2.99255 17.6389 3.06382C17.2469 3.13508 16.8852 3.32179 16.6 3.59999L16 4.19999L18.9 7.19999L19.4 6.59999C19.5941 6.40196 19.747 6.16745 19.85 5.91C19.953 5.65255 20.004 5.37725 20 5.09999C20 4.89999 20 4.59999 19.8 4.29999ZM17.4 8.69999L14.6 5.69999L9.8 10.7L9.7 11L9 14C9 14.3 9.3 14.7 9.6 14.6L12.3 14L12.6 13.9L17.3 8.89999L17.4 8.69999Z" fill="#FC0483" />
                    </svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)}><svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.5307 6.59998L7.20898 11.4M12.5307 11.4L7.20898 6.59998L12.5307 11.4Z" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" />
                      <path d="M9.8695 17C14.768 17 18.739 13.4183 18.739 9C18.739 4.58172 14.768 1 9.8695 1C4.97101 1 1 4.58172 1 9C1 13.4183 4.97101 17 9.8695 17Z" stroke="black" stroke-opacity="0.6" stroke-width="2" />
                    </svg>
                    </button>
                  </div>
                </div>
                <p>{item.FAQPolicies}</p>

              </li>
            ))}
          </ul>
          <Button
            className={css.submitButton}
            onClick={()=>handleSubmitFAQ(formData)}
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}

          </Button>
        </div>

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
