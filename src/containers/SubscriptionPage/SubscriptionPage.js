import React, { Component } from 'react';

import { FormattedMessage, } from '../../util/reactIntl';

import { Heading, Page, LayoutSingleColumn, NamedLink } from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import css from './SubscriptionPage.module.css';

export class SubscriptionPage extends Component {
    constructor(props) {
        super(props);
        // The StaticRouter component used in server side rendering
        // provides the context object. We attach a `notfound` flag to
        // the context to tell the server to change the response status
        // code into a 404.

    }

    render() {
        const {
            scrollingDisabled,
        } = this.props;

        const title = ""


        return (
            <Page title={title} scrollingDisabled={scrollingDisabled}>
                <LayoutSingleColumn topbar={<TopbarContainer />} footer={<FooterContainer />}>
                    <div className={css.root}>
                        <div className={css.content}>
                            <h4 className={css.title}><FormattedMessage id='SubscriptionPage.title' /></h4>
                            <h3 className={css.description}><FormattedMessage id='SubscriptionPage.Subtitle' />

                            </h3>

                            <div className={css.cardConatiner}>
                                <div className={css.card}>
                                    <div className={css.cardInner}>
                                        <h4 className={css.cardTitle}>Injector Membership
                                        </h4>
                                        <h3 className={css.cardPriceM}>$250 Monthly
                                        </h3>
                                        <h5 className={css.cardPriceA}>or $2500 annually
                                        </h5>
                                        <hr/>
                                        <div>
                                            <p className={css.whatNew}>
                                                <em><FormattedMessage id='SubscriptionPage.WhatsIncluded' /></em>
                                            </p>

                                            <ul >
                                                <li>
                                                    This benefit is included in the package

                                                </li>
                                                <li>
                                                    This benefit is also included in the package

                                                </li>
                                                <li>
                                                    This benefit too

                                                </li>
                                                <li>
                                                    Don’t forget this one! It’s important.

                                                </li>
                                                <li>
                                                    This is clearly the best one.

                                                </li>
                                            </ul>
                                        </div>
                                        <NamedLink name="LandingPage"   className={css.memberBtn}><FormattedMessage id='SubscriptionPage.cta' /></NamedLink>

                                    </div>

                                </div>
                                <div className={css.card}>
                                    <div className={css.cardInner}>
                                        <h4 className={css.cardTitle}>Nurse Injector Membership
                                        </h4>
                                        <h3 className={css.cardPriceM}>$375 Monthly
                                        </h3>
                                        <h5 className={css.cardPriceA}>or $4000 annually
                                        </h5>
                                        <hr/>
                                        <div>
                                            <p className={css.whatNew}>
                                                <em>What’s Included</em>
                                            </p>

                                            <ul >
                                                <li>
                                                    This benefit is included in the package

                                                </li>
                                                <li>
                                                    This benefit is also included in the package

                                                </li>
                                                <li>
                                                    This benefit too

                                                </li>
                                                <li>
                                                    Don’t forget this one! It’s important.

                                                </li>
                                                <li>
                                                    This is clearly the best one.

                                                </li>
                                            </ul>
                                        </div>
                                        <NamedLink name="LandingPage"   className={css.memberBtn}><FormattedMessage id='SubscriptionPage.cta' /></NamedLink>

                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </LayoutSingleColumn>
            </Page>
        );
    }
}


export default SubscriptionPage;
