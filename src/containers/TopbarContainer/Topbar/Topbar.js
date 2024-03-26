import React, { Component } from 'react';
import { array, arrayOf, bool, func, number, object, shape, string } from 'prop-types';
import pickBy from 'lodash/pickBy';
import classNames from 'classnames';

import appSettings from '../../../config/settings';
import { useConfiguration } from '../../../context/configurationContext';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';

import { FormattedMessage, intlShape, useIntl } from '../../../util/reactIntl';
import { isMainSearchTypeKeywords, isOriginInUse } from '../../../util/search';
import { parse, stringify } from '../../../util/urlHelpers';
import { createResourceLocatorString, matchPathname, pathByRouteName } from '../../../util/routes';
import { propTypes } from '../../../util/types';
import {
  Button,
  LimitedAccessBanner,
  LinkedLogo,
  Modal,
  ModalMissingInformation,
  NamedLink,
} from '../../../components';

import MenuIcon from './MenuIcon';
import SearchIcon from './SearchIcon';
import TopbarSearchForm from './TopbarSearchForm/TopbarSearchForm';
import TopbarMobileMenu from './TopbarMobileMenu/TopbarMobileMenu';
import TopbarDesktop from './TopbarDesktop/TopbarDesktop';

import css from './Topbar.module.css';

const MAX_MOBILE_SCREEN_WIDTH = 1024;

const redirectToURLWithModalState = (props, modalStateParam) => {
  const { history, location } = props;
  const { pathname, search, state } = location;
  const searchString = `?${stringify({ [modalStateParam]: 'open', ...parse(search) })}`;
  history.push(`${pathname}${searchString}`, state);
};

const redirectToURLWithoutModalState = (props, modalStateParam) => {
  const { history, location } = props;
  const { pathname, search, state } = location;
  const queryParams = pickBy(parse(search), (v, k) => {
    return k !== modalStateParam;
  });
  const stringified = stringify(queryParams);
  const searchString = stringified ? `?${stringified}` : '';
  history.push(`${pathname}${searchString}`, state);
};

const isPrimary = o => o.group === 'primary';
const isSecondary = o => o.group === 'secondary';
const compareGroups = (a, b) => {
  const isAHigherGroupThanB = isPrimary(a) && isSecondary(b);
  const isALesserGroupThanB = isSecondary(a) && isPrimary(b);
  // Note: sort order is stable in JS
  return isAHigherGroupThanB ? -1 : isALesserGroupThanB ? 1 : 0;
};
// Returns links in order where primary links are returned first
const sortCustomLinks = customLinks => {
  const links = Array.isArray(customLinks) ? customLinks : [];
  return links.sort(compareGroups);
};

// Resolves in-app links against route configuration
const getResolvedCustomLinks = (customLinks, routeConfiguration) => {
  const links = Array.isArray(customLinks) ? customLinks : [];
  return links.map(linkConfig => {
    const { type, href } = linkConfig;
    const isInternalLink = type === 'internal' || href.charAt(0) === '/';
    if (isInternalLink) {
      // Internal link
      const testURL = new URL('http://my.marketplace.com' + href);
      const matchedRoutes = matchPathname(testURL.pathname, routeConfiguration);
      if (matchedRoutes.length > 0) {
        const found = matchedRoutes[0];
        const to = { search: testURL.search, hash: testURL.hash };
        return {
          ...linkConfig,
          route: {
            name: found.route?.name,
            params: found.params,
            to,
          },
        };
      }
    }
    return linkConfig;
  });
};

const isCMSPage = found =>
  found.route?.name === 'CMSPage' ? `CMSPage:${found.params?.pageId}` : null;
const isInboxPage = found =>
  found.route?.name === 'InboxPage' ? `InboxPage:${found.params?.tab}` : null;
// Find the name of the current route/pathname.
// It's used as handle for currentPage check.
const getResolvedCurrentPage = (location, routeConfiguration) => {
  const matchedRoutes = matchPathname(location.pathname, routeConfiguration);
  if (matchedRoutes.length > 0) {
    const found = matchedRoutes[0];
    const cmsPageName = isCMSPage(found);
    const inboxPageName = isInboxPage(found);
    return cmsPageName ? cmsPageName : inboxPageName ? inboxPageName : `${found.route?.name}`;
  }
};

const GenericError = props => {
  const { show } = props;
  const classes = classNames(css.genericError, {
    [css.genericErrorVisible]: show,
  });
  return (
    <div className={classes}>
      <div className={css.genericErrorContent}>
        <p className={css.genericErrorText}>
          <FormattedMessage id="Topbar.genericError" />
        </p>
      </div>
    </div>
  );
};

GenericError.propTypes = {
  show: bool.isRequired,
};

class TopbarComponent extends Component {
  constructor(props) {
    super(props);
    this.handleMobileMenuOpen = this.handleMobileMenuOpen.bind(this);
    this.handleMobileMenuClose = this.handleMobileMenuClose.bind(this);
    this.handleMobileSearchOpen = this.handleMobileSearchOpen.bind(this);
    this.handleMobileSearchClose = this.handleMobileSearchClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleMobileMenuOpen() {
    redirectToURLWithModalState(this.props, 'mobilemenu');
  }

  handleMobileMenuClose() {
    redirectToURLWithoutModalState(this.props, 'mobilemenu');
  }

  handleMobileSearchOpen() {
    redirectToURLWithModalState(this.props, 'mobilesearch');
  }

  handleMobileSearchClose() {
    redirectToURLWithoutModalState(this.props, 'mobilesearch');
  }

  handleSubmit(values) {
    const { currentSearchParams } = this.props;
    const { history, config, routeConfiguration } = this.props;

    const topbarSearchParams = () => {
      if (isMainSearchTypeKeywords(config)) {
        return { keywords: values?.keywords };
      }
      // topbar search defaults to 'location' search
      const { search, selectedPlace } = values?.location;
      const { origin, bounds } = selectedPlace;
      const originMaybe = isOriginInUse(config) ? { origin } : {};

      return {
        ...originMaybe,
        address: search,
        bounds,
      };
    };
    const searchParams = {
      ...currentSearchParams,
      ...topbarSearchParams(),
    };
    history.push(createResourceLocatorString('SearchPage', routeConfiguration, {}, searchParams));
  }

  handleLogout() {
    const { onLogout, history, routeConfiguration } = this.props;
    onLogout().then(() => {
      const path = pathByRouteName('LandingPage', routeConfiguration);

      // In production we ensure that data is really lost,
      // but in development mode we use stored values for debugging
      if (appSettings.dev) {
        history.push(path);
      } else if (typeof window !== 'undefined') {
        window.location = path;
      }

      console.log('logged out'); // eslint-disable-line
    });
  }

  render() {
    const {
      className,
      rootClassName,
      desktopClassName,
      mobileRootClassName,
      mobileClassName,
      isAuthenticated,
      authScopes,
      authInProgress,
      currentUser,
      currentUserHasListings,
      currentUserHasOrders,
      currentPage,
      notificationCount,
      intl,
      location,
      onManageDisableScrolling,
      onResendVerificationEmail,
      sendVerificationEmailInProgress,
      sendVerificationEmailError,
      showGenericError,
      config,
      routeConfiguration,
    } = this.props;

    const { mobilemenu, mobilesearch, keywords, address, origin, bounds } = parse(location.search, {
      latlng: ['origin'],
      latlngBounds: ['bounds'],
    });

    // Custom links are sorted so that group="primary" are always at the beginning of the list.
    const sortedCustomLinks = sortCustomLinks(config.topbar?.customLinks);
    const customLinks = getResolvedCustomLinks(sortedCustomLinks, routeConfiguration);
    const resolvedCurrentPage = currentPage || getResolvedCurrentPage(location, routeConfiguration);

    const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;

    const hasMatchMedia = typeof window !== 'undefined' && window?.matchMedia;
    const isMobileLayout = hasMatchMedia
      ? window.matchMedia(`(max-width: ${MAX_MOBILE_SCREEN_WIDTH}px)`)?.matches
      : true;
    const isMobileMenuOpen = isMobileLayout && mobilemenu === 'open';
    const isMobileSearchOpen = isMobileLayout && mobilesearch === 'open';

    const mobileMenu = (
      <TopbarMobileMenu
        isAuthenticated={isAuthenticated}
        currentUserHasListings={currentUserHasListings}
        currentUser={currentUser}
        onLogout={this.handleLogout}
        notificationCount={notificationCount}
        currentPage={resolvedCurrentPage}
        customLinks={customLinks}
      />
    );

    const topbarSearcInitialValues = () => {
      if (isMainSearchTypeKeywords(config)) {
        return { keywords };
      }

      // Only render current search if full place object is available in the URL params
      const locationFieldsPresent = isOriginInUse(config)
        ? address && origin && bounds
        : address && bounds;
      return {
        location: locationFieldsPresent
          ? {
            search: address,
            selectedPlace: { address, origin, bounds },
          }
          : null,
      };
    };
    const initialSearchFormValues = topbarSearcInitialValues();

    const classes = classNames(rootClassName || css.root, className);
    const isAuthenticatedOrJustHydrated = isAuthenticated;

    const LoginLink = () => {
      typeof window != "undefined" && localStorage.setItem('isAdmin', 'true')
      return (
        <NamedLink name="AdminLoginPage" className={classNames(css.topbarLink, css.loginLink)}>
          <span className={css.topbarLinkLabel}>
            Admin Login
          </span>
        </NamedLink>
      );
    };

    const adminLoginMayBe = isAuthenticatedOrJustHydrated ? null : <LoginLink />;

    return (
      <div className={classes}>
        <div className={css.topbarAdminLoginWrapper}>
          <div className={css.topbarSocialLinks}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M3.01728 0.219693C5.66433 -0.0732308 8.3357 -0.0732308 10.9827 0.219693C12.4289 0.380865 13.5948 1.51744 13.7646 2.96647C14.0785 5.64609 14.0785 8.3531 13.7646 11.0327C13.5948 12.4817 12.4289 13.6183 10.9835 13.7802C8.33621 14.0733 5.66458 14.0733 3.01728 13.7802C1.57116 13.6183 0.405282 12.4817 0.235464 11.0335C-0.078488 8.3536 -0.078488 5.64634 0.235464 2.96647C0.405282 1.51744 1.57116 0.380865 3.01728 0.219693ZM10.8076 2.4381C10.6056 2.4381 10.4119 2.5182 10.2691 2.66077C10.1263 2.80334 10.0461 2.99672 10.0461 3.19835C10.0461 3.39998 10.1263 3.59335 10.2691 3.73592C10.4119 3.8785 10.6056 3.9586 10.8076 3.9586C11.0096 3.9586 11.2033 3.8785 11.3461 3.73592C11.4889 3.59335 11.5691 3.39998 11.5691 3.19835C11.5691 2.99672 11.4889 2.80334 11.3461 2.66077C11.2033 2.5182 11.0096 2.4381 10.8076 2.4381ZM3.38281 6.99959C3.38281 6.04185 3.76391 5.12333 4.44227 4.4461C5.12063 3.76887 6.04067 3.38841 7.00002 3.38841C7.95936 3.38841 8.87941 3.76887 9.55777 4.4461C10.2361 5.12333 10.6172 6.04185 10.6172 6.99959C10.6172 7.95733 10.2361 8.87585 9.55777 9.55308C8.87941 10.2303 7.95936 10.6108 7.00002 10.6108C6.04067 10.6108 5.12063 10.2303 4.44227 9.55308C3.76391 8.87585 3.38281 7.95733 3.38281 6.99959Z" fill="#FE02BF" />
            </svg>

            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.65425 14C12.447 14 16.1629 8.61244 16.1629 3.94854C16.1644 3.79706 16.1621 3.64558 16.1561 3.4941C16.8793 2.99254 17.5037 2.37195 18 1.66127C17.324 1.94586 16.608 2.13381 15.8749 2.21909C16.6473 1.77726 17.2258 1.08193 17.5028 0.262425C16.7774 0.674564 15.9831 0.963476 15.1549 1.11638C14.5982 0.548896 13.8616 0.172956 13.0591 0.0467905C12.2566 -0.0793753 11.4331 0.0512745 10.716 0.418503C9.99895 0.785731 9.42841 1.36904 9.09276 2.07808C8.7571 2.78713 8.67508 3.58233 8.85938 4.34052C7.39089 4.27037 5.95423 3.90537 4.64268 3.26921C3.33114 2.63306 2.17403 1.73997 1.2465 0.647943C0.775779 1.42667 0.632194 2.34765 0.844883 3.224C1.05757 4.10035 1.6106 4.86642 2.39175 5.36677C1.80609 5.34865 1.23322 5.19809 0.72 4.92741V4.97587C0.721432 5.79146 1.0168 6.58161 1.55624 7.21294C2.09568 7.84426 2.84616 8.2781 3.681 8.44122C3.36405 8.52484 3.03664 8.56651 2.70788 8.56506C2.47603 8.56736 2.24456 8.54679 2.01712 8.50368C2.25269 9.20611 2.71212 9.82031 3.33094 10.2601C3.94976 10.6998 4.6969 10.9431 5.4675 10.9557C4.15812 11.9388 2.54165 12.4724 0.8775 12.4708C0.584211 12.473 0.291089 12.4568 0 12.4224C1.6891 13.4535 3.65092 14.0008 5.65425 14Z" fill="#FE02BF" />
            </svg>

            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.23 0H0.77C0.565783 0 0.369931 0.0811248 0.225528 0.225528C0.0811248 0.369931 0 0.565783 0 0.77V13.23C0 13.4342 0.0811248 13.6301 0.225528 13.7745C0.369931 13.9189 0.565783 14 0.77 14H7.476V8.575H5.656V6.475H7.476V4.9C7.4383 4.53023 7.48195 4.15669 7.6039 3.80558C7.72585 3.45446 7.92314 3.13428 8.18193 2.86749C8.44072 2.60069 8.75474 2.39375 9.10198 2.26117C9.44921 2.12858 9.82125 2.07358 10.192 2.1C10.7368 2.09665 11.2814 2.12469 11.823 2.184V4.074H10.71C9.828 4.074 9.66 4.494 9.66 5.103V6.454H11.76L11.487 8.554H9.66V14H13.23C13.3311 14 13.4312 13.9801 13.5247 13.9414C13.6181 13.9027 13.703 13.846 13.7745 13.7745C13.846 13.703 13.9027 13.6181 13.9414 13.5247C13.9801 13.4312 14 13.3311 14 13.23V0.77C14 0.668882 13.9801 0.568754 13.9414 0.475334C13.9027 0.381913 13.846 0.297029 13.7745 0.225528C13.703 0.154027 13.6181 0.0973089 13.5247 0.0586128C13.4312 0.0199167 13.3311 0 13.23 0Z" fill="#FE02BF" />
            </svg>

            <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.82845 0.0118131C7.64444 0 8.45574 0.00700037 9.26611 0C9.31521 0.892985 9.65844 1.8026 10.3571 2.43394C11.0543 3.08104 12.0405 3.37724 13 3.47744V5.8265C12.1008 5.79893 11.1974 5.62392 10.3814 5.26166C10.026 5.11115 9.69492 4.91733 9.37086 4.71913C9.36665 6.42372 9.37834 8.12612 9.35917 9.82371C9.31054 10.6393 9.02296 11.4509 8.51606 12.1229C7.70055 13.2416 6.28509 13.971 4.83128 13.9937C3.93954 14.0414 3.04874 13.8139 2.28887 13.3948C1.02959 12.7 0.143464 11.4281 0.0144029 10.063C-0.0018537 9.77394 -0.00435011 9.4843 0.00692112 9.19499C0.119148 8.08499 0.706002 7.02312 1.61691 6.30077C2.6494 5.45942 4.09572 5.05864 5.44993 5.29578C5.46256 6.15989 5.42561 7.02312 5.42561 7.88723C4.80696 7.69997 4.08403 7.75248 3.54347 8.10381C3.14799 8.34758 2.84912 8.70624 2.69289 9.12455C2.56383 9.42031 2.60077 9.74889 2.60825 10.063C2.75648 11.0203 3.74034 11.8249 4.7906 11.7379C5.48687 11.7309 6.15415 11.3529 6.51702 10.7994C6.63439 10.6056 6.76579 10.4074 6.77281 10.1794C6.83406 9.13593 6.80975 8.09681 6.81723 7.05331C6.82237 4.70163 6.80975 2.3565 6.82892 0.0122507L6.82845 0.0118131Z" fill="#FE02BF" />
            </svg>
          </div>


          {adminLoginMayBe}
        </div>
        <LimitedAccessBanner
          isAuthenticated={isAuthenticated}
          authScopes={authScopes}
          currentUser={currentUser}
          onLogout={this.handleLogout}
          currentPage={resolvedCurrentPage}
        />
        <div className={classNames(mobileRootClassName || css.container, mobileClassName)}>
          <Button
            rootClassName={css.menu}
            onClick={this.handleMobileMenuOpen}
            title={intl.formatMessage({ id: 'Topbar.menuIcon' })}
          >
            <MenuIcon className={css.menuIcon} />
            {notificationDot}
          </Button>
          <LinkedLogo
            layout={'mobile'}
            alt={intl.formatMessage({ id: 'Topbar.logoIcon' })}
            linkToExternalSite={config?.topbar?.logoLink}
          />
          <Button
            rootClassName={css.searchMenu}
            onClick={this.handleMobileSearchOpen}
            title={intl.formatMessage({ id: 'Topbar.searchIcon' })}
          >
            <SearchIcon className={css.searchMenuIcon} />
          </Button>
        </div>
        <div className={css.desktop}>
          <TopbarDesktop
            className={desktopClassName}
            currentUserHasListings={currentUserHasListings}
            currentUser={currentUser}
            currentPage={resolvedCurrentPage}
            initialSearchFormValues={initialSearchFormValues}
            intl={intl}
            isAuthenticated={isAuthenticated}
            notificationCount={notificationCount}
            onLogout={this.handleLogout}
            onSearchSubmit={this.handleSubmit}
            config={config}
            customLinks={customLinks}
          />
        </div>
        <Modal
          id="TopbarMobileMenu"
          containerClassName={css.modalContainer}
          isOpen={isMobileMenuOpen}
          onClose={this.handleMobileMenuClose}
          usePortal
          onManageDisableScrolling={onManageDisableScrolling}
        >
          {authInProgress ? null : mobileMenu}
        </Modal>
        <Modal
          id="TopbarMobileSearch"
          containerClassName={css.modalContainerSearchForm}
          isOpen={isMobileSearchOpen}
          onClose={this.handleMobileSearchClose}
          usePortal
          onManageDisableScrolling={onManageDisableScrolling}
        >
          <div className={css.searchContainer}>
            <TopbarSearchForm
              onSubmit={this.handleSubmit}
              initialValues={initialSearchFormValues}
              isMobile
              appConfig={config}
            />
            <p className={css.mobileHelp}>
              <FormattedMessage id="Topbar.mobileSearchHelp" />
            </p>
          </div>
        </Modal>
        <ModalMissingInformation
          id="MissingInformationReminder"
          containerClassName={css.missingInformationModal}
          currentUser={currentUser}
          currentUserHasListings={currentUserHasListings}
          currentUserHasOrders={currentUserHasOrders}
          location={location}
          onManageDisableScrolling={onManageDisableScrolling}
          onResendVerificationEmail={onResendVerificationEmail}
          sendVerificationEmailInProgress={sendVerificationEmailInProgress}
          sendVerificationEmailError={sendVerificationEmailError}
        />

        <GenericError show={showGenericError} />
      </div>
    );
  }
}

TopbarComponent.defaultProps = {
  className: null,
  rootClassName: null,
  desktopClassName: null,
  mobileRootClassName: null,
  mobileClassName: null,
  notificationCount: 0,
  currentUser: null,
  currentUserHasOrders: null,
  currentPage: null,
  sendVerificationEmailError: null,
  authScopes: [],
};

TopbarComponent.propTypes = {
  className: string,
  rootClassName: string,
  desktopClassName: string,
  mobileRootClassName: string,
  mobileClassName: string,
  isAuthenticated: bool.isRequired,
  authScopes: array,
  authInProgress: bool.isRequired,
  currentUser: propTypes.currentUser,
  currentUserHasListings: bool.isRequired,
  currentUserHasOrders: bool,
  currentPage: string,
  notificationCount: number,
  onLogout: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onResendVerificationEmail: func.isRequired,
  sendVerificationEmailInProgress: bool.isRequired,
  sendVerificationEmailError: propTypes.error,
  showGenericError: bool.isRequired,

  // These are passed from Page to keep Topbar rendering aware of location changes
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: shape({
    search: string.isRequired,
  }).isRequired,

  // from useIntl
  intl: intlShape.isRequired,

  // from useConfiguration
  config: object.isRequired,

  // from useRouteConfiguration
  routeConfiguration: arrayOf(propTypes.route).isRequired,
};

const Topbar = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  return (
    <TopbarComponent
      config={config}
      routeConfiguration={routeConfiguration}
      intl={intl}
      {...props}
    />
  );
};

export default Topbar;
