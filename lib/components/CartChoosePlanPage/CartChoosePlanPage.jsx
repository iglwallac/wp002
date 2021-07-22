
import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import Button from 'components/Button'
import CartProgressIndicator from 'components/CartProgressIndicator'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { URL_PLAN_SELECTION_PLANS } from 'services/url/constants'
import OptimizelyTest from 'components/OptimizelyTest'
import CartChoosePlanPageV2 from 'components/CartV2/CartChoosePlanPageV2'
import { H2, HEADING_TYPES } from 'components/Heading'

function CartChoosePlanPage (props) {
  const { staticText, auth } = props

  const getContent = () => {
    return (
      <div className="cart-choose-plan">
        <CartProgressIndicator />
        <H2 as={HEADING_TYPES.H3} className="cart-choose-plan__title">
          {staticText.getIn(['data', 'title'])}
        </H2>
        <p className="cart-choose-plan__body">
          {staticText.getIn(['data', 'threeAmazingOffers'])}
        </p>
        <Button
          buttonClass={['button--primary', 'cart-choose-plan__continue-button']}
          text={staticText.getIn(['data', 'seePlans'])}
          url={URL_PLAN_SELECTION_PLANS}
        />
      </div>
    )
  }

  // for Optimizely Test 19422180075, if the user is logged in, show them the old layout
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
        <CartChoosePlanPageV2 />
      </OptimizelyTest>
    </React.Fragment>
  )
}

CartChoosePlanPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectStaticText({ storeKey: 'cartChoosePlanPage' }),
  connectRedux(
    state => ({
      auth: state.auth,
    }),
  ),
)(CartChoosePlanPage)
