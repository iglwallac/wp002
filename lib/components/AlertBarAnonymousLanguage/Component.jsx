import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import Link from 'components/Link'
import _partial from 'lodash/partial'
import { List } from 'immutable'
import { getBrowserLanguage } from 'browser/language'

import strings from './strings.json'

function _onClick (props) {
  const langs = List([getBrowserLanguage()])
  const {
    auth,
    setUserDataLanguage,
    setAlertBarVisible,
    setAlertBarDismissed,
    setEventUserInteraction,
    setUserDataLanguageAlertBarAccepted,
  } = props
  setUserDataLanguage(langs)
  setUserDataLanguageAlertBarAccepted(auth, true)
  setAlertBarVisible(false)
  setAlertBarDismissed(true)
  setEventUserInteraction({
    category: 'anonymous language alert bar',
    action: 'clicked',
    label: langs.get(0),
  })
}

function AlertBarAnonymousLanguage (props) {
  const _partialOnClick = _partial(_onClick, props)
  const language = getBrowserLanguage()
  const { setEventUserInteraction } = props

  useEffect(() => {
    setEventUserInteraction({
      category: 'anonymous language alert bar',
      action: 'displayed',
      label: language,
    })
  }, [language])

  return (
    <div className="alert-bar--anonymous-language">
      <Link rel={'nofollow'} to="" onClick={_partialOnClick}>
        <span className="alert-bar--anonymous-language">{strings.message[language]}</span>
      </Link>
    </div>
  )
}

AlertBarAnonymousLanguage.propTypes = {
  setUserDataLanguage: PropTypes.func.isRequired,
  setAlertBarVisible: PropTypes.func.isRequired,
  setEventUserInteraction: PropTypes.func.isRequired,
  setUserDataLanguageAlertBarAccepted: PropTypes.func.isRequired,
  setAlertBarDismissed: PropTypes.func.isRequired,
}

export default connectRedux(
  state => ({
    auth: state.auth,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setUserDataLanguage: actions.user.setUserDataLanguage,
      setAlertBarVisible: actions.alertBar.setAlertBarVisible,
      setEventUserInteraction: actions.eventTracking.setEventUserInteraction,
      setUserDataLanguageAlertBarAccepted: actions.user.setUserDataLanguageAlertBarAccepted,
      setAlertBarDismissed: actions.alertBar.setAlertBarDismissed,
    }
  },
)(AlertBarAnonymousLanguage)
