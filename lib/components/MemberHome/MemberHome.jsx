import { compose } from 'recompose'
import { List, Map } from 'immutable'
import { getBoundActions } from 'actions'
import React, { Component } from 'react'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { dispatchWhen } from 'services/dispatch-when'
import {
  addListener,
  removeListener,
  deactivateSubject,
  updateSubject,
} from 'services/testarossa'
import ImmutablePropTypes from 'react-immutable-proptypes'
import CommentsLoader from 'components/CommentsLoader'
import _includes from 'lodash/includes'
import _debounce from 'lodash/debounce'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
// Member Home Redesign Test
import MemberHomeV2 from 'components/MemberHome.v2'

import {
  SET_EVENT_PAGE_VIEWED,
} from 'services/event-tracking/actions'
import {
  SCREEN_TYPE_MEMBER_HOME,
} from 'services/upstream-context'
import {
  STORE_KEY_MEMBER_HOME,
  STORE_KEY_SHELF_EPISODES,
  STORE_KEY_SHELF_EPISODES_NEXT,
  STORE_KEY_SHELF_RELATED,
  STORE_KEY_SHELF_FEATURED_EPISODE,
} from 'services/store-keys'

const storeKeyList = [
  STORE_KEY_MEMBER_HOME,
  STORE_KEY_SHELF_EPISODES,
  STORE_KEY_SHELF_EPISODES_NEXT,
  STORE_KEY_SHELF_RELATED,
  STORE_KEY_SHELF_FEATURED_EPISODE,
]

function isUserInfoSynced (memberHome) {
  const notSynchedItem = memberHome
    .getIn(['data', 'rows'], List())
    .find(row => row.get('payload', List()).find(title => !title.get('userInfo')))
  return !notSynchedItem
}

function updateData (props) {
  const {
    auth,
    userId,
    memberHome,
    testarossaInitialized,
    testarossaFailure,
    getMemberHomeData,
    getMemberHomeDataUserInfo,
  } = props
  const userInfoSynced = isUserInfoSynced(memberHome)
  const authUid = auth.getIn(['uid'])
  // Make sure the user and auth have equal uid
  // this tell us that the user store is synced up
  const userAuthSynched = userId === authUid

  if (
    auth.get('jwt') &&
    userAuthSynched &&
    !memberHome.get('data') &&
    !memberHome.get('processing') &&
    // retireve member home data only when testarossa/daytona is ready or if it crapped out...
    // we need to wait for daytona production campaign configurations.
    // daytona is usually much faster than web app and is ready before react/redux has loaded
    (testarossaInitialized || testarossaFailure)
  ) {
    getMemberHomeData({ auth })
    return
  }

  if (
    memberHome.getIn(['data', 'rows']) &&
    !memberHome.get('processing') &&
    !memberHome.get('userInfoProcessing') &&
    !userInfoSynced
  ) {
    const ids = memberHome
      .getIn(['data', 'rows'], List())
      .map((row) => {
        return row.get('payload', List())
          .map(title => title.get('id'))
      })
      .flatten()
    if (ids.size > 0) {
      getMemberHomeDataUserInfo(ids, auth.get('jwt'))
    }
  }
}

function setDaytonaListeners () {
  addListener('campaign.WA-2.impression', (e) => {
    const impressions = _get(e, ['record', 'variables', 'impressions'], 0) + 1
    const impressionLimit = _get(e, ['record', 'variation', 'data', 'impressionLimit'])
    if (impressionLimit && impressions >= impressionLimit) {
      dispatchWhen(SET_EVENT_PAGE_VIEWED, () => {
        deactivateSubject({ campaign: 'WA-2' })
      })
    }
    updateSubject({
      campaign: 'WA-2',
      variables: {
        impressions,
      },
    })
  })
}

function removeDaytonaListeners () {
  removeListener('campaign.WA-2.impression')
}

class MemberHome extends Component {
  //
  componentDidMount () {
    const { props, setScrollListener } = this
    updateData(props)
    setScrollListener()
    setDaytonaListeners()
  }

  componentWillReceiveProps (nextProps) {
    if (!process.env.BROWSER) {
      return
    }
    const { setScrollListener } = this
    updateData(nextProps)
    setScrollListener()
  }

  componentDidUpdate (prevProps) {
    if (!process.env.BROWSER) {
      return
    }
    const { props } = this
    const { auth, userLanguage, memberHome, resetMemberHomeData } = props
    const { auth: prevAuth, userLanguage: prevUserLanguage } = prevProps
    const jwt = auth.get('jwt')
    const prevJwt = prevAuth.get('jwt')
    const authChanged = jwt && memberHome.get('data') && prevJwt !== jwt
    const userLanugageChanged = !userLanguage.equals(prevUserLanguage)
    if (authChanged || userLanugageChanged) {
      resetMemberHomeData()
    }
  }

  componentWillUnmount () {
    const { props, destroyScrollListener } = this
    const { setCommentsVisible, resetMemberHomeData } = props
    resetMemberHomeData()
    destroyScrollListener()
    removeDaytonaListeners()
    setCommentsVisible(false)
  }

  onScroll = () => {
    if (!this._component) {
      return
    }
    const { memberHome, setMemberHomeRowCount } = this.props
    const rowCount = memberHome.get('rowCount', 4)
    const rows = memberHome.getIn(['data', 'rows'], List())
    const component = this._component
    if (
      window.pageYOffset > component.getBoundingClientRect().bottom - 200 &&
      rows.size > 0 &&
      rowCount < rows.size
    ) {
      setMemberHomeRowCount(rowCount + 4)
    }
  }

  onRef = (component) => {
    this._component = component
  }

  setScrollListener = () => {
    if (!this._onScrollDebounce) {
      this._onScrollDebounce = _debounce(this.onScroll, 50, 300)
      window.addEventListener('scroll', this._onScrollDebounce)
    }
  }

  destroyScrollListener = () => {
    if (this._onScrollDebounce) {
      this._onScrollDebounce.cancel()
      window.removeEventListener('scroll', this._onScrollDebounce)
    }
  }

  render () {
    const { props } = this
    const { sectionIds, hasData } = props
    return (
      <article className="member-home" ref={this.onRef}>
        <CommentsLoader />
        { hasData ?
          <MemberHomeV2 sectionIds={sectionIds} location={props.location} history={props.history} />
          : null
        }
      </article>
    )
  }
}

MemberHome.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  shelf: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  memberHome: ImmutablePropTypes.map.isRequired,
  tileRows: ImmutablePropTypes.map.isRequired,
  getMemberHomeData: PropTypes.func.isRequired,
  getMemberHomeDataUserInfo: PropTypes.func.isRequired,
  setMemberHomeRowCount: PropTypes.func.isRequired,
  setMemberHomeScrollableTileIndex: PropTypes.func.isRequired,
  setMemberHomeScrollableRowWidth: PropTypes.func.isRequired,
  resetMemberHomeData: PropTypes.func.isRequired,
  setToolTipVisible: PropTypes.func.isRequired,
  toggleToolTipVisible: PropTypes.func.isRequired,
  setTilesScrollableTileIndex: PropTypes.func.isRequired,
  setTilesScrollableRowWidth: PropTypes.func.isRequired,
  setTileRowsActiveId: PropTypes.func.isRequired,
  setTileRowsRowActiveId: PropTypes.func.isRequired,
  setShelfVisible: PropTypes.func.isRequired,
  getShelfData: PropTypes.func.isRequired,
  setCommentsVisible: PropTypes.func.isRequired,
  setEventSeriesVisited: PropTypes.func.isRequired,
  setEventVideoVisited: PropTypes.func.isRequired,
}

MemberHome.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'memberHome' }),
  connectRedux(
    (state) => {
      const tileRows = state.tileRows.filter((val, key) => _includes(storeKeyList, key))
      const tiles = state.tiles.filter((val, key) =>
        _includes(storeKeyList, key) || key === 'scrollableRowWidth',
      )
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const screenStore = state.pmScreen.getIn([SCREEN_TYPE_MEMBER_HOME, language], Map())
      const hasData = screenStore.has('data')
      const sectionIds = screenStore.getIn(['data', 'sectionIds'], List())
      return {
        hasData,
        sectionIds,
        userId: state.user.getIn(['data', 'uid']),
        userLanguage: state.user.getIn(['data', 'language'], List()),
        tiles,
        tileRows,
        auth: state.auth,
        page: state.page,
        shelf: state.shelf,
        toolTip: state.toolTip,
        playlist: state.playlist,
        memberHome: state.memberHome,
        testarossaInitialized: state.testarossa.get('initialized'),
        testarossaFailure: state.testarossa.get('failure'),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getMemberHomeData: actions.memberHome.getMemberHomeData,
        getMemberHomeDataUserInfo: actions.memberHome.getMemberHomeDataUserInfo,
        setMemberHomeRowCount: actions.memberHome.setMemberHomeRowCount,
        setMemberHomeScrollableTileIndex:
          actions.memberHome.setMemberHomeScrollableTileIndex,
        setMemberHomeScrollableRowWidth:
          actions.memberHome.setMemberHomeScrollableRowWidth,
        resetMemberHomeData: actions.memberHome.resetMemberHomeData,
        updateRowEditMode: actions.memberHome.updateRowEditMode,
        saveRowEditRemovals: actions.memberHome.saveRowEditRemovals,
        addTileRowRemoval: actions.memberHome.addTileRowRemoval,
        undoTileRowRemoval: actions.memberHome.undoTileRowRemoval,
        setToolTipVisible: actions.toolTip.setToolTipVisible,
        toggleToolTipVisible: actions.toolTip.toggleToolTipVisible,
        setTilesScrollableTileIndex: actions.tiles.setTilesScrollableTileIndex,
        setTilesScrollableRowWidth: actions.tiles.setTilesScrollableRowWidth,
        setTileRowsActiveId: actions.tileRows.setTileRowsActiveId,
        setTileRowsRowActiveId: actions.tileRows.setTileRowsRowActiveId,
        setShelfVisible: actions.shelf.setShelfVisible,
        getShelfData: actions.shelf.getShelfData,
        setCommentsVisible: actions.comments.setCommentsVisible,
        setEventVideoVisited: actions.eventTracking.setEventVideoVisited,
        setEventSeriesVisited: actions.eventTracking.setEventSeriesVisited,
        setInPlaylist: actions.playlist.setInPlaylist,
      }
    },
  ),
)(MemberHome)
