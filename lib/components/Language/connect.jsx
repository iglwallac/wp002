import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _omit from 'lodash/omit'
import _partial from 'lodash/partial'
import _isFunction from 'lodash/isFunction'
import { connect as connectRedux } from 'react-redux'
import { Map, List } from 'immutable'
import { getBoundActions } from 'actions'

const COMPONENT_NAME =
  process.env.NODE_ENV === 'production' ? 'lc' : 'LanguageConnect'

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

function getLangFromProps (props) {
  const { languageConnectState } = props
  const { user = Map() } = languageConnectState
  return user.getIn(['data', 'language'], List()) || List()
}

function wrapComponent (options, WrappedComponent) {
  const { createOnLanguageChange } = options

  if (!_isFunction(createOnLanguageChange)) {
    throw new Error(
      'LanguageConnect - createOnLanguageChange must be a function and is a required parameter.',
    )
  }

  class LanguageConnect extends PureComponent {
    componentWillReceiveProps (nextProps) {
      if (!process.env.BROWSER) {
        return
      }

      const lang = getLangFromProps(this.props)
      const nextLang = getLangFromProps(nextProps)
      const { languageConnectActions } = nextProps
      const { onLanguageChange } = languageConnectActions

      if (!nextLang.equals(lang)) {
        onLanguageChange(nextLang)
      }
    }

    render () {
      if (WrappedComponent) {
        return (
          <WrappedComponent
            {..._omit(this.props, [
              'languageConnectState',
              'languageConnectActions',
            ])}
          />
        )
      }
      return null
    }
  }

  LanguageConnect.displayName = `${COMPONENT_NAME}(${getDisplayName(
    WrappedComponent,
  )})`

  LanguageConnect.propTypes = {
    languageConnectState: PropTypes.shape({
      user: ImmutablePropTypes.map.isRequired,
    }),
    languageConnectActions: PropTypes.shape({
      onLanguageChange: PropTypes.func.isRequired,
    }),
  }

  const connectedLanguageConnect = connectRedux(
    state => ({
      languageConnectState: {
        user: state.user,
      },
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        languageConnectActions: {
          onLanguageChange: createOnLanguageChange(actions),
        },
      }
    },
  )(LanguageConnect)

  return connectedLanguageConnect
}

// eslint-disable-next-line import/prefer-default-export
export function connect (options) {
  return _partial(wrapComponent, options)
}
