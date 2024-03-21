import React from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';

import css from './EditlistingTemplatePanel.module.css';
import SearchResultsPanel from '../../../SearchPage/SearchResultsPanel/SearchResultsPanel';
import { parse } from '../../../../util/urlHelpers';
import { FormattedMessage } from 'react-intl';
import { NamedLink } from '../../../../components';


const EditlistingTemplatePanel = props => {
  const {
    className,
    rootClassName,
    listings,
    config,
  } = props;
  const classes = classNames(rootClassName || css.root, className);

  // + Create Course Template
  return (
    <div className={classes}>
      <div className={css.heading}>
        <h3>
          Select A Course Template
        </h3>
        <NamedLink
          name="NewTemplatePage"
          className={css.createCourse}
        >
          <span onClick={() => localStorage.setItem('isTemplate', 'new')}>
            <FormattedMessage id="TopbarDesktop.createCourseLink" />
          </span>
        </NamedLink>
      </div>
      <p className={css.details}>Choose from one of the templates to create a course for a new region, or create a whole new course. </p>
      {
        listings && listings.length > 0 ?
          <SearchResultsPanel
            className={css.searchListingsPanel}
            listings={listings}
            pagination={null}
            search={parse(location.search)}
            isMapVariant={false}
            isTemplate={true}
          /> :
          <h4>No templates</h4>
      }

    </div>
  );
};

EditlistingTemplatePanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  listing: null,
};

EditlistingTemplatePanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  disabled: bool.isRequired,
  ready: bool.isRequired,
  onSubmit: func.isRequired,
  onListingTypeChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditlistingTemplatePanel;
