import React, { useState } from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { List } from 'immutable'
import TileHoverVideo from 'components/TileHover/TileHoverVideo'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { createUpstreamContext, SCREEN_TYPE_GUIDES, CONTEXT_TYPE_GUIDES } from 'services/upstream-context'

const getTotalVideoDuration = (contentIds, videos) => {
  return Math.ceil(contentIds.map(x => x.get('contentId')).reduce((accumulator, contentId) => {
    return videos.getIn([contentId, 'duration']) + accumulator
  }, 0) / 60)
}

const GuideDay = (props) => {
  const { day, displayType, staticText, videos, guideId } = props
  const [expanded, setExpanded] = useState(true)
  const isNumberedDay = Boolean(day.get('dayNumber'))
  const videosSize = day.get('guideDayVideos').size
  const upstreamContext = createUpstreamContext({
    screenType: SCREEN_TYPE_GUIDES,
    contextType: CONTEXT_TYPE_GUIDES,
    guideId,
    guideDayId: day.get('nid'),
  })

  return (
    <div className="guide-day">
      <div className="guide-day__number-wrapper">
        <div className="guide-day__sub-type">
          {isNumberedDay && staticText.getIn(['data', `${displayType}-singular`])}
        </div>
        <div className="guide-day__number">
          {day.get('dayNumber')}
        </div>
      </div>
      <div className="guide-day__info">
        <div className="guide-day__header">
          <div className="guide-day__info-header">
            {isNumberedDay && `${staticText.getIn(['data', `${displayType}-singular`])} ${day.get('dayNumber')}: `}{day.get('title')}
            <IconV2
              className="guide-day__chevron"
              type={expanded ?
                ICON_TYPES.CHEVRON_UP :
                ICON_TYPES.CHEVRON_DOWN}
              onClick={() => setExpanded(!expanded)}
            />
          </div>
          <div className="guide-day__description">
            {day.getIn(['fields', 'body', 0, 'value'])}
          </div>
        </div>
        <div className="guide-day__videos">
          {videosSize === 1 ? <span>{videosSize} {staticText.getIn(['data', 'video'])}</span> : <span>{videosSize} {staticText.getIn(['data', 'videos'])}</span>}
        </div>
        <div className="guide-day__progress">
          <IconV2 type={ICON_TYPES.CLOCK} className="guide-day__clock" />
          {getTotalVideoDuration(day.get('guideDayVideos'), videos)} {staticText.getIn(['data', 'minsToComplete'])}
        </div>
        {
          expanded ?
            <div className="guide-day__video-list">
              {day.get('guideDayVideos').map((video) => {
                const videoContentId = video.get('contentId')
                return (
                  <div className="guide-day__video" key={videoContentId}>
                    <TileHoverVideo
                      id={videoContentId}
                      upstreamContext={upstreamContext}
                      hovered={isNumberedDay}
                      hideShelf={isNumberedDay}
                    />
                  </div>
                )
              })}
            </div> :
            null
        }
      </div>
    </div>
  )
}
const GuideDays = (props) => {
  const { guideDays, guideDaysList, language, displayType, videos, staticText, guideId } = props
  if (!(guideDaysList.size && guideDays.size)) {
    return null
  }
  return (
    guideDaysList.map(e => e.get('contentId')).map((contentId) => {
      const day = guideDays.getIn([contentId, language, 'data'])
      return (day &&
        <GuideDay
          day={day}
          displayType={displayType}
          key={contentId}
          videos={videos}
          staticText={staticText}
          guideId={guideId}
        />
      )
    })
  )
}

export default compose(
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const guideId = state.resolver.getIn(['data', 'id'])
      return {
        language,
        guideId,
        guideDaysList: state.guides.getIn([guideId, language, 'data', 'guideDays'], List([])),
        guideDays: state.guideDays,
        displayType: state.guides.getIn([guideId, language, 'data', 'display_type'], ''),
        videos: state.videos.map(e => e.getIn([language, 'data'])),
      }
    },
  ),
)(GuideDays)
