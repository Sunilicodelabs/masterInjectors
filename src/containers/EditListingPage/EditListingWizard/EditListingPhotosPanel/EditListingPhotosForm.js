import React, { useState } from 'react';
import { bool, func, object, shape, string } from 'prop-types';
import { compose } from 'redux';
import { ARRAY_ERROR } from 'final-form';
import { Form as FinalForm, Field } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage, intlShape, injectIntl } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import { nonEmptyArray, composeValidators } from '../../../../util/validators';
import { isUploadImageOverLimitError } from '../../../../util/errors';

// Import shared components
import { Button, Form, AspectRatioWrapper, FieldSelect, FieldTextInput } from '../../../../components';

// Import modules from this directory
import ListingImage from './ListingImage';
import css from './EditListingPhotosForm.module.css';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import { courseHosts } from '../../../../config/configListing';

const ACCEPT_IMAGES = 'image/*';

const ImageUploadError = props => {
  return props.uploadOverLimit ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.imageUploadFailed.uploadOverLimit" />
    </p>
  ) : props.uploadImageError ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.imageUploadFailed.uploadFailed" />
    </p>
  ) : null;
};

// NOTE: PublishListingError and ShowListingsError are here since Photos panel is the last visible panel
// before creating a new listing. If that order is changed, these should be changed too.
// Create and show listing errors are shown above submit button
const PublishListingError = props => {
  return props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.publishListingFailed" />
    </p>
  ) : null;
};

const ShowListingsError = props => {
  return props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.showListingFailed" />
    </p>
  ) : null;
};

// Field component that uses file-input to allow user to select images.
export const FieldAddImage = props => {
  const { formApi, onImageUploadHandler, aspectWidth = 1, aspectHeight = 1, ...rest } = props;
  return (
    <Field form={null} {...rest}>
      {fieldprops => {
        const { accept, input, label, disabled: fieldDisabled } = fieldprops;
        const { name, type } = input;
        const onChange = e => {
          const file = e.target.files[0];
          formApi.change(`addImage`, file);
          formApi.blur(`addImage`);
          onImageUploadHandler(file);
        };
        const inputProps = { accept, id: name, name, onChange, type };
        return (
          <div className={css.addImageWrapper}>
            <AspectRatioWrapper width={aspectWidth} height={aspectHeight}>
              {fieldDisabled ? null : <input {...inputProps} className={css.addImageInput} />}

              <label htmlFor={name} className={css.addImage}>
               
                  <svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 12.9V6.4075e-08H2.86667V12.9C2.86667 14.0404 3.3197 15.1342 4.12611 15.9406C4.93251 16.747 6.02624 17.2 7.16667 17.2C8.3071 17.2 9.40082 16.747 10.2072 15.9406C11.0136 15.1342 11.4667 14.0404 11.4667 12.9V4.3C11.4667 3.91986 11.3157 3.55528 11.0469 3.28648C10.7781 3.01768 10.4135 2.86667 10.0333 2.86667C9.65319 2.86667 9.28862 3.01768 9.01981 3.28648C8.75101 3.55528 8.6 3.91986 8.6 4.3V14.3333H5.73333V4.3C5.73333 3.73532 5.84456 3.17616 6.06065 2.65446C6.27675 2.13276 6.59348 1.65873 6.99277 1.25944C7.39207 0.860149 7.86609 0.543413 8.38779 0.327318C8.90949 0.111223 9.46865 0 10.0333 0C10.598 0 11.1572 0.111223 11.6789 0.327318C12.2006 0.543413 12.6746 0.860149 13.0739 1.25944C13.4732 1.65873 13.7899 2.13276 14.006 2.65446C14.2221 3.17616 14.3333 3.73532 14.3333 4.3V12.9C14.3333 14.8007 13.5783 16.6236 12.2343 17.9676C10.8903 19.3116 9.06738 20.0667 7.16667 20.0667C5.26595 20.0667 3.44308 19.3116 2.09907 17.9676C0.755057 16.6236 0 14.8007 0 12.9Z" fill="#FC0483" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M35.8334 0H17.2V12.9C17.2 15.561 16.143 18.113 14.2613 19.9946C12.3797 21.8763 9.8277 22.9333 7.1667 22.9333H2.8667V38.7C2.8667 39.8404 3.31973 40.9342 4.12614 41.7406C4.93255 42.547 6.02627 43 7.1667 43H35.8334C36.9738 43 38.0675 42.547 38.8739 41.7406C39.6803 40.9342 40.1334 39.8404 40.1334 38.7V4.3C40.1334 3.15957 39.6803 2.06585 38.8739 1.25944C38.0675 0.453034 36.9738 0 35.8334 0ZM31.5334 11.4667H20.0667V14.3333H31.5334V11.4667ZM31.5334 20.0667H20.0667V22.9333H31.5334V20.0667ZM11.4667 28.6667H31.5334V31.5333H11.4667V28.6667Z" fill="#FC0483" />
                  </svg>

                  {label}
                
              </label>
            </AspectRatioWrapper>
          </div>
        );
      }}
    </Field>
  );
};

// Component that shows listing images from "images" field array
const FieldListingImage = props => {
  const { name, intl, onRemoveImage, aspectWidth, aspectHeight, variantPrefix } = props;
  return (
    <Field name={name}>
      {fieldProps => {
        const { input } = fieldProps;
        const image = input.value;
        return image ? (
          <ListingImage
            image={image}
            key={image?.id?.uuid || image?.id}
            className={css.thumbnail}
            savedImageAltText={intl.formatMessage({
              id: 'EditListingPhotosForm.savedImageAltText',
            })}
            onRemoveImage={() => onRemoveImage(image?.id)}
            aspectWidth={aspectWidth}
            aspectHeight={aspectHeight}
            variantPrefix={variantPrefix}
          />
        ) : null;
      }}
    </Field>
  );
};

export const EditListingPhotosFormComponent = props => {
  const [state, setState] = useState({ imageUploadRequested: false });
  const [submittedImages, setSubmittedImages] = useState([]);

  const onImageUploadHandler = file => {
    const { listingImageConfig, onImageUpload } = props;
    if (file) {
      setState({ imageUploadRequested: true });

      onImageUpload({ id: `${file.name}_${Date.now()}`, file }, listingImageConfig)
        .then(() => {
          setState({ imageUploadRequested: false });
        })
        .catch(() => {
          setState({ imageUploadRequested: false });
        });
    }
  };



  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      render={formRenderProps => {
        const {
          form,
          className,
          fetchErrors,
          handleSubmit,
          intl,
          invalid,
          onRemoveImage,
          disabled,
          ready,
          saveActionMsg,
          updated,
          updateInProgress,
          touched,
          errors,
          values,
          listingImageConfig,
          isTemplate
        } = formRenderProps;

        const images = values.images;
        const { aspectWidth = 1, aspectHeight = 1, variantPrefix } = listingImageConfig;

        const { publishListingError, showListingsError, updateListingError, uploadImageError } =
          fetchErrors || {};
        const uploadOverLimit = isUploadImageOverLimitError(uploadImageError);

        // imgs can contain added images (with temp ids) and submitted images with uniq ids.
        const arrayOfImgIds = imgs => imgs.map(i => (typeof i.id === 'string' ? i.imageId : i.id));
        const imageIdsFromProps = arrayOfImgIds(images);
        const imageIdsFromPreviousSubmit = arrayOfImgIds(submittedImages);
        const imageArrayHasSameImages = isEqual(imageIdsFromProps, imageIdsFromPreviousSubmit);
        const submittedOnce = submittedImages.length > 0;
        const pristineSinceLastSubmit = submittedOnce && imageArrayHasSameImages;

        const submitReady = (updated && pristineSinceLastSubmit) || ready;
        const submitInProgress = updateInProgress;
        const submitDisabled =
          invalid || disabled || submitInProgress || state.imageUploadRequested || ready;
        const imagesError = touched.images && errors?.images && errors.images[ARRAY_ERROR];

        const classes = classNames(css.root, className);


        const handleDrop = (event, fileName) => {
          event.preventDefault();
          const reader = new FileReader();
          const file = event.dataTransfer.files[0];
          form.change('addImage', event.dataTransfer.files);
          if (file.size < 500000) {
            onImageUploadHandler(file);
          }

          reader.onload = () => {
            // setFile(reader.result);
          };
          reader.readAsDataURL(file);
        }

        return (
          <Form
            className={classes}
            onSubmit={e => {
              setSubmittedImages(images);
              handleSubmit(e);
            }}
          >
            {updateListingError ? (
              <p className={css.error}>
                <FormattedMessage id="EditListingPhotosForm.updateFailed" />
              </p>
            ) : null}

            <div className={css.imagesFieldArray}>
              <FieldArray
                name="images"
                validate={composeValidators(
                  nonEmptyArray(
                    intl.formatMessage({
                      id: 'EditListingPhotosForm.imageRequired',
                    })
                  )
                )}
              >
                {({ fields }) =>
                  fields.map((name, index) => (
                    <FieldListingImage
                      key={name}
                      name={name}
                      onRemoveImage={imageId => {
                        fields.remove(index);
                        onRemoveImage(imageId);
                      }}
                      intl={intl}
                      aspectWidth={aspectWidth}
                      aspectHeight={aspectHeight}
                      variantPrefix={variantPrefix}
                    />
                  ))
                }
              </FieldArray>

              <div
                onDrop={event => handleDrop(event)}
                onDragOver={event => event.preventDefault()}
              >
                <FieldAddImage
                  id="addImage"
                  name="addImage"
                  accept={ACCEPT_IMAGES}
                  label={
                    <span className={css.chooseImageText}>
                      <IconCollection icon="imageIcon" />
                      {images.length === 0 && (
                        <>
                          <br />
                          <span className={css.chooseImage}>
                            <FormattedMessage id="EditListingPhotosForm.chooseImage" />
                          </span>
                          <span className={css.imageTypes}>
                            <FormattedMessage id="EditListingPhotosForm.imageTypes" />
                          </span>
                        </>
                      )}
                    </span>
                  }
                  type="file"
                  disabled={state.imageUploadRequested}
                  formApi={form}
                  onImageUploadHandler={onImageUploadHandler}
                  aspectWidth={aspectWidth}
                  aspectHeight={aspectHeight}
                />
              </div>
            </div>

            {imagesError ? <div className={css.arrayError}>{imagesError}</div> : null}

            <ImageUploadError
              uploadOverLimit={uploadOverLimit}
              uploadImageError={uploadImageError}
            />

            {/* <p className={css.tip}>
              <FormattedMessage id="EditListingPhotosForm.addImagesTip" />
            </p> */}


            {isTemplate === "variant" ? <div className={css.fieldsWrapper}>
              <FieldTextInput
                className={css.building}
                type="contractName"
                name="contractName"
                id={`contractName`}
                label={'Contract Name'}
                placeholder={'Contract Name'}
              />

              <FieldSelect
                className={css.quantityField}
                name={"courseHostLink"}
                id={`courseHostLink`}
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
            </div> : null
            }

            <PublishListingError error={publishListingError} />
            <ShowListingsError error={showListingsError} />

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
};

EditListingPhotosFormComponent.defaultProps = { fetchErrors: null };

EditListingPhotosFormComponent.propTypes = {
  fetchErrors: shape({
    publishListingError: propTypes.error,
    showListingsError: propTypes.error,
    uploadImageError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  intl: intlShape.isRequired,
  onImageUpload: func.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  onRemoveImage: func.isRequired,
  listingImageConfig: object.isRequired,
};

export default compose(injectIntl)(EditListingPhotosFormComponent);
