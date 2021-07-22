import React from 'react'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import { Map } from 'immutable'
import SpotlightBanner from 'components/SpotlightBanner'
import SpotlightMinimized from 'components/SpotlightMinimized'
import SpotlightAutoplayTrailerBanner from 'components/SpotlightAutoplayTrailerBanner'
import {
  createUpstreamContext,
  SCREEN_TYPE_MEMBER_HOME,
} from 'services/upstream-context'
import {
  TYPE_CONTENT_SERIES,
  TYPE_CONTENT_VIDEO,
} from 'services/content-type'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { DaytonaCase, DaytonaSwitch, DaytonaDefault } from 'components/Daytona'
import SpotlightAd from 'components/Daytona/Campaigns/WA-6/SpotlightAd'
import { MERCHANDISING_CLICK_EVENT } from 'services/event-tracking'
import { MH_SPOTLIGHT_COLLAPSED_KEY } from 'services/feature-tracking'

const PLACEMENT_PAYLOAD_TYPE_MERCHANDISING_CONTENT = 'merchandising-content'
const TRAILER = 'trailer'
const CONTEXT_TYPE = 'pm/spotlight'

const getLabel = (placement, staticText) => {
  if (placement.get('payloadType') === PLACEMENT_PAYLOAD_TYPE_MERCHANDISING_CONTENT) {
    const label = placement.getIn(['payload', 'contentItems', 0, 'label'], '')
    return label
  }
  return staticText.getIn(['data', 'topVideoForYou'])
}

class Spotlight extends React.Component {
  componentWillUnmount () {
    const {
      viewMode,
      deletePMSection,
      sectionId,
    } = this.props
    if (viewMode === TRAILER) {
      deletePMSection(sectionId)
    }
  }

  render () {
    const { props } = this
    const {
      app,
      language,
      page,
      auth,
      history,
      hasSectionData,
      hasPlacementData,
      hasContentData,
      contentData: data,
      pmPlacement,
      payloadType,
      campaignId,
      viewMode,
      staticText,
      sectionId,
      sectionIndex,
      itemIndex: index,
      contentId,
      contentType,
      score,
      videoTasteSegment,
      source,
      filters,
      merchEventId,
      merchEventData,
      spotlightMinimized,
      showMinimizeButton,
    } = props

    const classNames = ['section-placement__wrapper']

    if (viewMode === TRAILER) {
      classNames.push('section-placement__wrapper--trailer')
    }

    if (!hasSectionData) {
      return null
    }

    if (!hasPlacementData || !hasContentData) {
      classNames.push('section-placement__wrapper--placeholder')
      return <div className={classNames.join(' ')} />
    }


    if (!contentId) {
      return 'error - missing data'
    }

    const label = getLabel(pmPlacement, staticText)
    let upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_MEMBER_HOME,
      contextType: CONTEXT_TYPE,
      campaignId,
      source,
      score,
      videoTasteSegment,
      sectionId,
      sectionIndex,
      itemIndex: index,
      contentId,
      contentType,
      filters,
      merchEventId,
    })

    if (contentType === TYPE_CONTENT_VIDEO) {
      upstreamContext = upstreamContext.set('videoId',
        data.get('id'))
    }
    if (contentType === TYPE_CONTENT_SERIES) {
      upstreamContext = upstreamContext.set('seriesId', data.get('id'))
    }

    let tileBanner = (
      <SpotlightBanner
        app={app}
        language={language}
        page={page}
        auth={auth}
        upstreamContext={upstreamContext}
        history={history}
        label={label}
        data={data}
        merchEventData={merchEventData}
        showMinimizeButton={showMinimizeButton}
      />
    )

    const mediaId = data.getIn(['preview', 'id'])
    if (mediaId && payloadType === 'merchandising-content' && viewMode === TRAILER) {
      /*
        - override tileBanner with new autoplay banner, but pass default tileBanner through as
          children for fallback purposes at mobile breakpoint
      */
      tileBanner = (
        <SpotlightAutoplayTrailerBanner
          app={app}
          language={language}
          page={page}
          auth={auth}
          label={label}
          data={data}
          mediaId={mediaId}
          key="banner-0"
          upstreamContext={upstreamContext}
          playlist={data.getIn(['userInfo', 'playlist'])}
          merchEventData={merchEventData}
          showMinimizeButton={showMinimizeButton}
        >
          {tileBanner}
        </SpotlightAutoplayTrailerBanner>
      )
    }

    tileBanner = spotlightMinimized ?
      (<SpotlightMinimized
        data={data}
        auth={auth}
        merchEventData={merchEventData}
        upstreamContext={upstreamContext}
      />)
      : tileBanner
    return (
      <div className={classNames.join(' ')}>
        <DaytonaSwitch>
          <DaytonaCase campaign="WA-6">
            {(campaign, variation, subject) => (
              <SpotlightAd
                subject={subject}
                campaign={campaign}
                variation={variation}
              />
            )}
          </DaytonaCase>
          <DaytonaDefault unwrap>
            {tileBanner}
          </DaytonaDefault>
        </DaytonaSwitch>
      </div>
    )
  }
}

export default compose(
  connectStaticText({ storeKey: 'memberHome' }),
  connectRedux(
    (state, props) => {
      const { sectionId } = props
      const language = state.user.getIn(['data', 'language', 0], 'en')
      // Get section
      const sectionStore = state.pmSection.get(sectionId, Map())
      const hasSectionData = sectionStore.has('data')
      const section = sectionStore.get('data', Map())
      const placementName = section.getIn(['data', 'placement'])

      // Get placement
      const placementStore = state.pmPlacement.getIn([placementName, language], Map())
      const placementProcessing = placementStore.get('processing')

      const pmPlacement = placementStore.get('data', Map())
      const payloadType = pmPlacement.get('payloadType')
      let contentType = pmPlacement.getIn(['payload', 'type'])

      let contentId = pmPlacement.getIn(['payload', 'id'])

      let hasPlacementData = !!contentId

      const source = pmPlacement.getIn(['payload', 'pineSource'], null)
      const score = pmPlacement.getIn(['payload', 'pineScore'], null)

      let viewMode
      let campaignId
      let merchEventData
      const merchEventId = pmPlacement.get('merchEventId', null)
      if (payloadType === PLACEMENT_PAYLOAD_TYPE_MERCHANDISING_CONTENT) {
        viewMode = pmPlacement.getIn(['payload', 'viewMode'])
        contentType = pmPlacement.getIn(['payload', 'contentItems', 0, 'contentType'])
        contentId = pmPlacement.getIn(['payload', 'contentItems', 0, 'contentId'])
        hasPlacementData = !!contentId
        const campaignName = pmPlacement.getIn(['payload', 'slug'])
        campaignId = pmPlacement.getIn(['payload', 'id'])
        const eventLabel = `${campaignName} | ${campaignId} | ${language} | ${placementName}`
        merchEventData = MERCHANDISING_CLICK_EVENT
          .set('eventLabel', eventLabel)
          .set('contentId', contentId)
          .set('contentType', contentType)
      }

      // Get content
      let hasContentData = false
      let processing = false
      let contentData = Map()

      if (contentType === TYPE_CONTENT_VIDEO) {
        const videoStore = state.videos.getIn([contentId, language], Map())
        hasContentData = videoStore.has('data')
        processing = videoStore.get('processing', false)
        contentData = videoStore.get('data', Map())
      }
      if (contentType === TYPE_CONTENT_SERIES) {
        const seriesStore = state.series.getIn([contentId, language], Map())
        hasContentData = seriesStore.has('data')
        processing = seriesStore.get('processing', false)
        contentData = seriesStore.get('data', Map())
      }

      const videoTasteSegment = contentData.getIn(['reason', 'videoTasteSegment'], null)

      return {
        app: state.app,
        page: state.page,
        auth: state.auth,
        hasSectionData,
        hasPlacementData,
        hasContentData,
        processing,
        campaignId,
        contentData,
        payloadType,
        pmPlacement,
        placementName,
        placementProcessing,
        language,
        viewMode,
        contentType,
        contentId,
        merchEventId,
        source,
        score,
        videoTasteSegment,
        merchEventData,
        spotlightMinimized: state.featureTracking.getIn(['data', MH_SPOTLIGHT_COLLAPSED_KEY]),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        deletePMSection: actions.pmSection.deletePMSection,
      }
    },
  ),
)(Spotlight)
