
import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List } from 'immutable'
import _parseInt from 'lodash/parseInt'
import compose from 'recompose/compose'
import Button from 'components/Button'
import Link from 'components/Link'
import { connect as connectRedux } from 'react-redux'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { URL_ACCOUNT, URL_HOME } from 'services/url/constants'
import { isEntitled } from 'services/subscription'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import { H1, HEADING_TYPES } from 'components/Heading'

function CartAccessDeniedPage (props) {
  const { auth, user, staticText } = props
  const authToken = auth.get('jwt')
  const uid = user.getIn(['data', 'uid'])
  const accountOwnerUid = user.getIn(['data', 'account_owner_uid'])
  const isAccountOwner = _parseInt(uid) === _parseInt(accountOwnerUid)
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  const userProcessing = user.get('processing')
  const authProcessing = auth.get('processing')

  const getText = () => {
    if (!userIsEntitled && !isAccountOwner) {
      return (
        <React.Fragment>
          <H1 as={HEADING_TYPES.H5}>
            {staticText.getIn(['data', 'inactiveSubscriptionChildTitle'])}
          </H1>
          <p className="cart-access-denied__text">
            {staticText.getIn(['data', 'inactiveSubscriptionChildText'])}
          </p>
        </React.Fragment>
      )
    } else if (!isAccountOwner) {
      return (
        <React.Fragment>
          <H1 as={HEADING_TYPES.H5}>
            {staticText.getIn(['data', 'activeSubscriptionTitle'])}
          </H1>
          <p className="cart-access-denied__text">
            {staticText.getIn(['data', 'activeSubscriptionChildText'])}
          </p>
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        <H1 as={HEADING_TYPES.H5}>
          {staticText.getIn(['data', 'activeSubscriptionTitle'])}
        </H1>
        <p className="cart-access-denied__text">
          {`${staticText.getIn(['data', 'activeSubscriptionText'])} `}
          <Link to={URL_ACCOUNT}>
            {staticText.getIn(['data', 'activeSubscriptionLink'])}
          </Link>
          {'.'}
        </p>
      </React.Fragment>
    )
  }

  if (!authToken) {
    return null
  }

  return (
    <div className="cart-access-denied">
      {
        userProcessing || authProcessing ?
          <Sherpa className={['cart-access-denied__sherpa']} type={TYPE_SMALL_BLUE} />
          :
          <React.Fragment>
            {getText()}
            <Button
              buttonClass={['button--primary', 'button--x-small', 'cart-access-denied__home-btn']}
              text={staticText.getIn(['data', 'gaiaHomeLink'])}
              url={URL_HOME}
            />
          </React.Fragment>
      }
    </div>
  )
}

CartAccessDeniedPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectStaticText({ storeKey: 'cartAccessDeniedPage' }),
  connectRedux(
    state => ({
      auth: state.auth,
      user: state.user,
    }),
  ),
)(CartAccessDeniedPage)
