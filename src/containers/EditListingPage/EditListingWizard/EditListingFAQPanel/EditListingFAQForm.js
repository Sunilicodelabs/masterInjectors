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
      var isTemplate = localStorage.getItem('isTemplate');

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      const initialFormData = FAQs;

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
        }) : [...formData, { id: formData.length + 1, FAQTitle: FAQTitle, FAQPolicies: FAQPolicies }];

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
            <label>
              Here are all the policies...
              <input type="text" value={FAQPolicies} onChange={(e) => setFAQPolicies(e.target.value)} />
            </label>
            <button type="submit">{editId ? 'Update FAQ' : '+Add FAQ'}</button>
          </form>
          <ul>
            {formData.map(item => (
              <li key={item.id}>
                {item.FAQTitle} - {item.FAQPolicies}
                <button onClick={() => handleEdit(item.id)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
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
