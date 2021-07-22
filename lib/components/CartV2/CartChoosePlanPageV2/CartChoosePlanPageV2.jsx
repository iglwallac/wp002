import React from 'react'
import compose from 'recompose/compose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { URL_PLAN_SELECTION_PLANS } from 'services/url/constants'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import CartProgressIndicator from 'components/CartProgressIndicator'
import { Button, TYPES } from 'components/Button.v2'
import { H1, HEADING_TYPES } from 'components/Heading'

function CartChoosePlanPageV2 () {
  return (
    <div className="cart-choose-plan-v2">
      <CartProgressIndicator />
      <H1 as={HEADING_TYPES.H3} className="cart-choose-plan-v2__title">
        Choose your plan
      </H1>
      <p className="cart-choose-plan-v2__body">
        Three amazing offers, one great experience.
      </p>
      <Button
        className="cart-choose-plan-v2__button"
        type={TYPES.PRIMARY}
        url={URL_PLAN_SELECTION_PLANS}
      >
        {'See Plans'}
      </Button>
    </div>
  )
}

CartChoosePlanPageV2.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectStaticText({ storeKey: 'cartChoosePlanPage' }),
)(CartChoosePlanPageV2)

