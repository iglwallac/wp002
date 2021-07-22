import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { getSeo } from 'services/url'
import Button from 'components/Button'
import { connect as connectStaticText } from 'components/StaticText/connect'
import DropInVideoPlayer from 'components/DropInVideoPlayer'
import {
  BASIC_CONTROLS,
  BASIC_CONTROL_OPTIONS_VOLUME,
} from 'components/DropInVideoPlayer/DropInVideoPlayer'
import { createPlayerSrc } from 'services/brightcove'
import Experience from './Experience'
import EventList from '../EventsPage/EventList'
import { LIVE_ACCESS_SUBSCRIPTION_CODE, UPGRADE_NOW_URL, JOIN_NOW_URL, JOIN_NOW_QUERY } from './constants'

const bannerMediaIdByLanguage = {
  en: 6031111169001,
  es: 6078102783001,
  de: 6031111169001,
  fr: 6031111169001,
}

function componentFromHTML (html) {
  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

class EventsPage extends Component {
  constructor (props) {
    super(props)
    const { language } = props
    props.getLiveAccessEventList(language)
  }

  componentDidMount () {
    const { props } = this
    const {
      auth,
      path,
      setPageSeo,
    } = props
    const footer = document && document.getElementById('footer-app')
    if (footer) {
      footer.classList.add('live-events__events-detail-page__footer-extra-space')
    }
    const seo = getSeo({
      pathname: path,
      loggedIn: Boolean(auth.get('jwt')),
    })
    setPageSeo({
      title: seo.title,
      description: seo.description,
      noFollow: seo.noFollow,
      noIndex: seo.noIndex,
      ogDescription: seo.ogDescription,
      ogTitle: seo.ogTitle,
      ogImage: seo.ogImage,
      twitterCard: seo.twitterCard,
      twitterImage: seo.twitterImage,
      twitterTitle: seo.twitterTitle,
      twitterDescription: seo.twitterDescription,
      location: path,
    })
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const { language } = props
    const { language: prevLanguage } = prevProps

    if (prevLanguage !== language) {
      props.getLiveAccessEventList(language)
    }
  }

  componentWillUnmount () {
    const footer = document && document.getElementById('footer-app')
    if (footer) {
      footer.classList.remove('live-events__events-detail-page__footer-extra-space')
    }
  }

  renderEventList = () => {
    const { props } = this
    const { user, language, staticText, eventsList } = props
    if (!eventsList) { return null }
    const email = user.getIn(['data', 'mail'])
    return (
      <EventList
        eventsList={eventsList}
        language={language}
        staticText={staticText}
        email={email}
      />
    )
  }

  renderExperience = () => {
    const { props } = this
    const { staticText, auth } = props
    const subscriptions = auth.getIn(['subscriptions'])
    const isEntitled = subscriptions && subscriptions.size
    const buttonText = isEntitled ? staticText.getIn(['data', 'upgradeNow']) : staticText.getIn(['data', 'joinNow'])
    const buttonURL = isEntitled ? UPGRADE_NOW_URL : JOIN_NOW_URL
    const buttonQuery = isEntitled ? null : JOIN_NOW_QUERY
    return (
      <div>
        <Experience
          title={staticText.getIn(['data', 'eventExperienceTitle'])}
          cost={`$299.00 ${staticText.getIn(['data', 'perYear'])}`}
          description={staticText.getIn(['data', 'eventExperienceDescription'])}
          buttonText={buttonText}
          url={buttonURL}
          query={buttonQuery}
          backgroundColor="rgba(0, 0, 0,0.25)"
        />
        <div className="fixed-footer">
          <Button
            buttonClass={['button--primary']}
            text={buttonText}
            url={buttonURL}
            query={buttonQuery}
          />
        </div>
      </div>
    )
  }

  renderDebugInfo = () => {
    const { props } = this
    const { isLiveAccessMember } = props
    const username = props.auth.get('username')
    return (
      <pre>
        {!username && <div>I am anonymous user</div>}
        {username && <div>I am {username} with subscriptions: {props.auth.get('subscriptions').toJS().join(':')}</div>}
        I am {!isLiveAccessMember && <span>not</span>} a live access member
      </pre>
    )
  }

  render () {
    const { props } = this
    const { eventsList, debug, language, staticText, isLiveAccessMember } = props
    if (!eventsList) { return null }
    const videoId = bannerMediaIdByLanguage[language]
    const mediaId = 205000

    return (
      <div className="events-page">
        {
          debug ? this.renderDebugInfo() : null
        }
        <div className="events-page__banner">
          <DropInVideoPlayer
            autoplay
            loop
            playsinline
            controls={{
              type: BASIC_CONTROLS,
              visibleControls: [BASIC_CONTROL_OPTIONS_VOLUME],
            }}
            mediaId={Number(mediaId)}
            playerSrc={createPlayerSrc(1263232739001, videoId)}
          />
        </div>
        <div className="events-page__about-events">
          <div className="events-page__about-events__text">
            {componentFromHTML(staticText.getIn(['data', 'aboutEvents']))}
          </div>
        </div>
        {this.renderEventList()}
        <div id="LAM">
          {!isLiveAccessMember && this.renderExperience()}
        </div>
      </div>
    )
  }
}

EventsPage.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      return {
        auth: state.auth,
        app: state.app,
        user: state.user,
        debug: state.resolver.getIn(['query', 'debug']) === 'true',
        isLiveAccessMember: !!state.auth.get('subscriptions') && state.auth.get('subscriptions').includes(LIVE_ACCESS_SUBSCRIPTION_CODE),
        liveAccessEvents: state.liveAccessEvents,
        eventsList: state.liveAccessEvents.getIn(['eventsList',
          language,
          'data', 'events']),
        language,
        query: state.resolver.get('query'),
        path: state.resolver.get('path'),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPageSeo: actions.page.setPageSeo,
        getLiveAccessEventList: actions.liveAccessEvents.getLiveAccessEventList,
      }
    },
  ),
  connectStaticText({ storeKey: 'eventsPage' }),
)(EventsPage)
