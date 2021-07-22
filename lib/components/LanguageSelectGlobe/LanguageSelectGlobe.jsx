import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { get as getConfig } from 'config'
import Filter from 'components/Filter'
import _omit from 'lodash/omit'
import { Map, List } from 'immutable'
import { isAnonymousHome, isGetStarted } from 'services/url'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectRouter } from 'components/Router/connect'
import { getBoundActions } from 'actions'
import { historyRedirect } from 'services/navigation'
import { compose } from 'recompose'

const { features } = getConfig()

function createDefaultOption (langs, languagePreference) {
  return langs.find(v => v.get('value') === languagePreference)
}

class LanguageSelectGlobe extends React.PureComponent {
  //
  onChange = (target) => {
    const { props } = this
    const {
      auth,
      history,
      location,
      setFeatureTrackingDataPersistent,
      setEventUserInteraction,
    } = props

    const { value: language } = target
    setFeatureTrackingDataPersistent({
      data: Map({ userLanguages: List([language]) }),
      auth,
    })
    const category = auth.get('jwt') ? 'authenticated' : 'anonymous'
    setEventUserInteraction({
      category: `${category} language select globe`,
      action: 'selected primary language',
      label: language,
      value: 'selected',
      location,
    })
    // This sets assumes that there is no secondary language support
    if (!auth.get('jwt')) {
      // For anonymous users just change the URL
      historyRedirect({
        url: location.pathname,
        query: _omit(location.query, ['language']),
        language,
        history,
        auth,
      })
    }
  }

  render () {
    if (features.languageSelectGlobeAnonymous) {
      const { props } = this
      const { auth, languages, userLanguage, location } = props
      const classes = ['language-select-globe']
      const languagePreference = userLanguage.get(0, 'en')
      const langs = languages.get('data', List()).filter(lang =>
        ((features.languageSelectFr && lang.get('name') === 'Français') ||
          (features.languageSelectDe && lang.get('name') === 'Deutsch') ||
          ['Français', 'Deutsch'].indexOf(lang.get('name')) < 0),
      )
      if (isAnonymousHome(location.pathname, auth.get('jwt'))) {
        classes.push('language-select-globe--homepage')
      }
      if (isGetStarted(location.pathname)) {
        classes.push('language-select-globe--get-started')
      }
      return (
        <div className={classes.join(' ')}>
          <Filter
            label=""
            className={['language-select-globe__control']}
            labelClassName={['language-select-globe__label']}
            defaultOption={createDefaultOption(langs, languagePreference)}
            onChange={this.onChange}
            options={langs}
          />
        </div>
      )
    }
    return null
  }
}

LanguageSelectGlobe.propTypes = {
  languages: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setFeatureTrackingDataPersistent: PropTypes.func.isRequired,
  getLanguagesData: PropTypes.func.isRequired,
  setEventUserInteraction: PropTypes.func.isRequired,
}

export default compose(
  connectRouter(),
  connectRedux(
    state => ({
      auth: state.auth,
      languages: state.languages,
      userLanguage: state.user.getIn(['data', 'language']),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setFeatureTrackingDataPersistent:
          actions.featureTracking.setFeatureTrackingDataPersistent,
        getLanguagesData: actions.languages.getLanguagesData,
        setEventUserInteraction: actions.eventTracking.setEventUserInteraction,
      }
    },
  ),
  connectStaticText({
    storeKey: 'languageSelect',
  }),
)(LanguageSelectGlobe)
