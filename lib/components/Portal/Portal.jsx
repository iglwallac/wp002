import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { EMAIL_SIGNUP_PORTAL_PAGE } from 'services/email-signup'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PlanGridV2 from 'components/PlanGrid.v2/PlanGridV2'
import { requestAnimationFrame } from 'services/animate'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import CommentsLoader from 'components/CommentsLoader'
import CtaJoinDynamic from 'components/CtaJoinDynamic'
import React, { useCallback, useEffect } from 'react'
import { connect as connectRedux } from 'react-redux'
import { Button, TYPES } from 'components/Button.v2'
import DiscoverGaia from 'components/DiscoverGaia'
import { TYPE_PORTAL_FLAG } from 'services/dialog'
import { FR } from 'services/languages/constants'
import { getAuthIsLoggedIn } from 'services/auth'
import { ICON_TYPES } from 'components/Icon.v2'
import { getPrimary } from 'services/languages'
import TrustPilot from 'components/TrustPilot'
import CtaDevices from 'components/CtaDevices'
import { getBoundActions } from 'actions'
import { H3 } from 'components/Heading'
import { Map, List } from 'immutable'
import PropTypes from 'prop-types'
import {
  COMMUNITY_PAGINATION_LIMIT,
  PORTAL_PLAYLIST_KIND,
  isEditorMode,
  MODES,
} from 'services/portal'

import ModalUnsavedChanges from './ModalUnsavedChanges'
import { selectVideos, selectTitle } from './selectors'
import CommunityViewAll from './CommunityViewAll'
import PlaylistEdit from './PlaylistEdit'
import ProfileEdit from './ProfileEdit'
import Community from './Community'
import Playlist from './Playlist'
import Profile from './Profile'
import ViewAll from './ViewAll'

function onReturnFocus () {
  return null
}

function Portal ({
  setOverlayDialogVisible,
  removeVideoFromPlaylist,
  setEventUserInteraction,
  updateViewAllPagination,
  reorderPlaylistItem,
  updatePlaylistItem,
  addVideoToPlaylist,
  popularRowVideos,
  popularRowTitle,
  getPortalShare,
  clientIsReady,
  updatePortal,
  setPageTitle,
  updateEditor,
  renderModal,
  staticText,
  touchable,
  setMode,
  history,
  portal,
  auth,
  user,
}) {
  const portalError = portal.get('error')
  const processing = portal.get('processing')
  const allowAccess = portal.get('allowAccess')
  const noAccess = portalError || !allowAccess
  const mode = portal.get('mode', MODES.DEFAULT)
  const userLanguage = user.getIn(['data', 'language'])
  const currentLanguage = getPrimary(userLanguage)
  const username = portal.getIn(['data', 'username'])
  const recommendedPlaylist = portal.get('playlists')
  const prevMode = portal.get('prevMode', MODES.DEFAULT)
  const isPortalOwner = portal.get('isPortalOwner', false)
  const displayName = portal.getIn(['data', 'displayName'])
  const currentTags = portal.getIn(['data', 'tags'], List())
  const title = `${staticText.get('report')} ${username}`
  const tagOptions = portal.getIn(['tags', 'userTagsOptions'], List())
  const currentCover = portal.getIn(['data', 'coverPhotoKey'], '') || 'default'
  const recommendedRowVideos = portal.getIn(['playlists', 'videos'], List())
  const siteSegment = recommendedRowVideos.getIn([0, 'relativeSiteSegment'], -1)
  const recommendedRowTitle = staticText.get('titlePlaylistRecommended', '')
    .replace(/\$\{displayName\}/, displayName)

  useEffect(() => {
    setPageTitle(username)
  }, [username])

  const setModeRecommended = useCallback(() => {
    setMode(MODES.RECOMMENDED_PLAYLIST)
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }, [])

  const setModePopular = useCallback(() => {
    setMode(MODES.POPULAR_PLAYLIST)
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }, [])

  // eslint-disable-next-line no-unused-vars
  const onClickPlan = useCallback(() => {
    setEventUserInteraction({
      label: 'pricing-grid-selection',
      category: 'user engagement',
      action: 'Call to Action',
    })
  }, [])

  const renderFlagModal = useCallback(() => {
    renderModal(TYPE_PORTAL_FLAG, {
      title,
      staticText,
      onReturnFocus,
    })
  }, [username, title])

  if (processing) {
    return (
      <div className="portal-v2">
        <div className="member-portal__loading">
          <Sherpa type={TYPE_LARGE} />
        </div>
      </div>
    )
  }

  if (mode === MODES.PLAYLIST_EDIT) {
    return (
      <div className="portal-v2">
        <PlaylistEdit
          addVideoToPlaylist={addVideoToPlaylist}
          removeVideoFromPlaylist={removeVideoFromPlaylist}
          reorderPlaylistItem={reorderPlaylistItem}
          updatePlaylistItem={updatePlaylistItem}
          playlist={recommendedPlaylist}
          staticText={staticText}
          touchable={touchable}
          displayName={displayName}
          setMode={setMode}
          modes={MODES}
          auth={auth}
        />
      </div>
    )
  }

  return (
    <div className="portal-v2">
      <CommentsLoader />
      {isEditorMode(mode) ? (
        <ProfileEdit
          setOverlayDialogVisible={setOverlayDialogVisible}
          updatePortal={updatePortal}
          updateEditor={updateEditor}
          tagOptions={tagOptions}
          setMode={setMode}
          text={staticText}
          portal={portal}
          modes={MODES}
          user={user}
        />
      ) : null}
      {mode === MODES.DEFAULT ? (
        <React.Fragment>
          <Profile
            renderModal={renderModal}
            staticText={staticText}
            setMode={setMode}
            portal={portal}
            modes={MODES}
            auth={auth}
          />
          {(allowAccess && recommendedRowVideos.size > 0)
            || (allowAccess && isPortalOwner) ? (
              <Playlist
                kind={PORTAL_PLAYLIST_KIND.RECOMMENDED}
                getPortalShare={getPortalShare}
                ctaOnClick={setModeRecommended}
                items={recommendedRowVideos}
                label={recommendedRowTitle}
                ctaLabel={(recommendedRowVideos.size > 5) ? staticText.get('rowViewAll').replace('{totalItems}', recommendedRowVideos.size) : ''}
                staticText={staticText}
                setMode={setMode}
                history={history}
                portal={portal}
                auth={auth}
                modes={MODES}
                editable
              />
            ) : null}
          {!getAuthIsLoggedIn(auth) && !noAccess ? (
            <CtaJoinDynamic siteSegment={siteSegment} />
          ) : null}
          {allowAccess && clientIsReady && popularRowVideos.size > 0 ? (
            <Playlist
              kind={PORTAL_PLAYLIST_KIND.POPULAR}
              getPortalShare={getPortalShare}
              ctaOnClick={setModePopular}
              ctaLabel={(popularRowVideos.size > 5) ? staticText.get('rowViewAll').replace('{totalItems}', popularRowVideos.size) : ''}
              items={popularRowVideos}
              staticText={staticText}
              label={popularRowTitle}
              history={history}
              portal={portal}
              auth={auth}
              light
            />
          ) : null}
          {allowAccess ? (
            <Community
              staticText={staticText}
              setMode={setMode}
              portal={portal}
              modes={MODES}
              auth={auth}
            />
          ) : null}
          {!getAuthIsLoggedIn(auth) && clientIsReady && !noAccess ? (
            <React.Fragment>
              <DiscoverGaia formName={EMAIL_SIGNUP_PORTAL_PAGE} />
              <TrustPilot typeTwoColumn />
              <div className="portal-v2__plan-grid-wrapper">
                <H3 className="portal-v2__section-title">
                  {staticText.get('titlePlanGrid')}
                </H3>
                <PlanGridV2 history={history} />
              </div>
            </React.Fragment>
          ) : null}
          {getAuthIsLoggedIn(auth) && !isPortalOwner && allowAccess ?
            <Button
              className="portal-v2__flag"
              onClick={renderFlagModal}
              icon={ICON_TYPES.FLAG}
              type={TYPES.ICON}
            /> : null}
          {noAccess ||
            currentLanguage === FR ? null : <CtaDevices />}
        </React.Fragment>
      ) : null}
      {mode === MODES.UNSAVED_CHANGES ? (
        <ModalUnsavedChanges
          currentCover={currentCover}
          updateEditor={updateEditor}
          currentTags={currentTags}
          staticText={staticText}
          prevMode={prevMode}
          setMode={setMode}
          modes={MODES}
        />
      ) : null}
      {mode === MODES.RECOMMENDED_PLAYLIST ? (
        <ViewAll
          kind={PORTAL_PLAYLIST_KIND.RECOMMENDED}
          getPortalShare={getPortalShare}
          items={recommendedRowVideos}
          staticText={staticText}
          setMode={setMode}
          modes={MODES}
          auth={auth}
        />
      ) : null}
      {mode === MODES.POPULAR_PLAYLIST
        ? <ViewAll
          kind={PORTAL_PLAYLIST_KIND.POPULAR}
          getPortalShare={getPortalShare}
          items={popularRowVideos}
          staticText={staticText}
          setMode={setMode}
          modes={MODES}
          auth={auth}
        />
        : null}
      {mode === MODES.FOLLOWERS || mode === MODES.FOLLOWING
        ? <CommunityViewAll
          updatePagination={updateViewAllPagination}
          paginationLimit={COMMUNITY_PAGINATION_LIMIT}
          staticText={staticText}
          setMode={setMode}
          portal={portal}
          modes={MODES}
          auth={auth}
        />
        : null}
    </div>
  )
}

Portal.propTypes = {
  popularRowVideos: ImmutablePropTypes.list.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  removeVideoFromPlaylist: PropTypes.func.isRequired,
  setEventUserInteraction: PropTypes.func.isRequired,
  updateViewAllPagination: PropTypes.func.isRequired,
  reorderPlaylistItem: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  updatePlaylistItem: PropTypes.func.isRequired,
  addVideoToPlaylist: PropTypes.func.isRequired,
  popularRowTitle: PropTypes.string.isRequired,
  getPortalShare: PropTypes.func.isRequired,
  portal: ImmutablePropTypes.map.isRequired,
  clientIsReady: PropTypes.bool.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  updatePortal: PropTypes.func.isRequired,
  updateEditor: PropTypes.func.isRequired,
  renderModal: PropTypes.func.isRequired,
  touchable: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  setMode: PropTypes.func.isRequired,
}

const connectedPortal = connectPage({
  seoType: PAGE_SEO_TYPE_LOCATION,
})(Portal)

export default connectRedux(
  state => ({
    staticText: state.staticText.getIn(['data', 'portalV2', 'data'], Map()),
    touchable: state.app.getIn(['viewport', 'touchable'], false),
    clientIsReady: state.app.get('bootstrapComplete'),
    popularRowVideos: selectVideos(state),
    popularRowTitle: selectTitle(state),
    portal: state.portal,
    auth: state.auth,
    user: state.user,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setEventUserInteraction: actions.eventTracking.setEventUserInteraction,
      setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      removeVideoFromPlaylist: actions.portal.removeVideoFromPlaylist,
      updateViewAllPagination: actions.portal.updateViewAllPagination,
      reorderPlaylistItem: actions.playlist.reorderPlaylistItem,
      updatePlaylistItem: actions.playlist.updatePlaylistItem,
      addVideoToPlaylist: actions.portal.addVideoToPlaylist,
      getPortalShare: actions.portal.getPortalShare,
      updatePortal: actions.portal.updatePortal,
      updateEditor: actions.portal.updateEditor,
      renderModal: actions.dialog.renderModal,
      setPageTitle: actions.page.setPageTitle,
      setMode: actions.portal.setMode,
    }
  },
)(connectedPortal)
