
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import Button from 'components/Button'
import CartProgressIndicator from 'components/CartProgressIndicator'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { URL_CART_ACCOUNT_CREATION_CREATE } from 'services/url/constants'
import CartOrderSummary from 'components/CartOrderSummary'
import { DATA_ACTION_CONTINUE } from 'components/Link/constants'
import { requestAnimationFrame } from 'services/animate'
import OptimizelyTest from 'components/OptimizelyTest'
import CartAccountContinuePageV2 from 'components/CartV2/CartAccountContinuePageV2'
import { H2, HEADING_TYPES } from 'components/Heading'

function CartAccountContinuePage (props) {
  const { staticText, plans, auth } = props

  const getContent = () => {
    return (
      <div className="cart-account-continue">
        <div className="cart-account-continue__mobile-cart-summary">
          <CartOrderSummary mobile />
        </div>
        <div className="cart-account-continue__progress">
          <CartProgressIndicator />
        </div>
        <div className="cart-account-continue__contents">
          <div className="cart-account-continue__left-wrap">
            <H2 as={HEADING_TYPES.H3} className="cart-account-continue__title">{staticText.getIn(['data', 'title'])}</H2>
            <p className="cart-account-continue__body">{staticText.getIn(['data', 'setUpMembership'])}</p>
            <Button
              buttonClass={['button--primary', 'cart-account-continue__continue-button']}
              text={staticText.getIn(['data', 'continue'])}
              url={URL_CART_ACCOUNT_CREATION_CREATE}
              data-action={DATA_ACTION_CONTINUE}
            />
          </div>
          <div className="cart-account-continue__order-summary">
            <CartOrderSummary desktop />
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (window.scrollTo) {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    }
  }, [])

  if (!plans.get('selection')) {
    return null
  }

  // for Optimizely Test 19422180075, if the user is logged in, show the old layout
  if (auth.get('jwt')) {
    return getContent()
  }

  return (
    <React.Fragment>
      <OptimizelyTest
        original
        experimentId={'19422180075'}
        variantId={'19419760057'}
      >
        {getContent()}
      </OptimizelyTest>
      <OptimizelyTest
        original={false}
        experimentId={'19422180075'}
        variantId={'19431530074'}
      >
        <CartAccountContinuePageV2 />
      </OptimizelyTest>
    </React.Fragment>
  )
}

CartAccountContinuePage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      plans: state.plans,
      auth: state.auth,
    }),
  ),
  connectStaticText({ storeKey: 'cartAccountContinuePage' }),
)(CartAccountContinuePage)
