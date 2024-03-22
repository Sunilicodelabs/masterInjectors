import React from 'react';
import { arrayOf, bool, func, node, number, object, shape, string } from 'prop-types';
import classNames from 'classnames';
import { LinkedLogo, NamedLink } from '../../../../components';

import Field from '../../Field';
import BlockBuilder from '../../BlockBuilder';
import logoImg from "../../../../assets/logo-white.png"

import SectionContainer from '../SectionContainer';
import css from './SectionFooter.module.css';

// The number of columns (numberOfColumns) affects styling

const GRID_CONFIG = [
  { contentCss: css.contentCol1, gridCss: css.gridCol1 },
  { contentCss: css.contentCol2, gridCss: css.gridCol2 },
  { contentCss: css.contentCol3, gridCss: css.gridCol3 },
  { contentCss: css.contentCol4, gridCss: css.gridCol4 },
];
const MAX_MOBILE_SCREEN_WIDTH = 1024;

const getIndex = numberOfColumns => numberOfColumns - 1;

const getContentCss = numberOfColumns => {
  const contentConfig = GRID_CONFIG[getIndex(numberOfColumns)];
  return contentConfig ? contentConfig.contentCss : GRID_CONFIG[0].contentCss;
};

const getGridCss = numberOfColumns => {
  const contentConfig = GRID_CONFIG[getIndex(numberOfColumns)];
  return contentConfig ? contentConfig.gridCss : GRID_CONFIG[0].gridCss;
};

// Section component that's able to show blocks in multiple different columns (defined by "numberOfColumns" prop)
const SectionFooter = props => {
  const {
    sectionId,
    className,
    rootClassName,
    numberOfColumns,
    socialMediaLinks,
    slogan,
    appearance,
    copyright,
    blocks,
    options,
    linkLogoToExternalSite,
  } = props;

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };
  const linksWithBlockId = socialMediaLinks?.map(sml => {
    return {
      ...sml,
      blockId: sml.link.platform,
    };
  });

  const showSocialMediaLinks = socialMediaLinks?.length > 0;
  const hasMatchMedia = typeof window !== 'undefined' && window?.matchMedia;
  const isMobileLayout = hasMatchMedia
    ? window.matchMedia(`(max-width: ${MAX_MOBILE_SCREEN_WIDTH}px)`)?.matches
    : true;
  const logoLayout = isMobileLayout ? 'mobile' : 'desktop';

  // use block builder instead of mapping blocks manually
  var currentLocation = window.location;
  const isAuthPage = currentLocation?.pathname.includes("/login") || currentLocation?.pathname.includes("/signup") || currentLocation?.pathname.includes("/adminLogin")
  return (
    <SectionContainer
      as="footer"
      id={sectionId}
      className={classNames(className || css.root, isAuthPage && css.authPageFooter)}
      rootClassName={rootClassName}
      appearance={appearance}
      options={fieldOptions}
    >
      <div className={css.footer}>
        {isAuthPage ?
          <div className={css.footerRow}>

            <div>
              <NamedLink name="LandingPage">
                <img src={logoImg} alt='logo' />
              </NamedLink>
              <p className={css.pink}>Find & rent bikes in Finland.
                © Biketribe 2022.</p>
              <div>
                <svg width="130" height="24" viewBox="0 0 130 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity="0.07" d="M35 0H3C1.3 0 0 1.3 0 3V21C0 22.7 1.4 24 3 24H35C36.7 24 38 22.7 38 21V3C38 1.3 36.6 0 35 0Z" fill="black" />
                  <path d="M35 1C36.1 1 37 1.9 37 3V21C37 22.1 36.1 23 35 23H3C1.9 23 1 22.1 1 21V3C1 1.9 1.9 1 3 1H35Z" fill="white" />
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M5.3 8C5.2 8 5 8.1 5 8.2L5.1 8.4C5.3 8.4 6.4 8.6 7 8.9C7.4 9 7.7 9.3 7.9 9.5L9.5 15.7C9.5 15.9 9.6 15.9 9.7 15.9H11.2C11.2708 15.9 11.3417 15.9125 11.4081 15.9243C11.5292 15.9458 11.6354 15.9646 11.7 15.9C11.7618 15.8382 11.7854 15.7764 11.818 15.691C11.8382 15.6382 11.8618 15.5764 11.9 15.5L15 8.2C15.0575 8.1425 15.0819 8.11806 15.0923 8.08866C15.1 8.06693 15.1 8.0425 15.1 8H13C12.9 8 12.8 8.1 12.9 8.2L10.8 13.3C10.8 13.3 10.7 13.3 10.7 13.4C10.6 13.3 10.6 13.3 10.6 13.2L9.7 8.8C9.6 8.3 9.2 8 8.7 8H5.3ZM14.3 16C14.369 15.5172 14.3904 15.3674 14.4298 15.2225C14.4476 15.1573 14.469 15.0931 14.5 15L14.5 15C15 12.8 15.5 10.5 15.9 8.3C15.9184 8.2633 15.9333 8.22997 15.9468 8.2C16.0067 8.06667 16.0367 8 16.2 8H18C17.8 9.2 17.6 10.1 17.3 11.2C17 12.7 16.7 14.2 16.3 15.7C16.3 15.9 16.2 15.9 16 15.9L14.3 16ZM18.2 13.9L17.8 15.7C17.8431 15.7431 17.8677 15.7677 17.8896 15.7656C17.9186 15.7628 17.9431 15.7137 18 15.6C18.7122 15.8374 19.5495 15.8243 20.5617 15.8085C20.8287 15.8044 21.1078 15.8 21.4 15.8C22.0548 15.8 22.2721 15.625 22.7067 15.275L22.8 15.2C23.6 14.6 23.9 13.8 23.7 12.9C23.6 12.3 23.1 11.8 22.6 11.5C22.3 11.3 21.9 11.1 21.5 10.9L21.5 10.9L21 10.5C20.8 10.3 20.8 10 21 9.8C21.1 9.7 21.2 9.6 21.4 9.6C21.7 9.5 22 9.5 22.3 9.5C22.8 9.5 23.3 9.7 23.8 9.9C24 9.3 24.1 8.8 24.2 8.2H24.1C23.5 8 22.2 8 21 8C20.3801 8 20.0604 8.24016 19.6688 8.53439C19.555 8.61988 19.4351 8.70994 19.3 8.8C18.6 9.5 18.2 10.9 19.4 11.9C19.7 12.2 20.1 12.4 20.5 12.6C20.6183 12.6789 20.7367 12.7422 20.8489 12.8023C21.0211 12.8944 21.1789 12.9789 21.3 13.1C21.7 13.5 21.7 14 21.2 14.2C21 14.3 20.7 14.4 20.5 14.4C19.8 14.5 19.1 14.3 18.4 14C18.4 14 18.3 13.9 18.2 13.9ZM31.2 16H29.5C29.4575 16 29.4331 16 29.4113 15.9923C29.3819 15.9819 29.3575 15.9575 29.3 15.9L29.1 15L29 14.8H26.6C26.5 14.8 26.4 14.8 26.4 15L26.1 15.9C26.1 16 26 16 26 16H23.9L24.1 15.5L27 8.7C27 8.2 27.3 8 27.8 8H29.3C29.4 8 29.5 8 29.5 8.2L30.9 14.7C30.9171 14.7684 30.9342 14.8338 30.9508 14.8974L30.9509 14.8978L30.9509 14.898L30.951 14.8981C31.0314 15.2059 31.1 15.4686 31.1 15.8C31.2 15.9 31.2 15.9 31.2 16ZM28.3 10.1H28C27.9167 10.3083 27.8377 10.495 27.7621 10.6735L27.762 10.6738L27.7618 10.6743L27.7617 10.6744C27.4748 11.3523 27.2374 11.9131 27 13.1H28.9C28.7854 12.5271 28.7146 12.0708 28.6541 11.6812L28.6541 11.6812C28.5562 11.0507 28.4854 10.5944 28.3 10.1Z" fill="#142688" />
                  <path opacity="0.07" d="M81 0H49C47.3 0 46 1.3 46 3V21C46 22.7 47.4 24 49 24H81C82.7 24 84 22.7 84 21V3C84 1.3 82.6 0 81 0Z" fill="black" />
                  <path d="M81 1C82.1 1 83 1.9 83 3V21C83 22.1 82.1 23 81 23H49C47.9 23 47 22.1 47 21V3C47 1.9 47.9 1 49 1H81Z" fill="white" />
                  <circle cx="61" cy="12" r="7" fill="#EB001B" />
                  <circle cx="69" cy="12" r="7" fill="#F79E1B" />
                  <path d="M68 12C68 9.59999 66.8 7.49999 65 6.29999C63.2 7.59999 62 9.69999 62 12C62 14.3 63.2 16.5 65 17.7C66.8 16.5 68 14.4 68 12Z" fill="#FF5F00" />
                  <path opacity="0.07" d="M127 0H95C93.3 0 92 1.3 92 3V21C92 22.7 93.4 24 95 24H127C128.7 24 130 22.7 130 21V3C130 1.3 128.6 0 127 0Z" fill="black" />
                  <path d="M127 1C128.1 1 129 1.9 129 3V21C129 22.1 128.1 23 127 23H95C93.9 23 93 22.1 93 21V3C93 1.9 93.9 1 95 1H127Z" fill="#006FCF" />
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M106.978 8.006H102.983L102.716 8H99.286L96 15.68H99.911L100.406 14.49H101.536L102.03 15.68H118.94L120.065 14.49L121.143 15.68H125.977L122.494 11.852L126.013 8H121.25L120.135 9.19L119.057 8H108.687L107.865 9.941L106.978 8.006ZM117.046 10.346H114.069V11.173H116.998V12.412H114.075V13.334H117.052V14.073L119.129 11.828L117.052 9.488L117.046 10.346ZM100.971 10.268L101.745 12.144H100.203L100.971 10.268ZM111.646 9.084H109.407L107.907 12.62L106.282 9.084H104.06V13.894L102 9.084H100.007L97.625 14.596H99.18L99.674 13.406H102.27L102.764 14.596H105.484V10.661L107.235 14.602H108.425L110.165 10.673V14.603H111.623L111.647 9.083L111.646 9.084ZM123.517 9.084L120.986 11.852H120.987L123.499 14.602H121.624L120.076 12.864L118.462 14.602H112.652V9.084H118.546L120.094 10.81L121.695 9.084H123.517Z" fill="white" />
                </svg>

              </div>
              <p className={css.pink}>100% Secure Payments powered by Stripe.
              </p>
            </div>
            <div>
              <h5>Categories</h5>
              <ul>
                <li>
                  Mountain bikes
                </li>
                <li>
                  Hybrid bikes
                </li>
                <li>
                  Road bikes
                </li>
                <li>
                  Gravel bikes
                </li>
                <li>
                  City bikes
                </li>
                <li>
                  Kids bikes
                </li>
              </ul>
            </div>
            <div>
              <h5>Locations</h5>
              <ul>
                <li>
                  Helsinki

                </li>
                <li>
                  Espoo Vantaa
                </li>
                <li>
                  Turku Tampere
                </li>
                <li>
                  Kuopio Jyväskylä
                </li>
                <li>
                  Rovaniemi Oulu
                </li>
                <li>
                  Äkäslompolo
                </li>
              </ul>
            </div>
            <div>
              <h5>List your bike </h5>
              <ul>
                <li>
                  Add your bike
                </li>
                <li>
                  How to list a bike
                </li>
                <li>
                  Getting paid
                </li>
                <li>
                  FAQ
                </li>
              </ul>
            </div>
            <div>
              <h5>Rent a bike</h5>
              <ul>
                <li>
                  Find a bike

                </li>
                <li>
                  How to rent a bike

                </li>
                <li>
                  Payment

                </li>
                <li>
                  FAQ
                </li>

              </ul>
            </div>
            <div>
              <h5>Company</h5>
              <ul>
                <li>
                  About us
                </li>
                <li>
                  Contact
                </li>
                <li>
                  Terms
                </li>
                <li>
                  Privacy
                </li>
              </ul>
              <h5>Follow us</h5>
              <ul>
                <li>
                  Facebook
                </li>
                <li>
                  Instagram
                </li>
                <li>
                  LinkedIn
                </li>
              </ul>
            </div>

          </div> : <div className={classNames(css.content, getContentCss(numberOfColumns))}>
            <div>
              {/* <LinkedLogo
              rootClassName={css.logoLink}
              logoClassName={css.logoWrapper}
              logoImageClassName={css.logoImage}
              linkToExternalSite={linkLogoToExternalSite}
              layout={logoLayout}
            /> */}
              <NamedLink name="LandingPage">
                <img src={logoImg} alt='logo' />
              </NamedLink>
            </div>
            <div className={css.sloganMobile}>
              <Field data={slogan} className={css.slogan} />
            </div>
            <div className={css.detailsInfo}>
              <div className={css.sloganDesktop}>
                <Field data={slogan} className={css.slogan} />
              </div>
              {showSocialMediaLinks ? (
                <div className={css.icons}>
                  <BlockBuilder blocks={linksWithBlockId} sectionId={sectionId} options={options} />
                </div>
              ) : null}
              <Field data={copyright} className={css.copyright} />
            </div>
            <div className={classNames(css.grid, getGridCss(numberOfColumns))}>
              <BlockBuilder blocks={blocks} sectionId={sectionId} options={options} />
            </div>
          </div>}
      </div>
    </SectionContainer>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

SectionFooter.defaultProps = {
  className: null,
  rootClassName: null,
  textClassName: null,
  numberOfColumns: 1,
  socialMediaLinks: [],
  slogan: null,
  copyright: null,
  appearance: null,
  blocks: [],
  options: null,
};

SectionFooter.propTypes = {
  sectionId: string.isRequired,
  className: string,
  rootClassName: string,
  numberOfColumns: number,
  socialMediaLinks: arrayOf(object),
  slogan: object,
  copyright: object,
  appearance: object,
  blocks: arrayOf(object),
  options: propTypeOption,
};

export default SectionFooter;
