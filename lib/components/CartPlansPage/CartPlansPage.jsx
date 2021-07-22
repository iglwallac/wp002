
import PropTypes from 'prop-types'
import React from 'react'
import compose from 'recompose/compose'
import PlanGridV2 from 'components/PlanGrid.v2/PlanGridV2'
import PlanGridA from 'components/PlanGridTest/PlanGridA'
import PlanGridB from 'components/PlanGridTest/PlanGridB'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import CartProgressIndicator from 'components/CartProgressIndicator'
import { H1, HEADING_TYPES } from 'components/Heading'
import OptimizelyPage from 'components/OptimizelyPage'
import OptimizelyTest from 'components/OptimizelyTest'

function CartPlansPage (props) {
  const { history, staticText } = props

  return (
    <div className="cart-plans">
      <div className="cart-plans__wrapper">
        <CartProgressIndicator v2 />
        <H1 as={HEADING_TYPES.H3} className="cart-plans__title">
          {staticText.getIn(['data', 'choosePlan'])}
        </H1>
        <OptimizelyTest
          original
          experimentId={'20230924395'}
          variantId={'20245365057'}
        >
          <PlanGridV2 history={history} />
        </OptimizelyTest>
        <OptimizelyTest
          original={false}
          experimentId={'20230924395'}
          variantId={'20234605725'}
        >
          <PlanGridA history={history} />
        </OptimizelyTest>
        <OptimizelyTest
          original={false}
          experimentId={'20230924395'}
          variantId={'20222715334'}
        >
          <PlanGridB history={history} />
        </OptimizelyTest>
      </div>
      <OptimizelyPage pageName="web_app__cart_plan_selection_plans" />
    </div>
  )
}

CartPlansPage.propTypes = {
  history: PropTypes.object.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectStaticText({ storeKey: 'cartPlansPage' }),
)(CartPlansPage)
