
import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import Link from 'components/Link'
import Icon from 'components/Icon'

function GiftBackLink (props) {
  const { url, staticText } = props

  return (
    <div className="gift-back-link">
      <Link
        to={url}
        className="gift-back-link__link"
      >
        <Icon iconClass={['icon--left', 'gift-back-link__left-icon']} />
        {staticText.getIn(['data', 'back'])}
      </Link>
    </div>
  )
}

GiftBackLink.propTypes = {
  url: PropTypes.string.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'giftBackLink' }),
)(GiftBackLink)
