import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { H1, HEADING_TYPES } from 'components/Heading'
import PlanGridV2 from 'components/PlanGrid.v2/PlanGridV2'
import BackButton from 'components/BackButton'
import { URL_ACCOUNT } from 'services/url/constants'

function MyAccountChangePlanPage (props) {
  const { history, staticText } = props

  return (
    <div className="my-account-change-plan">
      <BackButton
        className="my-account-change-plan__back-button"
        url={URL_ACCOUNT}
      >
        {staticText.get('back')}
      </BackButton>
      <H1 as={HEADING_TYPES.H3} className="my-account-change-plan__title">
        {staticText.get('changePlan')}
      </H1>
      <p className="my-account-change-plan__description">
        {staticText.get('choose')}
      </p>
      <PlanGridV2 history={history} isAccountChangePlan />
    </div>
  )
}

MyAccountChangePlanPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      staticText: state.staticText.getIn(['data', 'myAccountChangePlanPage', 'data']),
    }),
  ),
)(MyAccountChangePlanPage)
