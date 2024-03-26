import React, { useEffect, useState } from 'react';
import { bool, node, func, object, string, array } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { injectIntl, intlShape } from '../../../../util/reactIntl';
import {
    Form,
    NamedLink,
    FieldLocationAutocompleteInput,
} from '../../../../components';

import css from './LandingSearchFilterForm.module.css';
import {
    autocompleteSearchRequired,
    autocompletePlaceSelected,
    composeValidators,

} from '../../../../util/validators';


const identity = v => v;

const LandingSearchFilterFormComponent = props => (
    <FinalForm
        {...props}
        mutators={{ ...arrayMutators }}
        render={fieldRenderProps => {
            const {
                rootClassName,
                className,
                handleSubmit,
                intl,
                autoFocus,
                values,
            } = fieldRenderProps;

            const classes = classNames(rootClassName, css.root, className);

            const addressRequiredMessage = intl.formatMessage({
                id: 'LandingSearchFilterForm.addressRequired',
            });
            const addressNotRecognizedMessage = intl.formatMessage({
                id: 'LandingSearchFilterForm.addressNotRecognized',
            });

            return (
                <Form className={classes}>

                    <div className={css.SearchFilter}>
                        <FieldLocationAutocompleteInput
                            rootClassName={css.locationAddress}
                            inputClassName={css.locationAutocompleteInput}
                            iconClassName={css.locationAutocompleteInputIcon}
                            predictionsClassName={css.predictionsRoot}
                            validClassName={css.validLocation}
                            autoFocus={autoFocus}
                            name="location"
                            placeholder={intl.formatMessage({
                                id: 'LandingSearchFilterForm.signupAddressPlaceholder',
                            })}
                            useDefaultPredictions={false}
                            format={identity}
                            valueFromForm={values.location}
                            validate={composeValidators(
                                autocompleteSearchRequired(addressRequiredMessage),
                                autocompletePlaceSelected(addressNotRecognizedMessage)
                            )}
                        />
                    </div>


                    <NamedLink className={css.submitButtonLink} name="SearchPage">
                        Get Started Now
                    </NamedLink>



                </Form>
            );
        }}
    />
);

LandingSearchFilterFormComponent.defaultProps = {
    inProgress: false,
};

LandingSearchFilterFormComponent.propTypes = {
    inProgress: bool,
    rootClassName: string,
    className: string,
    desktopInputRoot: string,
    //   onSubmit: func.isRequired,
    isMobile: bool,
    appConfig: object.isRequired,

    // from injectIntl
    intl: intlShape.isRequired,
};

const LandingSearchFilterForm = compose(injectIntl)(LandingSearchFilterFormComponent);
LandingSearchFilterForm.displayName = 'SignupForm';

export default LandingSearchFilterForm;
