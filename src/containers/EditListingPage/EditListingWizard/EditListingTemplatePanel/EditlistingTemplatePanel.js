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
      <div>
        <NamedLink
          name="NewTemplatePage"
        >
          <span onClick={() => typeof window!="undefined" && localStorage.setItem('isTemplate', 'new')}>
            <FormattedMessage id="EditlistingTemplatePanel.createNewCourseLink" />
          </span>
        </NamedLink>
      </div>
     {
      listings && listings.length > 0 ? 
      <SearchResultsPanel
      className={css.searchListingsPanel}
      listings={listings}
      pagination={null}
      search={parse(location.search)}
      isMapVariant={false}
      isTemplate={true}
    />:
    <h1>No templates</h1>
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
  // onListingTypeChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditlistingTemplatePanel;
