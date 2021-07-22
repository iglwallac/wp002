import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import { RESOLVER_TYPE_SUBCATEGORY } from 'services/resolver/types'
import { connect as connectRedux } from 'react-redux'
import { connect as connectLanguage } from 'components/Language/connect'
import { getBoundActions } from 'actions'
import JumbotronVideo from 'components/JumbotronVideo'
import JumbotronEpisode from 'components/JumbotronEpisode'
import JumbotronSeries from 'components/JumbotronSeries'
import JumbotronSubcategory from 'components/JumbotronSubcategory'
import BannerPlaceholder from 'components/BannerPlaceholder'
import PlaylistAddRemove from 'components/PlaylistAddRemove'
import {
  TYPE_CONTENT_SUBCATEGORY,
  TYPE_CONTENT_VIDEO,
  TYPE_CONTENT_VIDEO_YOGA,
  TYPE_CONTENT_VIDEO_FITNESS,
  TYPE_CONTENT_VIDEO_MEDITATION,
  TYPE_CONTENT_EPISODE,
  TYPE_CONTENT_EPISODE_YOGA,
  TYPE_CONTENT_EPISODE_FITNESS,
  TYPE_CONTENT_EPISODE_MEDITATION,
  TYPE_CONTENT_SEGMENT,
  TYPE_CONTENT_SEGMENT_YOGA,
  TYPE_CONTENT_SEGMENT_FITNESS,
  TYPE_CONTENT_SEGMENT_MEDITATION,
  TYPE_CONTENT_SERIES,
  TYPE_CONTENT_SERIES_YOGA,
  TYPE_CONTENT_SERIES_FITNESS,
  TYPE_CONTENT_SERIES_MEDITATION,
  TYPE_CONTENT_SEGMENTED,
  TYPE_CONTENT_SEGMENTED_YOGA,
  TYPE_CONTENT_SEGMENTED_FITNESS,
  TYPE_CONTENT_SEGMENTED_MEDITATION,
} from 'services/content-type'
import _assign from 'lodash/assign'
import { isSynced as resolverIsSynced } from 'components/Resolver/synced'
import { updateUpstreamContext } from 'services/upstream-context'

function createOnLanguageChange (actions) {
  return actions.jumbotron.resetJumbotronData
}

function jumbotronIsSynced (jumbotron, resolver) {
  const resolvedId = resolver.getIn(['data', 'id'])
  return (
    resolvedId === jumbotron.get('id') &&
    resolvedId === jumbotron.getIn(['data', 'id'])
  )
}

function updateData (props) {
  const { storeKey, resolver, jumbotron, auth, location, user } = props
  const {
    setJumbotronDataPlaceholder,
    getJumbotronData,
    getJumbotronDataUserInfo,
  } = props
  const resolvedId = resolver.getIn(['data', 'id'])
  const jumbotronState = jumbotron.get(storeKey, Map())
  const jumbotronData = jumbotronState.get('data', Map())
  const jumbotronSynced = jumbotronIsSynced(jumbotronState, resolver)
  const userInfoSynced = !!jumbotronData.get('userInfo')
  const resolverSynced = resolverIsSynced(resolver, location)
  const resolvedTypeNotSubCat =
    resolver.getIn(['data', 'type']) !== RESOLVER_TYPE_SUBCATEGORY
  if (
    location.pathname !== jumbotronState.get('path') &&
    !jumbotronState.get('placeholderExists')
  ) {
    setJumbotronDataPlaceholder(storeKey)
    return
  }
  if (!resolverSynced) {
    return
  }

  if (!jumbotronSynced && !jumbotronState.get('processing')) {
    getJumbotronData(
      storeKey,
      resolvedId,
      resolver.getIn(['data', 'type']),
      location.pathname,
      auth,
      user,
    )
    return
  }

  // Hydrate Tiles userInfo on initial page load
  if (
    auth.get('jwt') &&
    resolvedTypeNotSubCat &&
    jumbotronSynced &&
    !jumbotronState.get('processing') &&
    !userInfoSynced &&
    !jumbotronState.get('userInfoProcessing')
  ) {
    getJumbotronDataUserInfo(storeKey, [jumbotronState.get('id')], auth)
  }
}

function renderPlaylistAddRemove (props) {
  const { storeKey, auth, jumbotron, upstreamContext } = props
  const data = jumbotron.getIn([storeKey, 'data'], Map())
  if (!auth.get('jwt')) {
    return null
  }
  return (
    <PlaylistAddRemove
      upstreamContext={upstreamContext}
      contentId={data.get('id')}
    />
  )
}

class Jumbotron extends PureComponent {
  componentDidMount () {
    updateData(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (!process.env.BROWSER) {
      return
    }
    updateData(nextProps)
  }

  render () {
    const { props } = this
    const {
      storeKey,
      location,
      jumbotron,
      auth,
      page,
      setOverlayDialogVisible,
      upstreamContext,
    } = props
    const data = jumbotron.getIn([storeKey, 'data'], Map())
    let aggregateUpstreamContent

    switch (data.getIn(['type', 'content'])) {
      case TYPE_CONTENT_SUBCATEGORY:
        return (
          <JumbotronSubcategory
            auth={auth}
            title={data.get('title', '')}
            description={data.get('description', '')}
            heroImage={data.get('heroImage')}
            setOverlayDialogVisible={setOverlayDialogVisible}
            id={data.get('id')}
          />
        )
      case TYPE_CONTENT_VIDEO:
      case TYPE_CONTENT_VIDEO_YOGA:
      case TYPE_CONTENT_VIDEO_FITNESS:
      case TYPE_CONTENT_VIDEO_MEDITATION:
        aggregateUpstreamContent = updateUpstreamContext(upstreamContext, 'videoId', data.get('id'))
        return (
          <JumbotronVideo
            path={data.get('path')}
            id={data.get('id')}
            seriesId={data.get('seriesId')}
            type={data.getIn(['type', 'content'])}
            heroImage={data.get('heroImage')}
            title={data.get('title')}
            duration={data.get('runtime')}
            yogaLevel={data.get('yogaLevel')}
            yogaStyle={data.get('yogaStyle')}
            yogaLevelPath={data.get('yogaLevelPath')}
            yogaStylePath={data.get('yogaStylePath')}
            yogaDurationPath={data.get('yogaDurationPath')}
            yogaTeacherPath={data.get('yogaTeacherPath')}
            fitnessStyle={data.get('fitnessStyle')}
            fitnessLevel={data.get('fitnessLevel')}
            fitnessLevelPath={data.get('fitnessLevelPath')}
            fitnessStylePath={data.get('fitnessStylePath')}
            fitnessDurationPath={data.get('fitnessDurationPath')}
            fitnessInstructorPath={data.get('fitnessInstructorPath')}
            meditationStyle={data.get('meditationStyle')}
            host={data.get('host')}
            guest={data.get('guest')}
            year={data.get('year')}
            vote={data.get('vote')}
            voteDown={data.get('voteDown')}
            location={location}
            auth={auth}
            voteId={data.get('id')}
            playlistAddRemoveComponent={renderPlaylistAddRemove(
              _assign({}, props, { upstreamContext: aggregateUpstreamContent }),
            )}
            preview={data.get('preview')}
            feature={data.get('feature')}
            upstreamContext={aggregateUpstreamContent}
          />
        )
      case TYPE_CONTENT_EPISODE:
      case TYPE_CONTENT_EPISODE_YOGA:
      case TYPE_CONTENT_EPISODE_FITNESS:
      case TYPE_CONTENT_EPISODE_MEDITATION:
      case TYPE_CONTENT_SEGMENT:
      case TYPE_CONTENT_SEGMENT_YOGA:
      case TYPE_CONTENT_SEGMENT_FITNESS:
      case TYPE_CONTENT_SEGMENT_MEDITATION:
        aggregateUpstreamContent = updateUpstreamContext(upstreamContext, 'videoId', data.get('id'))
        return (
          <JumbotronEpisode
            path={data.get('path')}
            id={data.get('id')}
            type={data.getIn(['type', 'content'])}
            heroImage={data.get('heroImage')}
            title={data.get('title')}
            seriesId={data.get('seriesId')}
            seriesTitle={data.get('seriesTitle')}
            episode={data.get('episode')}
            season={data.get('season')}
            host={data.get('host')}
            guest={data.get('guest')}
            duration={data.get('runtime')}
            yogaLevel={data.get('yogaLevel')}
            yogaStyle={data.get('yogaStyle')}
            yogaLevelPath={data.get('yogaLevelPath')}
            yogaStylePath={data.get('yogaStylePath')}
            yogaDurationPath={data.get('yogaDurationPath')}
            fitnessStyle={data.get('fitnessStyle')}
            fitnessLevel={data.get('fitnessLevel')}
            fitnessLevelPath={data.get('fitnessLevelPath')}
            fitnessStylePath={data.get('fitnessStylePath')}
            fitnessDurationPath={data.get('fitnessDurationPath')}
            meditationStyle={data.get('meditationStyle')}
            year={data.get('year')}
            vote={data.get('vote')}
            voteDown={data.get('voteDown')}
            location={location}
            auth={auth}
            voteId={data.get('id')}
            playlistAddRemoveComponent={renderPlaylistAddRemove(
              _assign({}, props, { upstreamContext: aggregateUpstreamContent }),
            )}
            seriesPath={data.get('seriesPath')}
            preview={data.get('preview')}
            feature={data.get('feature')}
            page={page}
            upstreamContext={aggregateUpstreamContent}
          />
        )
      case TYPE_CONTENT_SERIES:
      case TYPE_CONTENT_SERIES_YOGA:
      case TYPE_CONTENT_SERIES_FITNESS:
      case TYPE_CONTENT_SERIES_MEDITATION:
      case TYPE_CONTENT_SEGMENTED:
      case TYPE_CONTENT_SEGMENTED_YOGA:
      case TYPE_CONTENT_SEGMENTED_FITNESS:
      case TYPE_CONTENT_SEGMENTED_MEDITATION:
        return (
          <JumbotronSeries
            id={data.get('id')}
            auth={auth}
            heroImage={data.get('heroImage')}
          />
        )
      default:
        return <BannerPlaceholder />
    }
  }
}

Jumbotron.propTypes = {
  user: ImmutablePropTypes.map.isRequired,
  jumbotron: ImmutablePropTypes.map.isRequired,
  storeKey: PropTypes.string.isRequired,
  resolver: ImmutablePropTypes.map.isRequired,
  getJumbotronData: PropTypes.func.isRequired,
  getJumbotronDataUserInfo: PropTypes.func.isRequired,
  setJumbotronDataPlaceholder: PropTypes.func.isRequired,
  // setJumbotronDataUserPlaylist: PropTypes.func.isRequired,
  resetJumbotronData: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  video: ImmutablePropTypes.map,
  page: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  setOverlayDialogVisible: PropTypes.func,
  upstreamContext: ImmutablePropTypes.map,
}

Jumbotron.contextTypes = {
  store: PropTypes.object.isRequired,
}

// eslint-disable-next-line import/no-mutable-exports
let connectedJumbotron = connectRedux(
  state => ({
    user: state.user,
    auth: state.auth,
    resolver: state.resolver,
    jumbotron: state.jumbotron,
    video: state.video,
    page: state.page,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      getJumbotronData: actions.jumbotron.getJumbotronData,
      getJumbotronDataUserInfo: actions.jumbotron.getJumbotronDataUserInfo,
      setJumbotronDataPlaceholder:
        actions.jumbotron.setJumbotronDataPlaceholder,
      // setJumbotronDataUserPlaylist:
      //   actions.jumbotron.setJumbotronDataUserPlaylist,
      resetJumbotronData: actions.jumbotron.resetJumbotronData,
      setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
    }
  },
)(Jumbotron)
connectedJumbotron = connectLanguage({ createOnLanguageChange })(
  connectedJumbotron,
)

export default connectedJumbotron
