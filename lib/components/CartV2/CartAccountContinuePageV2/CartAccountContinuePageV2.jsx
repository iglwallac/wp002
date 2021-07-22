import React, { useEffect } from 'react'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { URL_CART_ACCOUNT_CREATION_CREATE } from 'services/url/constants'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import CartProgressIndicator from 'components/CartProgressIndicator'
import { DATA_ACTION_CONTINUE } from 'components/Link/constants'
import { H1, HEADING_TYPES } from 'components/Heading'
import { Button, TYPES } from 'components/Button.v2'
import CartOrderSummaryV2 from 'components/CartV2/CartOrderSummaryV2'
import { requestAnimationFrame } from 'services/animate'

function CartChoosePlanPageV2 (props) {
  const { plans } = props

  useEffect(() => {
    if (window.scrollTo) {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    }
  }, [])

  if (!plans.get('selection')) {
    return null
  }

  return (
    <div className="cart-account-continue-v2">
      <div className="cart-account-continue-v2__content">
        <div className="cart-account-continue-v2__content-left">
          <CartProgressIndicator />
          <H1 as={HEADING_TYPES.H3} className="cart-account-continue-v2__title">
            Create your account
          </H1>
          <p className="cart-account-continue-v2__description">
            Set up your membership to stream Gaia on your favorite devices.
          </p>
          <Button
            className="cart-account-continue-v2__button"
            type={TYPES.PRIMARY}
            url={URL_CART_ACCOUNT_CREATION_CREATE}
            data-action={DATA_ACTION_CONTINUE}
          >
            Continue
          </Button>
        </div>
        <div className="cart-account-continue-v2__content-right">
          <div className="cart-account-continue-v2__order-summary">
            <CartOrderSummaryV2 />
          </div>
        </div>
      </div>
    </div>
  )
}

CartChoosePlanPageV2.propTypes = {
  plans: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      plans: state.plans,
    }),
  ),
  connectStaticText({ storeKey: 'cartAccountContinuePage' }),
)(CartChoosePlanPageV2)

