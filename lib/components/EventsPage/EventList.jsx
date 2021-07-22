import React from 'react'
import Button from 'components/Button'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { TYPE_LIVE_ACCESS_EMAIL_CAPTURE } from 'services/dialog'
import Link from 'components/Link'
import { H2, H3, H5, H6 } from 'components/Heading'

const moreInfoRoutes = {
  'marisa-peer-changing-your-life-is-easy': '/lp/marisa-peer',
}

const PAST_EVENT_URL = '/topic/past-events'
const ONEDAY = 1000 * 60 * 60 * 24

export const isEventCancelled = (startDate) => {
  return (new Date(startDate).getFullYear()) === 2000
}
export const stripYear = (dateString) => {
  const str = dateString.substring(0, dateString.lastIndexOf(' '))
  return str.split(',')[0]
}

const addModal = (saleInfo, id, remindMe, renderModal, email, staticText) => (
  <div className="saleLine">
    <div>{saleInfo}</div>
    <div className="RemindMe"><span
      className="centerItems"
      onClick={
        () => {
          renderModal(TYPE_LIVE_ACCESS_EMAIL_CAPTURE, {
            title: staticText.getIn(['data', 'ticketReminder']),
            email,
            id,
          })
        }
      }
    ><svg className="RemindMeIcon" />{remindMe}</span></div>
  </div>
)

function ticketsOnSale (onSaleDate, language, ticketsAvailable, staticText,
  renderModal, id, email, onDemand, cancelled) {
  if (onDemand) {
    return (
      <span className="centerItems"><svg className="onDemandIcon" />
        {staticText.getIn(['data', 'onDemand'])}
      </span>
    )
  }
  if (cancelled) {
    return (<div className="SOLD-OUT">{staticText.getIn(['data', 'cancelled'])}</div>)
  }

  if (!ticketsAvailable) {
    return (<div className="SOLD-OUT">{staticText.getIn(['data', 'soldOut'])}</div>)
  }

  const remindMe = staticText.getIn(['data', 'remindMe'])
  let saleInfo = staticText.getIn(['data', 'moreInfoSoon'])
  if (!onSaleDate) {
    return addModal(saleInfo, id, remindMe, renderModal, email, staticText)
  }

  const date = new Date(onSaleDate)
  if (Date.now() > date.getTime()) {
    return (<span className="centerItems"><svg className="ticketIcon" />{staticText.getIn(['data', 'onSaleNow'])}</span>)
  }

  const preSaleDate = new Date(date.getTime() - (7 * ONEDAY))
  const preSale = `${preSaleDate.toLocaleString(language, { month: 'long' })} ${preSaleDate.getDate()}`
  const sale = `${date.toLocaleString(language, { month: 'long' })} ${date.getDate()}`
  saleInfo = `${staticText.getIn(['data', 'preSale'])}: ${preSale} | ${staticText.getIn(['data', 'onSale'])}: ${sale}`

  return addModal(saleInfo, id, remindMe, renderModal, email, staticText)
}

const renderButton = (route, staticText, seriesUrl, language) => {
  const enabled = !!(route || seriesUrl)
  let moreInfo
  if (route) {
    if (language === 'en' && route in moreInfoRoutes) { moreInfo = moreInfoRoutes[route] } else {
      moreInfo = new RegExp(/^\//).test(route) ?
        route : `/events/${route}`
    }
  }
  const buttonClass = enabled ? ['button--secondary'] : ['button--disabled']
  const text = (seriesUrl && staticText.getIn(['data', 'watchNow'])) ||
    (moreInfo && staticText.getIn(['data', 'moreInfo'])) ||
    staticText.getIn(['data', 'comingSoon'])
  return enabled ?
    <Button
      buttonClass={buttonClass}
      text={text}
      url={seriesUrl || moreInfo}
      scrollToTop
    /> :
    <Button
      buttonClass={buttonClass}
      text={text}
      disabled
    />
}
const EventItem = ({ details, language, staticText, renderModal, email }) => {
  const { descriptionShort, route, eventThumbnailUrl,
    ticketSaleDate, ticketsAvailable, id, routeEnabled, seriesUrl, localeTitleDate,
    titleShort, speakerNames, startDate } = details.toJS()
  const cancelled = isEventCancelled(startDate)
  const dateString = cancelled ? stripYear(localeTitleDate) : localeTitleDate

  return (
    <div className="event-item">
      <img
        className="event-item__thumbnail"
        src={eventThumbnailUrl || ''}
        alt="thumbnail"
      />
      <div className="event-item__title-speaker">
        {titleShort && <H3 className="event-item__title">{titleShort}</H3>}
        {(speakerNames.length === 1 && speakerNames[0]) && <H5 className="event-item__speaker">{speakerNames[0]}</H5>}
      </div>
      <div className="event-item__saleText">{ticketsOnSale(ticketSaleDate, language,
        ticketsAvailable, staticText, renderModal, id, email, !!seriesUrl, cancelled)}
      </div>
      <div className="event-item__long-description">
        {descriptionShort}
      </div>
      <H6 className="event-item__dates">{dateString}</H6>
      <div className="event-item__cta">
        {renderButton(routeEnabled && route, staticText, seriesUrl, language)}
      </div>
    </div >
  )
}

export const EventItemHOC = compose(
  connectRedux(
    (state) => {
      return {
        auth: state.auth,
        app: state.app,
        user: state.user,
        liveAccessEvents: state.liveAccessEvents,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        renderModal: actions.dialog.renderModal,
      }
    },
  ),
  connectStaticText({ storeKey: 'eventsPage' }),
)(EventItem)

const EventList = ({ eventsList, language, email, staticText }) => {
  return (
    <div className="event-list" >
      <div className="event-list-header">
        <H2 className="event-list__upcoming">{staticText.getIn(['data', 'upcomingEvents'])}</H2>
        <div className="event-list__past">
          <H6>
            <Link
              text={staticText.getIn(['data', 'pastEvents'])}
              to={PAST_EVENT_URL}
            />
          </H6>
        </div>
      </div>
      <hr />
      {eventsList && eventsList.map(eventDetail =>
        (<EventItemHOC
          key={eventDetail.get('id')}
          details={eventDetail}
          language={language}
          isExpanded
          email={email}
        />),
      )}
    </div >
  )
}

export default EventList
