import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import Icon from 'components/Icon'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { get as getConfig } from 'config'
import { get as _get, partial as _partial } from 'lodash'
import { H3 } from 'components/Heading'

function onClickComments (e, onClickViewAllComments) {
  e.preventDefault()
  if (onClickViewAllComments) {
    onClickViewAllComments(e)
  }
}

function getActions (onClickViewAllComments, staticText) {
  const showComments = _get(getConfig(), 'features.comments', false)
  if (!showComments) {
    return null
  }
  return (
    <div className="community-meta__actions">
      <Link
        className="community-meta__comments-link"
        to={URL_JAVASCRIPT_VOID}
        onClick={_partial(
          onClickComments,
          _partial.placeholder,
          onClickViewAllComments,
        )}
      >
        {staticText.get('viewAllComments')}
      </Link>
    </div>
  )
}

function CommunityMeta (props) {
  const {
    staticText,
    totalComments,
    onClickViewAllComments,
  } = props
  return (
    <div className="community-meta">
      <div className="community-meta__stats">
        <div className="community-meta__stat-item community-meta__stat-item--last">
          <H3 className="community-meta__stat-count">{totalComments}</H3>
          <span className="community-meta__stat-label">
            <Icon
              iconClass={[
                'icon-v2--comment',
                'icon--purple',
                'icon--small',
                'community-meta__stat-icon',
              ]}
            />
          </span>
        </div>
      </div>
      {getActions(onClickViewAllComments, staticText)}
    </div>
  )
}

CommunityMeta.propTypes = {
  totalComments: PropTypes.number.isRequired,
  featuredComment: PropTypes.object,
  onClickViewAllComments: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default connect(state => ({
  staticText: state.staticText.getIn(
    ['data', 'communityMeta', 'data'],
    Map(),
  ),
}))(CommunityMeta)
