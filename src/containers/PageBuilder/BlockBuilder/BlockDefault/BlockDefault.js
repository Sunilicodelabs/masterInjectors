import React from 'react';
import { func, node, object, shape, string } from 'prop-types';
import classNames from 'classnames';

import Field, { hasDataInFields } from '../../Field';
import BlockContainer from '../BlockContainer';

import css from './BlockDefault.module.css';
import { Button } from '../../../../components';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import SearchComponent from './LandingFilterForm';

const FieldMedia = props => {
  const { className, media, sizes, options } = props;
  const hasMediaField = hasDataInFields([media], options);
  return hasMediaField ? (
    <div className={classNames(className, css.media)}>
      <Field data={media} sizes={sizes} options={options} />
    </div>
  ) : null;
};

const BlockDefault = props => {
  const {
    blockId,
    className,
    rootClassName,
    mediaClassName,
    textClassName,
    ctaButtonClass,
    title,
    text,
    callToAction,
    media,
    responsiveImageSizes,
    options,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const hasTextComponentFields = hasDataInFields([title, text, callToAction], options);




  return (
    <>
      <BlockContainer id={blockId} className={classes}>
        <FieldMedia
          media={media}
          sizes={responsiveImageSizes}
          className={mediaClassName}
          options={options}
        />
        {hasTextComponentFields ? (
          <div className={classNames(textClassName, css.text)}>
            <Field data={title} options={options} />
            <Field data={text} options={options} />
            <Field data={callToAction} className={ctaButtonClass} options={options} />
          </div>
        ) : null}
        {blockId == "landing-hero-left" && <div>
        <SearchComponent
            onSubmit={()=>{}}
          /> 
          </div>}
      </BlockContainer>

      {blockId == "master-injector-membership-2" && <BlockContainer id={"master-injector-membership-3"} className={classes}>
        <div>

          <div className={css.cources}>
            <div><h4>Injector</h4>
              <p>$250 Monthly</p>
            </div>
            <div>
              <h4>Nurse Injector</h4>
              <p>$375 Monthly</p>
            </div>
          </div>
          <div >
            <Button className={css.button}>
              <IconCollection name="iconLock" />
              Complete 1st Course To Unlock</Button>
          </div>
        </div>
      </BlockContainer>}

    </>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

BlockDefault.defaultProps = {
  className: null,
  rootClassName: null,
  mediaClassName: null,
  textClassName: null,
  ctaButtonClass: null,
  title: null,
  text: null,
  callToAction: null,
  media: null,
  responsiveImageSizes: null,
  options: null,
};

BlockDefault.propTypes = {
  blockId: string.isRequired,
  className: string,
  rootClassName: string,
  mediaClassName: string,
  textClassName: string,
  ctaButtonClass: string,
  title: object,
  text: object,
  callToAction: object,
  media: object,
  responsiveImageSizes: string,
  options: propTypeOption,
};

export default BlockDefault;
