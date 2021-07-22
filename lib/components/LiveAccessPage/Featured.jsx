import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { H2 } from 'components/Heading'

const FeaturedListItem = ({ event, language, staticText }) => {
  const { startDate, endDate, route, eventThumbnailUrl, seriesUrl, title } = event.toJS()
  const sdate = new Date(startDate)
  const edate = new Date(endDate)
  const url = seriesUrl || (route && `/events/${route}`)
  const headShotClassName = `live-access-page__featured__list__item__thumbnail__container${
    !url ? ' live-access-page__featured__list__item__thumbnail__container--unavailable' : ''}`
  return (
    <li className="live-access-page__featured__list__item">
      <div className={headShotClassName}>
        <a href={url || ''}>
          <img
            className="live-access-page__featured__list__item__thumbnail"
            alt={title}
            src={eventThumbnailUrl || ''}
          />
          {seriesUrl &&
            <div className="live-access-page__featured__list__item__on-demand-badge__container">
              <div className="live-access-page__featured__list__item__on-demand-badge">
                {staticText.getIn(['data', 'onDemandNow'])}
              </div>
            </div>
          }
        </a>
        {url ? null : <div className="live-access-page__featured__list__item__coming-soon__container">
          <div className="live-access-page__featured__list__item__coming-soon">
            {staticText.getIn(['data', 'comingSoon'])}
          </div>
        </div>
        }
      </div>
      <div className="live-access-page__featured__list__item__speaker">
        {event.get('speakerName')}
      </div>
      <div className="live-access-page__featured__list__item__dates">
        {sdate.toLocaleString(language, { month: 'long' })} {sdate.getDate()}-{edate.getDate()}, {sdate.getFullYear()}
      </div>
    </li>
  )
}

const Featured = ({ eventsList, language, staticText, getLiveAccessEventList }) => {
  useEffect(() => {
    getLiveAccessEventList(language, true)
  }, [language])

  if (!eventsList) { return null }
  return (
    <div className="live-access-page__featured">
      <H2 className="live-access-page__featured__title">
        {staticText.getIn(['data', 'featuredSpeakers'])}
      </H2>
      <div className="live-access-page__featured__list">
        {eventsList.filter(event => event.get('featured')).map(event =>
          (<FeaturedListItem
            event={event}
            language={language}
            key={event.get('id')}
            staticText={staticText}
          />),
        )}
      </div>
    </div>
  )
}

Featured.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        language: state.user.getIn(['data', 'language', 0], 'en'),
        eventsList: state.liveAccessEvents.getIn(['eventsList',
          state.user.getIn(['data', 'language', 0], 'en'), 'data', 'events']),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getLiveAccessEventList: actions.liveAccessEvents.getLiveAccessEventList,
      }
    },
  ),
  connectStaticText({ storeKey: 'liveAccessPage' }),
)(Featured)

