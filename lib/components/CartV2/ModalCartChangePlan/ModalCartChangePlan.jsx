import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import PlanGridV2 from 'components/PlanGrid.v2/PlanGridV2'
import { H4 } from 'components/Heading'


const ModalCartChangePlan = ({
  history,
  staticText,
}) => {
  return (
    <div className="modal-cart-change-plan">
      <H4>{staticText.getIn(['data', 'changePlan'])}</H4>
      <PlanGridV2 history={history} isCheckoutChangePlan />
    </div>
  )
}

ModalCartChangePlan.propTypes = {
  history: PropTypes.object.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'modalCartChangePlan' }),
)(ModalCartChangePlan)
