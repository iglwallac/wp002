import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { get as getConfig } from 'config'
import Filter from 'components/Filter'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import { Map, List } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import { historyRedirect } from 'services/navigation'
import { compose } from 'recompose'

const config = getConfig()

function createDefaultOption (langs, languagePreference) {
  return langs.find(v => v.get('value') === languagePreference)
}

class LanguageQuickSelect extends React.PureComponent {
  //
  onChange = (target) => {
    const { props, context } = this
    const { history } = context
    const { auth, location, setFeatureTrackingDataPersistent } = props
    const { value: language } = target

    setFeatureTrackingDataPersistent({
      data: Map({ userLanguages: List([language]) }),
      auth,
    })
    // This sets assumes that there is no secondary language support
    if (!auth.get('jwt')) {
      // For anonymous users just change the URL
      historyRedirect({
        query: _omit(location.query, ['language']),
        url: location.pathname,
        language,
        history,
        auth,
      })
    }
  }

  render () {
    const { props } = this
    const { languages, languagePreference, staticText } = props
    const betaLabel = `${staticText.getIn([
      'data',
      'myLanguage',
    ])} - ${staticText.getIn(['data', 'beta'])}`

    const allowSelectFr = !!_get(config, 'features.languageSelectFr')
    const allowSelectDe = !!_get(config, 'features.languageSelectDe')
    const langs = languages.get('data', List()).filter(lang =>
      ((allowSelectFr && lang.get('name') === 'Français') ||
        (allowSelectDe && lang.get('name') === 'Deutsch') ||
        ['Français', 'Deutsch'].indexOf(lang.get('name')) < 0),
    )
    return (
      <div className="language-quick-select">
        <Filter
          options={langs}
          label={betaLabel}
          onChange={this.onChange}
          className={['language-quick-select__control']}
          labelClassName={['language-quick-select__label']}
          defaultOption={createDefaultOption(langs, languagePreference)}
        />
      </div>
    )
  }
}

LanguageQuickSelect.propTypes = {
  languages: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  getLanguagesData: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setFeatureTrackingDataPersistent: PropTypes.func.isRequired,
}

LanguageQuickSelect.contextTypes = {
  history: PropTypes.object.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'languageSelect' }),
  connectRedux(
    state => ({
      languagePreference: state.user.getIn(['data', 'language', 0], 'en'),
      location: state.resolver.get('location'),
      languages: state.languages,
      auth: state.auth,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setFeatureTrackingDataPersistent:
          actions.featureTracking.setFeatureTrackingDataPersistent,
        getLanguagesData: actions.languages.getLanguagesData,
      }
    },
  ),
)(LanguageQuickSelect)
