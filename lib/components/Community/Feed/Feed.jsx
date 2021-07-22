import ImmutablePropTypes from 'react-immutable-proptypes'
import * as selectors from 'services/community/selectors'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { getBoundActions } from 'actions'
import React, { useEffect } from 'react'
import { List, Map } from 'immutable'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import CommunityForm, { TYPES as COMMUNITY_FORM_TYPES } from '../CommunityForm'
import Activity from '../Activity'

function Feed (props) {
  const {
    connectFeed,
    userUuid,
    feed,
    id,
  } = props

  useEffect(() => {
    if (!feed.size) {
      connectFeed({ id })
    }
  })

  if (!feed.size) {
    return (
      <div>
        <Sherpa type={TYPE_LARGE} />
      </div>
    )
  }

  const included = feed.get('included', List())
  const data = feed.get('data', Map())
  const feedUuid = feed.getIn(['data', 'uuid'], '')

  return (
    <div className="feed">
      <CommunityForm
        type={COMMUNITY_FORM_TYPES.POST}
        parent={feedUuid}
        feedId={id}
        photoUpload
        openGraph
      />
      <ul className="feed__activities">
        {data.getIn(['relationships', 'children'], List()).map((child) => {
          return (
            <Activity
              key={child.get('uuid')}
              included={included}
              userUuid={userUuid}
              data={child}
            />
          )
        })}
      </ul>
    </div>
  )
}

Feed.propTypes = {
  feed: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  connectFeed: PropTypes.func,
  userUuid: PropTypes.string,
  id: PropTypes.string,
}

export default connect(({ community, auth, user }, { id }) => {
  const feed = selectors.selectFeed(community, id)
  const userUuid = auth.get('uuid')
  return { feed, user, userUuid }
},
(dispatch) => {
  const actions = getBoundActions(dispatch)
  return {
    connectFeed: actions.community.connectFeed,
  }
})(Feed)

