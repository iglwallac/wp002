
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import PlanGrid from 'components/PlanGrid'
import GiftProgressMeter from 'components/Gift/GiftProgressMeter'
import { H1 } from 'components/Heading'
import { TYPE_GIFT_FLOW_LOGIN } from 'services/dialog'
import { connect as connectStaticText } from 'components/StaticText/connect'

class GiftPlanSelectPage extends Component {
  componentDidMount () {
    const { renderModal, auth, staticText } = this.props

    if (!auth.get('jwt')) {
      renderModal(TYPE_GIFT_FLOW_LOGIN, {
        title: staticText.getIn(['data', 'title']),
        props: this.props,
      })
    }
  }

  render () {
    const { props } = this
    const { staticText, history, location } = props

    return (
      <div className="gift-plan-select">
        <GiftProgressMeter />
        <H1 className="gift-plan-select__title">
          {staticText.getIn(['data', 'title'])}
        </H1>
        <div className="gift-plan-select__plan-grid">
          <PlanGrid
            isGift
            history={history}
            location={location}
          />
        </div>
      </div>
    )
  }
}

GiftPlanSelectPage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  renderModal: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        renderModal: actions.dialog.renderModal,
      }
    },
  ),
  connectStaticText({ storeKey: 'giftPlanSelectPage' }),
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
)(GiftPlanSelectPage)
