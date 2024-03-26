import React from 'react';
import { node, string } from 'prop-types';
import classNames from 'classnames';
import { Field } from 'react-final-form';

import css from './FieldCheckbox.module.css';

const IconCheckbox = props => {
  const { className, checkedClassName, boxClassName } = props;
  return (
    <svg  className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_i_183_411)">
          <rect width="22" height="22" rx="2" fill="#2ECC71" className={checkedClassName || css.checked} />
          <path className={checkedClassName || css.tick}  d="M16.3453 5.38184C16.345 5.38184 16.3448 5.38143 16.345 5.38121C16.6038 5.13717 16.9479 5.00227 17.305 5.00495C17.6623 5.00763 18.0047 5.14793 18.2597 5.39622C18.5148 5.64452 18.6626 5.98139 18.6721 6.33577C18.6815 6.69015 18.5518 7.03431 18.3103 7.29563L10.9792 16.3907C10.8532 16.5254 10.701 16.6335 10.5319 16.7085C10.3628 16.7835 10.1801 16.8239 9.99486 16.8273C9.80962 16.8307 9.62558 16.7971 9.45376 16.7283C9.28194 16.6595 9.12587 16.5571 8.99487 16.4271L4.13318 11.6044C3.99779 11.4792 3.88919 11.3283 3.81388 11.1606C3.73856 10.993 3.69806 10.8119 3.69479 10.6284C3.69153 10.4448 3.72557 10.2625 3.79487 10.0923C3.86418 9.9221 3.96734 9.76748 4.0982 9.63767C4.22905 9.50786 4.38492 9.40553 4.55651 9.33678C4.7281 9.26803 4.91189 9.23426 5.09692 9.2375C5.28195 9.24074 5.46442 9.28091 5.63346 9.35563C5.8025 9.43034 5.95463 9.53807 6.08079 9.67237L8.33968 11.9121C9.18679 12.752 10.5761 12.6683 11.3163 11.7328L16.3095 5.42194C16.3207 5.40814 16.3328 5.39497 16.3455 5.38248C16.3458 5.38225 16.3456 5.38184 16.3453 5.38184Z" fill="white" />
        </g>
        <defs>
          <filter id="filter0_i_183_411" x="0" y="0" width="22" height="26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_183_411" />
          </filter>
        </defs>
      </svg>
  );
};

IconCheckbox.defaultProps = { className: null, checkedClassName: null, boxClassName: null };

IconCheckbox.propTypes = { className: string, checkedClassName: string, boxClassName: string };

const FieldCheckboxComponent = props => {
  const {
    rootClassName,
    className,
    svgClassName,
    textClassName,
    id,
    label,
    useSuccessColor,
    ...rest
  } = props;

  const classes = classNames(rootClassName || css.root, className);

  // This is a workaround for a bug in Firefox & React Final Form.
  // https://github.com/final-form/react-final-form/issues/134
  const handleOnChange = (input, event) => {
    const { onBlur, onChange } = input;
    onChange(event);
    onBlur(event);

    // If onChange has been passed as a props to FieldCheckbox
    if (rest.onChange) {
      rest.onChange(event);
    }
  };

  const successColorVariantMaybe = useSuccessColor
    ? {
        checkedClassName: css.checkedSuccess,
        boxClassName: css.boxSuccess,
      }
    : {};
  const disabledColorMaybe = rest.disabled
    ? {
        checkedClassName: css.checkedDisabled,
        boxClassName: css.boxDisabled,
      }
    : {};

  return (
    <span className={classes}>
      <Field type="checkbox" {...rest}>
        {props => {
          const { input, disabled } = props;
          return (
            <input
              id={id}
              className={css.input}
              {...input}
              onChange={event => handleOnChange(input, event)}
              disabled={disabled}
            />
          );
        }}
      </Field>
      <label htmlFor={id} className={css.label}>
        <span className={css.checkboxWrapper}>
          <IconCheckbox
            className={svgClassName}
            {...successColorVariantMaybe}
            {...disabledColorMaybe}
          />
        </span>
        <span className={classNames(css.text, textClassName || css.textRoot)}>{label}</span>
      </label>
    </span>
  );
};

FieldCheckboxComponent.defaultProps = {
  className: null,
  rootClassName: null,
  svgClassName: null,
  textClassName: null,
  label: null,
};

FieldCheckboxComponent.propTypes = {
  className: string,
  rootClassName: string,
  svgClassName: string,
  textClassName: string,

  // Id is needed to connect the label with input.
  id: string.isRequired,
  label: node,

  // Name groups several checkboxes to an array of selected values
  name: string.isRequired,

  // Checkbox needs a value that is passed forward when user checks the checkbox
  value: string.isRequired,
};

export default FieldCheckboxComponent;
