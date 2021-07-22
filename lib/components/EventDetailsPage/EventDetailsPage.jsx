import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { getSeo } from 'services/url'
import { connect as connectStaticText } from 'components/StaticText/connect'
import SocialSharingButtons from 'components/SocialSharingButtons'
import Button from 'components/Button'
import { getFacebookHref, getTwitterHref } from 'services/share'
import { isEventCancelled } from 'components/EventsPage/EventList'
import Banner from './Banner'
import EventInformation from './EventInformation'
import Logistics from './Logistics'
import Schedule from './Schedule'
import PromoVideoBanner from './PromoVideoBanner'

const LIVE_ACCESS_URL = '/live-access'

function componentFromHTML (html) {
  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

const getEventDetails = (props) => {
  const { location, language } = props
  const route = location.pathname.split('/').pop()
  props.getLiveAccessEventDetails({ language, id: route })
}

const BuyTicket = ({ eventDetails, staticText }) => {
  if (eventDetails === undefined) { return null }
  return (
    <Button
      buttonClass={`event-details-page__buy-tickets ${!eventDetails.get('ticketsAvailable') ? 'button--disabled' : 'button--primary'}`}
      text={staticText.getIn(['data', eventDetails.get('ticketsAvailable') ? 'buyTicket' : 'soldOut'])}
      target="_blank"
      url={eventDetails.get('ticketsAvailable') ? eventDetails.get('ticketing') : undefined}
      disabled={!eventDetails.get('ticketsAvailable')}
    />
  )
}

const TicketingFrame = ({ data }) => {
  const [src, height] = data.split(',')
  const style = {
    height,
    width: '100%',
    border: 'none',
  }
  return (
    <div className="event-details-page__ticketing">
      <iframe
        className="event-details__ticketing-iframe"
        title="live-access-tickets"
        src={src}
        style={style}
      />
    </div>
  )
}

const EventsDetailPage = (props) => {
  useEffect(() => {
    getEventDetails(props)
  }, [])

  useEffect(() => {
    const { location, eventDetails } = props
    if (eventDetails) {
      const speakerName = eventDetails.get('speakerName')
      const titleShort = eventDetails.get('titleShort')
      const title = `${eventDetails.get('speakerIds').size === 1 ? `${speakerName} - ` : ''}${titleShort}`
      props.setPageSeo(
        {
          ...getSeo({
            pathname: location.pathname,
            loggedIn: !!props.auth.get('jwt'),
          }),
          title,
          ogTitle: title,
          location,
          noIndex: false,
          noFollow: false,
        },
      )
    }
  }, [props.eventDetails])

  useEffect(() => {
    getEventDetails(props)
  }, [props.language])

  const { eventDetails, staticText, location, language, query } = props
  const route = location.pathname.split('/').pop()
  if (eventDetails === undefined) { return null }
  const socialSharingLink = `https://gaia.com/events/${route}`
  const trackSchedule = eventDetails.getIn(['tracks', 0, 'schedule'])
  const hasSchedule = trackSchedule && trackSchedule.size > 0
  const infoHeaders =
    [
      staticText.getIn(['data', 'eventOverview']),
      staticText.getIn(['data', 'eventDetails']),
      staticText.getIn(['data', 'bio']),
    ]
  const infoContents =
    [
      componentFromHTML(eventDetails.get('overview')),
      componentFromHTML(eventDetails.get('descriptionLong')),
      componentFromHTML(eventDetails.get('speakerBio')),
    ]
  if (hasSchedule) {
    infoHeaders.splice(2, 0, staticText.getIn(['data', 'schedule']))
    infoContents.splice(2, 0, <Schedule route={route} language={language} />)
  }

  const ticketingiFrameUrl = eventDetails.get('ticketingIframeUrl')
  if (ticketingiFrameUrl) {
    infoHeaders.push(staticText.getIn(['data', 'tickets']))
    infoContents.push(<TicketingFrame data={ticketingiFrameUrl} />)
  }

  const promoUrl = eventDetails.get('promoUrl')
  const dateString = isEventCancelled(eventDetails.get('startDate')) ?
    staticText.getIn(['data', 'cancelled']) : eventDetails.get('localeTitleDate')

  return (
    <div className="event-details-page">
      {promoUrl ? <PromoVideoBanner
        speaker={eventDetails.get('speakerName')}
        dateText={dateString}
        title={eventDetails.get('titleShort')}
        media={eventDetails.get('heroMedia')}
        promoUrl={promoUrl}
      /> : <Banner
        speaker={eventDetails.get('speakerIds').size === 1 && eventDetails.get('speakerName')}
        dateText={dateString}
        title={eventDetails.get('titleShort')}
        location={eventDetails.get('venueLocation')}
        media={eventDetails.get('heroMedia')}
      />
      }
      <div className="top-bar-wrapper">
        <div className="top-bar">
          <BuyTicket staticText={staticText} eventDetails={eventDetails} />
          <div className="share-wrapper">
            <div className="share-label">
                Share:
            </div>
            <SocialSharingButtons
              facebookUrl={getFacebookHref(socialSharingLink, true)}
              twitterUrl={getTwitterHref(socialSharingLink, eventDetails.get('twitterText'), '', '', true)}
            />
          </div>
        </div>
      </div>
      <div id="event-information">
        <EventInformation
          speaker={eventDetails.get('speakerName')}
          title={eventDetails.get('title')}
          sale={`${staticText.getIn(['data', 'ticketsOnSale'])} ${eventDetails.get('ticket_sale_date')}`}
          startDate={eventDetails.get('localeStartDate')}
          endDate={eventDetails.get('localeEndDate')}
          headers={infoHeaders}
          selectedIndex={parseInt(query.get('default'), 10) || 0}
          contents={infoContents}
        />
      </div>
      <div className="online-experience-section">
        <div className="online-experience-heading">{staticText.getIn(['data', 'cantAttend'])}</div>
        <p />
        <div>
          <Button
            buttonClass={'button--secondary with-border'}
            text={staticText.getIn(['data', 'moreInfo'])}
            url={LIVE_ACCESS_URL}
            scrollToTop
          />
        </div>
      </div>
      <Logistics title={staticText.getIn(['data', 'planYourStay'])} staticText={staticText} />
    </div>
  )
}

EventsDetailPage.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        auth: state.auth,
        app: state.app,
        eventDetails: state.liveAccessEvents.getIn(['eventDetails', state.user.getIn(['data', 'language', 0], 'en'), 'data', 'event']),
        language: state.user.getIn(['data', 'language', 0], 'en'),
        query: state.resolver.get('query'),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPageSeo: actions.page.setPageSeo,
        getLiveAccessEventDetails: actions.liveAccessEvents.getLiveAccessEventDetails,
      }
    },
  ),
  connectStaticText({ storeKey: 'eventDetailsPage' }),
)(EventsDetailPage)
