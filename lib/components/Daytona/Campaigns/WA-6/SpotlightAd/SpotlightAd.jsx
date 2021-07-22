import React from 'react'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import Button from 'components/Button'
import get from 'lodash/get'
import split from 'lodash/split'
import size from 'lodash/size'
import isString from 'lodash/isString'
import { dispatchWhen } from 'services/dispatch-when'
import { updateSubject, deactivateSubject } from 'services/testarossa'
import { SET_EVENT_PAGE_VIEWED } from 'services/event-tracking/actions'
import HeroImage from 'components/HeroImage'
import { SPOTLIGHT_AD_IMPRESSION_EVENT, SPOTLIGHT_AD_CLICK_EVENT } from 'services/event-tracking'

class SpotlightAd extends React.PureComponent {
  //
  componentDidMount () {
    const { props, sendGaSpotlightEvent } = this
    const { campaign = {}, variation = {}, subject = {} } = props

    const data = get(variation, 'data', {})
    const impressionLimit = get(data, ['config', 'value', 'impressionLimit'], 5)
    const impressions = get(subject, ['variables', 'impressions'], 0)

    let total = impressions + 1
    // there is a bug here with older subjects where their
    // impression variables were "[object object]111111" so we're fixing this...
    if (isString(total)) {
      total = size(split(total, '1'))
    }

    updateSubject({ campaign, variables: { impressions: total } })

    if (total >= impressionLimit) {
      dispatchWhen(SET_EVENT_PAGE_VIEWED, () => {
        deactivateSubject({ campaign })
      })
    } else {
      sendGaSpotlightEvent(SPOTLIGHT_AD_IMPRESSION_EVENT)
    }
  }

  onClickCTA = () => {
    const { props } = this
    const { campaign = {} } = props
    dispatchWhen(SET_EVENT_PAGE_VIEWED, () => {
      deactivateSubject({ campaign })
    })
  }

  getWrapperClass () {
    const { props } = this
    const { variation = {} } = props
    const config = get(variation, ['data', 'config', 'value'], {})
    const backgroundOverlay = get(config, 'backgroundOverlay', 'none')
    return `spotlight-ad__wrapper overlay-${backgroundOverlay}`
  }

  getContentClass () {
    const { props } = this
    const { variation = {} } = props
    const config = get(variation, ['data', 'config', 'value'], {})
    const theme = get(config, 'theme', 'light')
    const pronounced = get(config, 'pronounced', false)
    return `spotlight-ad__content ${theme}${pronounced ? ' pronounced' : ''}`
  }

  sendGaSpotlightEvent = (event) => {
    const { setDefaultGaEvent, variation = {} } = this.props
    const eventData = event.set('eventLabel', get(variation, 'name', 'unknown/missing/???'))
    setDefaultGaEvent(eventData)
  }

  renderCTA () {
    const { props, sendGaSpotlightEvent, onClickCTA } = this
    const { variation = {} } = props
    const { data = {} } = variation

    const property = get(data, 'cta', {})
    const label = get(property, 'label', '')
    const value = get(property, 'value', '')
    const target = get(property, 'target', '')

    if (label && value) {
      return (
        <Button
          onClick={() => { sendGaSpotlightEvent(SPOTLIGHT_AD_CLICK_EVENT); onClickCTA() }}
          buttonClass={['button', 'button--primary']}
          target={target === '_blank' ? '_blank' : null}
          text={label}
          url={value}
        />
      )
    }
    return null
  }

  renderHeroImage () {
    const { props } = this
    const { variation = {} } = props
    const { data = {} } = variation
    const image = get(data, ['image', 'value'], '')
    return (
      <HeroImage
        className={['spotlight-ad__img']}
        url={image}
      />
    )
  }

  renderElement (propertyName) {
    const { props } = this
    const { variation = {} } = props
    const { data = {} } = variation

    const property = get(data, propertyName, {})
    const element = get(property, 'element', '')
    const value = get(property, 'value', '')

    if (element && value) {
      return React.createElement(element, {
        className: `spotlight-ad__${propertyName}`,
      }, [value])
    }
    return null
  }

  render () {
    return (
      <div className={this.getWrapperClass()}>
        {this.renderHeroImage()}
        <div className={this.getContentClass()}>
          {this.renderElement('label')}
          {this.renderElement('title')}
          {this.renderElement('body')}
          {this.renderCTA()}
        </div>
      </div>
    )
  }
}

export default connectRedux(
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
    }
  },
)(SpotlightAd)
