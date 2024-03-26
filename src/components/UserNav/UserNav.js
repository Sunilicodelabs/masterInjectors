import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { ACCOUNT_SETTINGS_PAGES } from '../../routing/routeConfiguration';
import { LinkTabNavHorizontal } from '../../components';

import css from './UserNav.module.css';
import { getUserType } from '../../util/helper';
import { useSelector } from 'react-redux';

const UserNav = props => {
  const { className, rootClassName, currentPage } = props;
  const classes = classNames(rootClassName || css.root, className);
  const {currentUser} = useSelector(state=>state.user);

  const tabs = [

    {
      text: <FormattedMessage id="UserNav.profileSettings" />,
      selected: currentPage === 'ProfileSettingsPage',
      disabled: false,
      linkProps: {
        name: 'ProfileSettingsPage',
      },
    },
    {
      text: <FormattedMessage id="UserNav.accountSettings" />,
      selected: ACCOUNT_SETTINGS_PAGES.includes(currentPage),
      disabled: false,
      linkProps: {
        name: 'ContactDetailsPage',
      },
    },
  ];

  const userListingTab = {
    text: <FormattedMessage id="UserNav.yourListings" />,
    selected: currentPage === 'ManageListingsPage',
    linkProps: {
      name: 'ManageListingsPage',
    },
  }

  const userType = getUserType(currentUser);
  console.log('userType', userType)

  if (userType==="admin") {
    tabs.push(userListingTab)
  }



  return (
    <LinkTabNavHorizontal className={classes} tabRootClassName={css.tab} tabs={tabs} skin="dark" />
  );
};

UserNav.defaultProps = {
  className: null,
  rootClassName: null,
};

const { string } = PropTypes;

UserNav.propTypes = {
  className: string,
  rootClassName: string,
  currentPage: string.isRequired,
};

export default UserNav;
