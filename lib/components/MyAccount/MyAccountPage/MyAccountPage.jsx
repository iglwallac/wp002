import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectRedux } from 'react-redux'
import _get from 'lodash/get'
import _startsWith from 'lodash/startsWith'
import _endsWith from 'lodash/endsWith'
import { List } from 'immutable'
import { getPrimary } from 'services/languages'
import { get as getConfig } from 'config'
import Support from 'components/Support'
import { isEntitled } from 'services/subscription'
import MyAccountMessages, { top, bottom } from 'components/MyAccount/MyAccountMessages'
import { TYPE_LOGIN } from 'services/dialog'
import MyAccountDetails from 'components/MyAccount/MyAccountDetails'
import { getBoundActions } from 'actions'
import _parseInt from 'lodash/parseInt'
import Icon from 'components/Icon'
import { H2, H3 } from 'components/Heading'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import VerticalNavigation, { ACCOUNT } from 'components/VerticalNavigation'
import {
  format as formatDateTime,
  getDateTime,
} from 'services/date-time'
import {
  URL_APPLE_ITUNES_MANAGE_SUBSCRIPTION,
  URL_ROKU_MANAGE_SUBSCRIPTION,
  URL_PLAN_SELECTION,
  URL_PAYPAL_RECURRING_MANAGE_SUBSCRIPTION,
  URL_ANDROID_PAY_MANAGE_SUBSCRIPTION,
  URL_AMAZON_MANAGE_SUBSCRIPTION,
  URL_FMTV_HELP_DESK,
  URL_HELP_CENTER,
} from 'services/url/constants'
import {
  getEmailCustomerServiceUrl,
} from 'services/url'
import Link, { TARGET_BLANK } from 'components/Link'
import {
  ACCOUNT_TYPE_DEFAULT,
  ACCOUNT_TYPE_ITUNES,
  ACCOUNT_TYPE_ROKU,
  ACCOUNT_TYPE_AMAZON,
  ACCOUNT_TYPE_GCSI,
  ACCOUNT_TYPE_ZUORA,
  ACCOUNT_TYPE_ANDROID_PAY,
  ACCOUNT_TYPE_SECONDARY_PROFILE,
  ACCOUNT_TYPE_TRIAL,
  ACCOUNT_TYPE_PAYPAL_RECURRING,
  ACCOUNT_TYPE_FMTV_ROKU,
  ACCOUNT_TYPE_FMTV_ITUNES,
  ACCOUNT_TYPE_FMTV_PAYPAL,
  ACCOUNT_TYPE_FMTV_ANDROID,
  ACCOUNT_TYPE_FMTV_COMP,
  ACCOUNT_TYPE_FMTV_GIFT,
  ACCOUNT_TYPE_FMTV,
  USER_ACCOUNT_CANCELLED,
  hasScheduledOrActivePause,
} from 'services/user-account'

const config = getConfig()

// -------------------- MY ACCOUNT V2 -----------------------

const renderCustomerServiceLink = (props) => {
  const { staticText } = props
  const currentDate = new Date()
  const currentDateTimeStamp = getDateTime(currentDate)
  const januaryFirst2020TimeStamp = 1577836801000
  const switchOverDate = currentDateTimeStamp > januaryFirst2020TimeStamp

  return (
    <div className="my-account-V2__customer-service">
      <p className="my-account-V2__customer-service--text">
        {staticText.getIn(['data', 'contactCustomerService'])}
        <span className="my-account-V2__customer-service--link">
          {
            switchOverDate ?
              <Link
                to={URL_HELP_CENTER}
                target={TARGET_BLANK}
                className="my-account-V2__rejoin-link--text"
              >
                {` ${staticText.getIn(['data', 'pleaseClickHere'])}`}
              </Link> :
              <Link
                to={URL_FMTV_HELP_DESK}
                target={TARGET_BLANK}
                className="my-account-V2__rejoin-link--text"
              >
                {` ${staticText.getIn(['data', 'pleaseClickHere'])}`}
              </Link>
          }
        </span>
      </p>
    </div>
  )
}

const renderSecondaryProfile = (props) => {
  // renderSecondaryProfile is used for both current ops AND V2
  const { staticText } = props
  return (
    <div className="my-account-V2__content">
      <H2 className="my-account-V2__title">{staticText.getIn(['data', 'yourPlan'])}</H2>
      <p className="my-account-V2__child-profile-body1">{staticText.getIn(['data', 'childProfile1'])}</p>
      <p className="my-account-V2__child-profile-body2">{staticText.getIn(['data', 'childProfile2'])}</p>
    </div>
  )
}

const renderFreeTrial = (props) => {
  const { auth, user, staticText, userAccount, history, location } = props
  const scheduledOrActivePause = hasScheduledOrActivePause(userAccount)

  return (
    <div className="my-account-V2__content">
      <MyAccountMessages
        userAccount={userAccount}
        region={top}
        scheduledOrActivePause={scheduledOrActivePause}
      />
      <H2 className="my-account-V2__title">{staticText.getIn(['data', 'yourPlan'])}</H2>
      <MyAccountDetails
        auth={auth}
        userAccount={userAccount}
        user={user}
        history={history}
        location={location}
      />
    </div>
  )
}

const renderFmtv = (props) => {
  const { staticText, userAccount } = props
  const currentDate = new Date()
  const scheduledOrActivePause = hasScheduledOrActivePause(userAccount)
  const currentDateTimeStamp = getDateTime(currentDate)
  const billingAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
  const fmtvBillingMigrationCompletionDate = _get(config, ['features', 'userAccount', 'fmtvMigrationDate'])

  if (!billingAccountId && (currentDateTimeStamp >= fmtvBillingMigrationCompletionDate)) {
    return (
      <div className="my-account-V2__content">
        <H2 className="my-account-V2__title">{staticText.getIn(['data', 'yourPlan'])}</H2>
        <div className="my-account-V2__rejoin">
          <div className="my-account-V2__rejoin-text">
            <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeBack']) }</span>
            <p className="my-account-V2__rejoin-text-rejoin">{ staticText.getIn(['data', 'rejoin']) }</p>
          </div>
          <div className="my-account-V2__rejoin-link">
            <Link
              to={URL_PLAN_SELECTION}
              className="my-account-V2__rejoin-link--text"
            >
              { staticText.getIn(['data', 'reactivate']) }
            </Link>
            <Icon
              iconClass={[
                'my-account-V2__arrow-right',
                'icon--right',
                'icon--action',
              ]}
            />
          </div>
        </div>
        <MyAccountMessages
          userAccount={userAccount}
          region={bottom}
          scheduledOrActivePause={scheduledOrActivePause}
        />
        { renderCustomerServiceLink(props) }
      </div>
    )
  }

  return (
    <div className="my-account-V2__content">
      <H2 className="my-account-V2__title">{staticText.getIn(['data', 'yourPlan'])}</H2>
      <div className="my-account-V2__rejoin">
        <div className="my-account-V2__rejoin-text">
          <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeToGaia']) }</span>
          <p className="my-account-V2__rejoin-text-rejoin">{ staticText.getIn(['data', 'accountTransferred']) }</p>
        </div>
      </div>
      { renderCustomerServiceLink(props) }
    </div>
  )
}

const renderFmtvGift = (props) => {
  const { staticText, page, user } = props
  const entitlementEnd = parseInt(user.getIn(['data', 'userEntitlements', 'end']), 10) * 1000
  const locale = page.get('locale')
  const dateFormatString = _endsWith(locale, 'US') ? 'M/D/YY' : 'YY/M/D'
  const formattedEndDate = formatDateTime(entitlementEnd, locale, dateFormatString)

  return (
    <div className="my-account-V2__content">
      <H2 className="my-account-V2__title">{staticText.getIn(['data', 'yourPlan'])}</H2>
      <div className="my-account-V2__rejoin">
        <div className="my-account-V2__rejoin-text">
          <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeToGaia']) }</span>
          <p className="my-account-V2__alternate-body--upper">{ staticText.getIn(['data', 'fmtvGiftBody1']) }<span>{` ${formattedEndDate}.`}</span></p>
          <p className="my-account-V2__alternate-body--lower">{ staticText.getIn(['data', 'continueEnjoying']) }</p>
        </div>
        <div className="my-account-V2__rejoin-link">
          <Link
            to={URL_PLAN_SELECTION}
            className="my-account-V2__rejoin-link--text"
          >
            { staticText.getIn(['data', 'choosePlan']) }
          </Link>
          <Icon
            iconClass={[
              'my-account-V2__arrow-right',
              'icon--right',
              'icon--action',
            ]}
          />
        </div>
      </div>
      { renderCustomerServiceLink(props) }
    </div>
  )
}

const renderFmtvComp = (props) => {
  const { staticText, page, user } = props
  const entitlementEnd = parseInt(user.getIn(['data', 'userEntitlements', 'end']), 10) * 1000
  const locale = page.get('locale')
  const dateFormatString = _endsWith(locale, 'US') ? 'M/D/YY' : 'YY/M/D'
  const formattedEndDate = formatDateTime(entitlementEnd, locale, dateFormatString)

  return (
    <div className="my-account-V2__content">
      <H2 className="my-account-V2__title">{staticText.getIn(['data', 'yourPlan'])}</H2>
      <div className="my-account-V2__rejoin">
        <div className="my-account-V2__rejoin-text">
          <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeToGaia']) }</span>
          <p className="my-account-V2__alternate-body--upper">{ staticText.getIn(['data', 'fmtvGiftBody1']) }<span>{` ${formattedEndDate}.`}</span></p>
          <p className="my-account-V2__alternate-body--lower">{ staticText.getIn(['data', 'continueEnjoying']) }</p>
        </div>
        <div className="my-account-V2__rejoin-link">
          <Link
            to={URL_PLAN_SELECTION}
            className="my-account-V2__rejoin-link--text"
          >
            { staticText.getIn(['data', 'choosePlan']) }
          </Link>
          <Icon
            iconClass={[
              'my-account-V2__arrow-right',
              'icon--right',
              'icon--action',
            ]}
          />
        </div>
      </div>
      { renderCustomerServiceLink(props) }
    </div>
  )
}

const renderPaypalRecurring = (props) => {
  const { staticText, auth, user } = props
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  return (
    <div className="my-account-V2__content">
      <H2 className="my-account-V2__title">{staticText.getIn(['data', 'yourPlan'])}</H2>
      <div className="my-account-V2__rejoin">
        {
          userIsEntitled ?
            <React.Fragment>
              <div className="my-account-V2__rejoin-text">
                <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeToGaia']) }</span>
                <p className="my-account-V2__alternate-body--upper">{ staticText.getIn(['data', 'paypalRecurringBody1']) }</p>
                <p className="my-account-V2__alternate-body--lower">
                  { staticText.getIn(['data', 'paypalRecurringBody2']) } { staticText.getIn(['data', 'paypalRecurringBody3']) }
                  <Link
                    to={getEmailCustomerServiceUrl(userLanguage)}
                    target={TARGET_BLANK}
                    className="my-account-V2__alternate-link--text"
                  > {staticText.getIn(['data', 'customerSupport'])} </Link> { staticText.getIn(['data', 'team']) }
                </p>
              </div>
              <div className="my-account-V2__rejoin-link">
                <Link
                  to={URL_PAYPAL_RECURRING_MANAGE_SUBSCRIPTION}
                  target={TARGET_BLANK}
                  className="my-account-V2__alternate-link--text"
                >
                  { staticText.getIn(['data', 'manageInPaypal']) }
                </Link>
                <Icon
                  iconClass={[
                    'my-account-V2__arrow-right',
                    'icon--right',
                    'icon--action',
                  ]}
                />
              </div>
            </React.Fragment> :
            <React.Fragment>
              <div className="my-account-V2__rejoin-text">
                <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeToGaia']) }</span>
                <p className="my-account-V2__alternate-body--upper">{ staticText.getIn(['data', 'fmtvGiftBody2']) }</p>
              </div>
              <div className="my-account-V2__rejoin-link">
                <Link
                  to={URL_PLAN_SELECTION}
                  className="my-account-V2__rejoin-link--text"
                >
                  { staticText.getIn(['data', 'reactivate']) }
                </Link>
                <Icon
                  iconClass={[
                    'my-account-V2__arrow-right',
                    'icon--right',
                    'icon--action',
                  ]}
                />
              </div>
            </React.Fragment>
        }
      </div>
    </div>
  )
}

const renderAndroidPay = (props) => {
  const { staticText, auth, user } = props
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  return (
    <div className="my-account-V2__content">
      <H2 className="my-account-V2__title">{staticText.getIn(['data', 'yourPlan'])}</H2>
      <div className="my-account-V2__rejoin">
        {
          userIsEntitled ?
            <React.Fragment>
              <div className="my-account-V2__rejoin-text">
                <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeToGaia']) }</span>
                <p className="my-account-V2__alternate-body--upper">{ staticText.getIn(['data', 'androidPayBody1']) }</p>
                <p className="my-account-V2__alternate-body--lower">
                  { staticText.getIn(['data', 'androidPayBody2']) } { staticText.getIn(['data', 'androidPayBody3']) }
                  <Link
                    to={getEmailCustomerServiceUrl(userLanguage)}
                    target={TARGET_BLANK}
                    className="my-account-V2__alternate-link--text"
                  > {staticText.getIn(['data', 'customerSupport'])} </Link> { staticText.getIn(['data', 'team']) }
                </p>
              </div>
              <div className="my-account-V2__rejoin-link">
                <Link
                  to={URL_ANDROID_PAY_MANAGE_SUBSCRIPTION}
                  target={TARGET_BLANK}
                  className="my-account-V2__alternate-link--text"
                >
                  { staticText.getIn(['data', 'manageInAndroidPay']) }
                </Link>
                <Icon
                  iconClass={[
                    'my-account-V2__arrow-right',
                    'icon--right',
                    'icon--action',
                  ]}
                />
              </div>
            </React.Fragment> :
            <React.Fragment>
              <div className="my-account-V2__rejoin-text">
                <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeToGaia']) }</span>
                <p className="my-account-V2__alternate-body--upper">{ staticText.getIn(['data', 'fmtvGiftBody2']) }</p>
              </div>
              <div className="my-account-V2__rejoin-link">
                <Link
                  to={URL_PLAN_SELECTION}
                  className="my-account-V2__rejoin-link--text"
                >
                  { staticText.getIn(['data', 'reactivate']) }
                </Link>
                <Icon
                  iconClass={[
                    'my-account-V2__arrow-right',
                    'icon--right',
                    'icon--action',
                  ]}
                />
              </div>
            </React.Fragment>
        }
      </div>
    </div>
  )
}

const renderDefaultV2 = (props) => {
  const { userAccount, auth, user, staticText, history, location } = props
  const scheduledOrActivePause = hasScheduledOrActivePause(userAccount)
  const userAccountDetails = userAccount.getIn(['details', 'data', 'billing', 'subscriptions'])
  const billingAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
  const creationSource = user.getIn(['data', 'creation_source'])
  const creationSourceFMTV = _startsWith(creationSource, ACCOUNT_TYPE_FMTV, 0)

  if (!billingAccountId && creationSourceFMTV) {
    return (
      <div className="my-account-V2__content">
        <H2 className="my-account-V2__title">{staticText.getIn(['data', 'yourPlan'])}</H2>
        <div className="my-account-V2__rejoin">
          <div className="my-account-V2__rejoin-text">
            <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeBack']) }</span>
            <p className="my-account-V2__rejoin-text-rejoin">{ staticText.getIn(['data', 'rejoin']) }</p>
          </div>
          <div className="my-account-V2__rejoin-link">
            <Link
              to={URL_PLAN_SELECTION}
              className="my-account-V2__rejoin-link--text"
            >
              { staticText.getIn(['data', 'reactivate']) }
            </Link>
            <Icon
              iconClass={[
                'my-account-V2__arrow-right',
                'icon--right',
                'icon--action',
              ]}
            />
          </div>
        </div>
      </div>
    )
  } else if (!billingAccountId) {
    return (
      <div className="my-account-V2__content">
        <H2 className="my-account-V2__title">{staticText.getIn(['data', 'yourPlan'])}</H2>
        <div className="my-account-V2__rejoin">
          <div className="my-account-V2__rejoin-text">
            <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeBack']) }</span>
            <p className="my-account-V2__rejoin-text-rejoin">{ staticText.getIn(['data', 'rejoin']) }</p>
          </div>
          <div className="my-account-V2__rejoin-link">
            <Link
              to={URL_PLAN_SELECTION}
              className="my-account-V2__rejoin-link--text"
            >
              { staticText.getIn(['data', 'reactivate']) }
            </Link>
            <Icon
              iconClass={[
                'my-account-V2__arrow-right',
                'icon--right',
                'icon--action',
              ]}
            />
          </div>
        </div>
      </div>
    )
  } else if (userAccountDetails) {
    return (
      <div className="my-account-V2__content">
        <MyAccountMessages
          userAccount={userAccount}
          region={top}
          scheduledOrActivePause={scheduledOrActivePause}
        />
        <H2 className="my-account-V2__title">{staticText.getIn(['data', 'yourPlan'])}</H2>
        <MyAccountDetails
          auth={auth}
          userAccount={userAccount}
          user={user}
          history={history}
          location={location}
        />
      </div>
    )
  }
  return (
    <div className="my-account-V2__content">
      <H2 className="my-account-V2__title">{staticText.getIn(['data', 'yourPlan'])}</H2>
      { staticText.getIn(['data', 'genericLink']) }
    </div>
  )
}

export const renderItunesV2 = (props) => {
  const { staticText, auth, user } = props
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  return (
    <div className="my-account-V2__alternate-container">
      {
        userIsEntitled ?
          <React.Fragment>
            <div className="my-account-V2__alternate-desription">
              <H2>{staticText.getIn(['data', 'yourPlan'])}</H2>
              <H3 className="my-account-V2__alternate-title">{ staticText.getIn(['data', 'itunesTitle']) }</H3>
              <p className="my-account-V2__alternate-body--upper">{ staticText.getIn(['data', 'itunesBody1']) }</p>
              <p className="my-account-V2__alternate-body--lower">
                { staticText.getIn(['data', 'itunesBody2']) } { staticText.getIn(['data', 'itunesBody3']) }
                <Link
                  to={getEmailCustomerServiceUrl(userLanguage)}
                  target={TARGET_BLANK}
                  className="my-account-V2__alternate-link--text"
                > {staticText.getIn(['data', 'customerSupport'])} </Link> { staticText.getIn(['data', 'team']) }
              </p>
            </div>
            <div className="my-account-V2__alternate-link">
              <Link
                to={URL_APPLE_ITUNES_MANAGE_SUBSCRIPTION}
                target={TARGET_BLANK}
                className="my-account-V2__alternate-link--text"
              >
                { staticText.getIn(['data', 'itunesLink']) }
              </Link>
              <Icon
                iconClass={[
                  'my-account-V2__arrow-right',
                  'icon--right',
                  'icon--action',
                ]}
              />
            </div>
          </React.Fragment> :
          <React.Fragment>
            <div className="my-account-V2__rejoin-text">
              <H2>{staticText.getIn(['data', 'yourPlan'])}</H2>
              <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeToGaia']) }</span>
              <p className="my-account-V2__alternate-body--lower">{ staticText.getIn(['data', 'fmtvGiftBody2']) }</p>
            </div>
            <div className="my-account-V2__rejoin-link">
              <Link
                to={URL_PLAN_SELECTION}
                className="my-account-V2__rejoin-link--text"
              >
                { staticText.getIn(['data', 'reactivate']) }
              </Link>
              <Icon
                iconClass={[
                  'my-account-V2__arrow-right',
                  'icon--right',
                  'icon--action',
                ]}
              />
            </div>
          </React.Fragment>
      }
    </div>
  )
}

export const renderRokuV2 = (props) => {
  const { staticText, auth, user } = props
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  return (
    <div className="my-account-V2__alternate-container">
      {
        userIsEntitled ?
          <React.Fragment>
            <div className="my-account-V2__alternate-desription">
              <H2 className="my-account-V2__alternate-title--plan">{ staticText.getIn(['data', 'yourPlan'])}</H2>
              <H3 className="my-account-V2__alternate-title">{ staticText.getIn(['data', 'rokuTitle']) }</H3>
              <p className="my-account-V2__alternate-body--upper">{ staticText.getIn(['data', 'rokuBody1']) }</p>
              <p className="my-account-V2__alternate-body--lower">
                { staticText.getIn(['data', 'rokuBody2']) } { staticText.getIn(['data', 'rokuBody3']) }
                <Link
                  to={getEmailCustomerServiceUrl(userLanguage)}
                  target={TARGET_BLANK}
                  className="my-account-V2__alternate-link--text"
                > {staticText.getIn(['data', 'customerSupport'])} </Link> { staticText.getIn(['data', 'team']) }
              </p>
            </div>
            <div className="my-account-V2__alternate-link">
              <Link
                to={URL_ROKU_MANAGE_SUBSCRIPTION}
                target={TARGET_BLANK}
                className="my-account-V2__alternate-link--text"
              >
                { staticText.getIn(['data', 'rokuLink']) }
              </Link>
              <Icon
                iconClass={[
                  'my-account-V2__arrow-right',
                  'icon--right',
                  'icon--action',
                ]}
              />
            </div>
          </React.Fragment> :
          <React.Fragment>
            <div className="my-account-V2__rejoin-text">
              <H2 className="my-account-V2__alternate-title--plan">{ staticText.getIn(['data', 'yourPlan'])}</H2>
              <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeToGaia']) }</span>
              <p className="my-account-V2__alternate-body--lower">{ staticText.getIn(['data', 'fmtvGiftBody2']) }</p>
            </div>
            <div className="my-account-V2__rejoin-link">
              <Link
                to={URL_PLAN_SELECTION}
                className="my-account-V2__rejoin-link--text"
              >
                { staticText.getIn(['data', 'reactivate']) }
              </Link>
              <Icon
                iconClass={[
                  'my-account-V2__arrow-right',
                  'icon--right',
                  'icon--action',
                ]}
              />
            </div>
          </React.Fragment>
      }
    </div>
  )
}

export const renderAmazon = (props) => {
  const { staticText, auth, user } = props
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  return (
    <div className="my-account-V2__alternate-container">
      {
        userIsEntitled ?
          <React.Fragment>
            <div className="my-account-V2__alternate-desription">
              <H2>
                {staticText.getIn(['data', 'yourPlan'])}
              </H2>
              <H3 className="my-account-V2__alternate-title">
                { staticText.getIn(['data', 'amazonTitle']) }
              </H3>
              <p className="my-account-V2__alternate-body--upper">
                { staticText.getIn(['data', 'amazonBody1']) }
              </p>
              <p className="my-account-V2__alternate-body--lower">
                { staticText.getIn(['data', 'amazonBody2']) }
                <Link
                  to={getEmailCustomerServiceUrl(userLanguage)}
                  target={TARGET_BLANK}
                  className="my-account-V2__alternate-link--text"
                > {staticText.getIn(['data', 'customerSupport'])} </Link> { staticText.getIn(['data', 'team']) }
              </p>
            </div>
            <div className="my-account-V2__alternate-link">
              <Link
                to={URL_AMAZON_MANAGE_SUBSCRIPTION}
                target={TARGET_BLANK}
                className="my-account-V2__alternate-link--text"
              >
                { staticText.getIn(['data', 'amazonLink']) }
              </Link>
              <Icon
                iconClass={[
                  'my-account-V2__arrow-right',
                  'icon--right',
                  'icon--action',
                ]}
              />
            </div>
          </React.Fragment> :
          <React.Fragment>
            <div className="my-account-V2__rejoin-text">
              <H2>{staticText.getIn(['data', 'yourPlan'])}</H2>
              <span className="my-account-V2__rejoin-text-welcome">{ staticText.getIn(['data', 'welcomeToGaia']) }</span>
              <p className="my-account-V2__alternate-body--lower">{ staticText.getIn(['data', 'fmtvGiftBody2']) }</p>
            </div>
            <div className="my-account-V2__rejoin-link">
              <Link
                to={URL_PLAN_SELECTION}
                className="my-account-V2__rejoin-link--text"
              >
                { staticText.getIn(['data', 'reactivate']) }
              </Link>
              <Icon
                iconClass={[
                  'my-account-V2__arrow-right',
                  'icon--right',
                  'icon--action',
                ]}
              />
            </div>
          </React.Fragment>
      }
    </div>
  )
}

function isPrimaryAccountProfile (props) {
  const { auth, userProfiles } = props
  const primaryAccountUid = userProfiles.getIn(['data', 0, 'uid'])
  const currentProfileUid = auth.getIn(['uid'])
  if (_parseInt(primaryAccountUid, 10) === _parseInt(currentProfileUid, 10)) {
    return true
  }
  return false
}

class MyAccountPage extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    const {
      auth,
      user,
      userAccount,
      setOverlayDialogVisible,
      setDialogOptions,
      setOverlayCloseOnClick,
    } = this.props
    const isLoggedIn = !!auth.get('jwt')
    // if user isn't logged on or the feature toggle is turned off
    if (!isLoggedIn) {
      setOverlayDialogVisible(TYPE_LOGIN)
      setDialogOptions(null, true)
      setOverlayCloseOnClick(false)
    }

    const billingAccount = user.getIn(['data', 'gcsi_user_uuid'])
    const planType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'planType'])

    if (billingAccount && planType) {
      this.setAccountType(ACCOUNT_TYPE_DEFAULT)
    }
  }

  componentWillReceiveProps (nextProps) {
    const {
      user,
      auth,
      paytrack,
      userAccount,
      getUserAccountDataBillingSubscriptionsWithDetails,
    } = nextProps
    const billingAccount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
    const billingAccountStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
    const isLoggedIn = !!auth.get('jwt')
    const alternatePayment = paytrack.getIn(['lastTransaction', 'provider_name'])
    const billingSubscriptionsProcessing = userAccount.get('billingSubscriptionsProcessing')
    const userAccountDetails = userAccount.get('details')
    const isPrimaryProfile = isPrimaryAccountProfile(nextProps)
    const isFreeTrial = user.getIn(['data', 'freeTrialNoBillingInfo', 'ratePlanId'])
    const creationSource = user.getIn(['data', 'creation_source'])
    const creationSourceFMTV = _startsWith(creationSource, ACCOUNT_TYPE_FMTV, 0)
    const creationSourceAmazon = _startsWith(creationSource, ACCOUNT_TYPE_AMAZON, 0)
    const userIsEntitled = isEntitled(auth.get('subscriptions', List()))

    // load subscription data with details if it hasn't been loaded already
    // check what type of account user has
    if (isLoggedIn && !billingSubscriptionsProcessing && !userAccountDetails) {
      getUserAccountDataBillingSubscriptionsWithDetails({ auth })
    }
    if (!billingAccount && isFreeTrial) {
      this.setAccountType(ACCOUNT_TYPE_TRIAL)
    } else if (!isPrimaryProfile) {
      this.setAccountType(ACCOUNT_TYPE_SECONDARY_PROFILE)
    } else if (
      isLoggedIn &&
      userIsEntitled &&
      billingAccountStatus === USER_ACCOUNT_CANCELLED &&
      (alternatePayment === ACCOUNT_TYPE_ITUNES || alternatePayment === ACCOUNT_TYPE_ROKU)
    ) {
      this.setAccountType(alternatePayment)
    } else if (creationSourceAmazon || alternatePayment === ACCOUNT_TYPE_AMAZON) {
      this.setAccountType(ACCOUNT_TYPE_AMAZON)
    } else if (billingAccount && isLoggedIn) {
      this.setAccountType(ACCOUNT_TYPE_DEFAULT)
    } else if (isLoggedIn && !billingAccount && creationSourceFMTV) {
      this.setFmtv(creationSource)
    } else if (isLoggedIn && alternatePayment && !billingAccount) {
      this.setAccountType(alternatePayment)
    } else if (isLoggedIn && !billingAccount && !alternatePayment) {
      this.setAccountType(ACCOUNT_TYPE_DEFAULT)
    }
  }

  setAccountType = (account) => {
    this.setState(() => ({ accountType: account }))
  }

  setFmtv = (creationSource) => {
    switch (creationSource) {
      case ACCOUNT_TYPE_FMTV_ITUNES:
        return (
          this.setAccountType(ACCOUNT_TYPE_ITUNES)
        )
      case ACCOUNT_TYPE_FMTV_ROKU:
        return (
          this.setAccountType(ACCOUNT_TYPE_ROKU)
        )
      case ACCOUNT_TYPE_FMTV_PAYPAL:
        return (
          this.setAccountType(ACCOUNT_TYPE_PAYPAL_RECURRING)
        )
      case ACCOUNT_TYPE_FMTV_ANDROID:
        return (
          this.setAccountType(ACCOUNT_TYPE_ANDROID_PAY)
        )
      case ACCOUNT_TYPE_FMTV_COMP:
        return (
          this.setAccountType(ACCOUNT_TYPE_FMTV_COMP)
        )
      case ACCOUNT_TYPE_FMTV_GIFT:
        return (
          this.setAccountType(ACCOUNT_TYPE_FMTV_GIFT)
        )
      default:
        return (
          this.setAccountType(ACCOUNT_TYPE_FMTV)
        )
    }
  }

  render () {
    const props = this.props
    const state = this.state
    const { userAccount, paytrack, location } = props
    const userAccountProcessing = userAccount.get('billingSubscriptionsProcessing')
    const userAccountDetails = userAccount.getIn(['details', 'data', 'billing', 'subscriptions'])
    const paytrackProcessing = paytrack.get('processing')
    const paymentsProcessing = userAccount.get('billingSubscriptionPaymentsProcessing')

    if (userAccountProcessing || paytrackProcessing || paymentsProcessing || !userAccountDetails) {
      return (
        <div className="my-account-page__placeholder">
          <Sherpa className={['my-account-page__sherpa']} type={TYPE_SMALL_BLUE} />
        </div>
      )
    }

    return (
      <div>
        <div className="my-account__grid">
          <VerticalNavigation location={location} navType={ACCOUNT} />
          <div className="my-account my-account__content-box my-account-V2">
            { state.accountType === ACCOUNT_TYPE_PAYPAL_RECURRING ?
              renderPaypalRecurring(props) : null
            }
            { state.accountType === ACCOUNT_TYPE_ANDROID_PAY ?
              renderAndroidPay(props) : null
            }
            { state.accountType === ACCOUNT_TYPE_FMTV ?
              renderFmtv(props) : null
            }
            { state.accountType === ACCOUNT_TYPE_FMTV_GIFT ?
              renderFmtvGift(props) : null
            }
            { state.accountType === ACCOUNT_TYPE_FMTV_COMP ?
              renderFmtvComp(props) : null
            }
            { state.accountType === ACCOUNT_TYPE_TRIAL ?
              renderFreeTrial(props) : null
            }
            { state.accountType === ACCOUNT_TYPE_SECONDARY_PROFILE ?
              renderSecondaryProfile(props) : null
            }
            { state.accountType === ACCOUNT_TYPE_ROKU ?
              renderRokuV2(props) : null
            }
            { state.accountType === ACCOUNT_TYPE_ITUNES ?
              renderItunesV2(props) : null
            }
            {
              state.accountType === ACCOUNT_TYPE_AMAZON ?
                renderAmazon(props) : null
            }
            { state.accountType === ACCOUNT_TYPE_DEFAULT ||
                  state.accountType === ACCOUNT_TYPE_GCSI ||
                  state.accountType === ACCOUNT_TYPE_ZUORA ?
              renderDefaultV2(props) : null
            }
          </div>
        </div>
        <div className="my-account-V2__support-container">
          <Support />
        </div>
      </div>
    )
  }
}

MyAccountPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  paytrack: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  serverTime: ImmutablePropTypes.map.isRequired,
  setDialogOptions: PropTypes.func.isRequired,
  setOverlayCloseOnClick: PropTypes.func.isRequired,
  userProfiles: ImmutablePropTypes.map,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectStaticText({ storeKey: 'myAccountPage' }),
  connectRedux(
    state => ({
      page: state.page,
      user: state.user,
      userAccount: state.userAccount,
      auth: state.auth,
      paytrack: state.paytrack,
      serverTime: state.serverTime,
      userProfiles: state.userProfiles,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        getUserAccountDataBillingSubscriptionsWithDetails:
          actions.userAccount.getUserAccountDataBillingSubscriptionsWithDetails,
        setDialogOptions: actions.dialog.setDialogOptions,
        setOverlayCloseOnClick: actions.dialog.setOverlayCloseOnClick,
      }
    },
  ),
)(MyAccountPage)
