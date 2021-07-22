import { COMMUNITY_PAGE_HERO_TEXT } from 'services/community'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Jumbotron from 'components/JumbotronSubcategory'
import { connect as connectRedux } from 'react-redux'
import { ReplaceHistory } from 'components/Redirect'
import { getBoundActions } from 'actions'
import PropTypes from 'prop-types'
import { Map } from 'immutable'
import React from 'react'

import Feed from './Feed'

const HERO_IMAGE = Map({
  small: 'https://brooklyn.gaia.com/v1/image-render/ed43a2a9-b841-4341-8ec7-8caf0da1a259/community-banner-768.jpg',
  large: 'https://brooklyn.gaia.com/v1/image-render/6f029dec-e06a-45d1-91e6-f3910e2bfef5/community-banner-1440.jpg',
})

function MainFeedPage (props) {
  const {
    setOverlayDialogVisible,
    forbidden,
    error,
    auth,
  } = props

  if (forbidden) {
    return <ReplaceHistory url="/" />
  }

  return (
    <div className="main-feed-page">
      <Jumbotron
        setOverlayDialogVisible={setOverlayDialogVisible}
        description={COMMUNITY_PAGE_HERO_TEXT}
        truncateDescription={false}
        heroImage={HERO_IMAGE}
        title="Community"
        auth={auth}
      />
      <div className="main-feed-page__container">
        {error
          ? 'There seems to be a problem loading the community page. Please check the URL or try again later.'
          : <Feed id="main" />}
      </div>
    </div>
  )
}

MainFeedPage.propTypes = {
  forbidden: PropTypes.bool,
  auth: ImmutablePropTypes.map.isRequired,
}

export default connectRedux(({ auth, community }) => {
  const error = community.getIn(['errors', 0, 'status'])
  return {
    forbidden: error === 403 || error === 401,
    error,
    auth,
  }
},
(dispatch) => {
  const actions = getBoundActions(dispatch)
  return {
    setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
  }
})(MainFeedPage)
