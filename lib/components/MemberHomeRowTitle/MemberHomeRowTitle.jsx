import PropTypes from 'prop-types'
import React from 'react'
import {
  ROW_TYPE_CENTER,
  ROW_TYPE_MY_PLAYLIST,
  ROW_TYPE_FEATURED_CONTENT_IMPRESSION_ROW,
} from 'services/member-home'
import { connect as connectStaticText } from 'components/StaticText/connect'
import Link from 'components/Link'
import { H2, HEADING_TYPES } from 'components/Heading'

function renderViewAllLink (props) {
  const { staticText, path, type } = props
  switch (type) {
    case ROW_TYPE_MY_PLAYLIST:
      return (
        <Link
          to={'/playlist'}
          className={'member-home-row-title__view-all'}
          onClick={e => e.stopPropagation()}
        >
          {staticText.getIn(['data', 'seeAll'])}
        </Link>
      )
    case ROW_TYPE_FEATURED_CONTENT_IMPRESSION_ROW:
    case ROW_TYPE_CENTER:
      if (!path) {
        return null
      }

      return (
        <Link
          to={path}
          className={'member-home-row-title__view-all'}
          onClick={e => e.stopPropagation()}
        >
          {staticText.getIn(['data', 'seeAll'])}
        </Link>
      )
    default:
      return null
  }
}

function MemberHomeRowTitle (props) {
  const { label } = props
  return (
    <H2 as={HEADING_TYPES.H6} className="member-home-row-title">
      {label}
      {renderViewAllLink(props)}
    </H2>
  )
}

MemberHomeRowTitle.propTypes = {
  type: PropTypes.string.isRequired,
  label: PropTypes.string,
  path: PropTypes.string,
  rowPosition: PropTypes.number.isRequired,
  authToken: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  toggleToolTipVisible: PropTypes.func.isRequired,
  setToolTipVisible: PropTypes.func.isRequired,
  toolTipVisible: PropTypes.bool.isRequired,
}

const connectedMemberHomeRowTitle = connectStaticText({
  storeKey: 'memberHomeRowTitle',
})(MemberHomeRowTitle)

export default connectedMemberHomeRowTitle
