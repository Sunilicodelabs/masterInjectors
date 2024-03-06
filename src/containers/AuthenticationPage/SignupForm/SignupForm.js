import React from 'react';
import { bool, node } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import * as validators from '../../../util/validators';
import { Form, PrimaryButton, FieldTextInput, FieldCheckbox, FieldSelect } from '../../../components';

import css from './SignupForm.module.css';
import { hearAboutUs, languageISpeak, professionTypes, tShirtSize } from '../../../config/configListing';

const SignupFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={fieldRenderProps => {
      const {
        rootClassName,
        className,
        formId,
        handleSubmit,
        inProgress,
        invalid,
        intl,
        termsAndConditions,
        values
      } = fieldRenderProps;

      // email
      const emailRequired = validators.required(
        intl.formatMessage({
          id: 'SignupForm.emailRequired',
        })
      );
      const emailValid = validators.emailFormatValid(
        intl.formatMessage({
          id: 'SignupForm.emailInvalid',
        })
      );

      // password
      const passwordRequiredMessage = intl.formatMessage({
        id: 'SignupForm.passwordRequired',
      });
      const passwordMinLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooShort',
        },
        {
          minLength: validators.PASSWORD_MIN_LENGTH,
        }
      );
      const passwordMaxLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooLong',
        },
        {
          maxLength: validators.PASSWORD_MAX_LENGTH,
        }
      );
      const passwordMinLength = validators.minLength(
        passwordMinLengthMessage,
        validators.PASSWORD_MIN_LENGTH
      );
      const passwordMaxLength = validators.maxLength(
        passwordMaxLengthMessage,
        validators.PASSWORD_MAX_LENGTH
      );
      const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);
      const passwordValidators = validators.composeValidators(
        passwordRequired,
        passwordMinLength,
        passwordMaxLength
      );

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = invalid || submitInProgress;

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <div>
            <FieldTextInput
              type="email"
              id={formId ? `${formId}.email` : 'email'}
              name="email"
              autoComplete="email"
              label={intl.formatMessage({
                id: 'SignupForm.emailLabel',
              })}
              placeholder={intl.formatMessage({
                id: 'SignupForm.emailPlaceholder',
              })}
              validate={validators.composeValidators(emailRequired, emailValid)}
            />
            <div className={css.name}>
              <FieldTextInput
                className={css.firstNameRoot}
                type="text"
                id={formId ? `${formId}.fname` : 'fname'}
                name="fname"
                autoComplete="given-name"
                label={intl.formatMessage({
                  id: 'SignupForm.firstNameLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'SignupForm.firstNamePlaceholder',
                })}
                validate={validators.required(
                  intl.formatMessage({
                    id: 'SignupForm.firstNameRequired',
                  })
                )}
              />
              <FieldTextInput
                className={css.lastNameRoot}
                type="text"
                id={formId ? `${formId}.lname` : 'lname'}
                name="lname"
                autoComplete="family-name"
                label={intl.formatMessage({
                  id: 'SignupForm.lastNameLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'SignupForm.lastNamePlaceholder',
                })}
                validate={validators.required(
                  intl.formatMessage({
                    id: 'SignupForm.lastNameRequired',
                  })
                )}
              />
            </div>
            <FieldTextInput
              className={css.password}
              type="number"
              id={formId ? `${formId}.phoneNumber` : 'phoneNumber'}
              name="phoneNumber"
              label={intl.formatMessage({
                id: 'SignupForm.phoneNumberLabel',
              })}
              placeholder={intl.formatMessage({
                id: 'SignupForm.phoneNumberPlaceholder',
              })}
              validate={validators.required(
                intl.formatMessage({
                  id: 'SignupForm.phoneNumberRequired',
                })
              )}
            />
            <FieldTextInput
              className={css.password}
              type="password"
              id={formId ? `${formId}.password` : 'password'}
              name="password"
              autoComplete="new-password"
              label={intl.formatMessage({
                id: 'SignupForm.passwordLabel',
              })}
              placeholder={intl.formatMessage({
                id: 'SignupForm.passwordPlaceholder',
              })}
              validate={passwordValidators}
            />
          </div>

          <div>
            <label>I am a...</label>
            {professionTypes.map((item, index) => {
              return (
                <div key={index}>
                  <FieldCheckbox
                    id={`${index}.professionTypes`}
                    name="professionTypes"
                    label={item?.label}
                    value={item?.key}
                    required={true} />
                </div>
              )
            })}
          </div>

          {values?.professionTypes?.includes("other") && 
          <FieldTextInput
            className={css.password}
            type="text"
            id={formId ? `${formId}.OtherProfession` : 'OtherProfession'}
            name="OtherProfession"
            // label={}
            placeholder={intl.formatMessage({
              id: 'SignupForm.OtherProfessionPlaceholder',
            })}
          />}

          <FieldSelect
            id={`${formId}.hearAboutUs`}
            name="hearAboutUs"
            className={css.field}
            label={intl.formatMessage({ id: 'SignupForm.hearAboutUsLabel' })}
          >
            <option disabled value="">
              {intl.formatMessage({ id: 'SignupForm.hearAboutUsPlaceholder' })}
            </option>
            {hearAboutUs.map(size => {
              return (
                <option key={size.key} value={size.value}>
                  {size.label}
                </option>
              );
            })}
          </FieldSelect>

          {values?.hearAboutUs === "friend" && 
          <FieldTextInput
            className={css.password}
            type="text"
            id={formId ? `${formId}.hearAboutUsFriendDetails` : 'hearAboutUsFriendDetails'}
            name="hearAboutUsFriendDetails"
            placeholder={intl.formatMessage({
              id: 'SignupForm.hearAboutUsFriendDetailsPlaceholder',
            })}
          />}

          <FieldSelect
            id={`${formId}.tShirtSize`}
            name="tShirtSize"
            className={css.field}
            label={intl.formatMessage({ id: 'SignupForm.tShirtSizeLabel' })}
            validate={validators.required(
              intl.formatMessage({ id: 'SignupForm.tShirtSize' })
            )}
          >
            <option disabled value="">
              {intl.formatMessage({ id: 'SignupForm.tShirtSizePlaceholder' })}
            </option>
            {tShirtSize.map(size => {
              return (
                <option key={size.key} value={size.value}>
                  {size.label}
                </option>
              );
            })}
          </FieldSelect>


          <div>
            <label>I speak....</label>
            {languageISpeak.map((item, index) => {
              return (
                <div key={index}>
                  <FieldCheckbox
                    id={`${index}.languageISpeak`}
                    name="languageISpeak"
                    label={item?.label}
                    value={item?.key}
                    required={true} />
                </div>
              )
            })}
          </div>


          {values?.languageISpeak?.length > 0 && 
          <FieldTextInput
            className={css.password}
            type="text"
            id={formId ? `${formId}.languageISpeakText` : 'languageISpeakText'}
            name="languageISpeakText"
            placeholder={intl.formatMessage({
              id: 'SignupForm.languageISpeakTextPlaceholder',
            })}
          />}

          <div className={css.bottomWrapper}>
            {termsAndConditions}
            <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
              <FormattedMessage id="SignupForm.signUp" />
            </PrimaryButton>
          </div>
        </Form>
      );
    }}
  />
);

SignupFormComponent.defaultProps = { inProgress: false };

SignupFormComponent.propTypes = {
  inProgress: bool,
  termsAndConditions: node.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const SignupForm = compose(injectIntl)(SignupFormComponent);
SignupForm.displayName = 'SignupForm';

export default SignupForm;
