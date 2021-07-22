import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import Link from 'components/Link'
import { URL_PLAN_SELECTION } from 'services/url/constants'
import Icon from 'components/Icon'

function AlertBarFreeTrialExpired (props) {
  const { staticText } = props

  return (
    <div className="alert-bar-free-trial-expired">
      <span>
        {/* <Link tag is awkwardly formatted because we need to keep
        the space between the two static text variables */}
        {staticText.getIn(['data', 'body'])} <Link
          to={URL_PLAN_SELECTION}
          className=""
        >
          {staticText.getIn(['data', 'button'])}
        </Link>
        <Icon
          iconClass={[
            'alert-bar-free-trial-expired__arrow-right',
            'icon--right',
            'icon--action',
          ]}
        />
      </span>
    </div>
  )
}

AlertBarFreeTrialExpired.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'alertBarFreeTrialExpired' }),
)(AlertBarFreeTrialExpired)
