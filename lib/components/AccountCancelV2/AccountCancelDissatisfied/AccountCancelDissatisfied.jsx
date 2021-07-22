import React from 'react'
import compose from 'recompose/compose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import Row from 'components/Row.v2'
import { List } from 'immutable'
import { getPrimary } from 'services/languages'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { FR, DE, ES } from 'services/languages/constants'

const documentary = 'documentary'

const MEDIA_ITEMS_EN = [
  {
    name: 'area51',
    type: documentary,
  },
  {
    name: 'heal',
    type: documentary,
  },
  {
    name: 'psychedelica',
  },
  {
    name: 'initiation',
  },
  {
    name: 'deep-space',
  },
]

const MEDIA_ITEMS_ES = [
  {
    name: 'heal',
    type: documentary,
  },
  {
    name: 'psychedelica',
  },
  {
    name: 'initiation-es',
  },
  {
    name: 'yogic-paths-es',
  },
]

const MEDIA_ITEMS_DE = [
  {
    name: 'area51',
    type: documentary,
  },
  {
    name: 'ancient-civ-de ',
  },
  {
    name: 'psychedelica',
  },
  {
    name: 'yogic-paths-de',
  },
]

const MEDIA_ITEMS_FR = [
  {
    name: 'ancient-civ-fr',
  },
  {
    name: 'psychedelica',
  },
  {
    name: 'initiation-fr',
  },
  {
    name: 'rewired_fr',
  },
]

function getThumbnail (language) {
  switch (language) {
    case ES:
      return MEDIA_ITEMS_ES
    case DE:
      return MEDIA_ITEMS_DE
    case FR:
      return MEDIA_ITEMS_FR
    default:
      return MEDIA_ITEMS_EN
  }
}

function AccountCancelDissatisfied (props) {
  const { auth, staticText, userLanguage } = props

  const getClassName = (element = null, modifier = null) => {
    const baseClassName = ['account-cancel-dissatisfied']
    const className = [baseClassName]
    if (modifier) className.push(`${baseClassName}__${element}--${modifier}`)
    if (element) className.push(`${baseClassName}__${element}`)
    return className.join(' ')
  }

  const renderItem = (item) => {
    const newSeason = staticText.getIn(['data', 'newSeason'])
    const newDoc = staticText.getIn(['data', 'newDocumentary'])
    return (
      <React.Fragment>
        <div className={getClassName('image', item.name)} />
        <div className={getClassName('banner', item.name)}>
          <span className={getClassName('banner-text', item.name)}>
            {
              item.type === documentary ?
                newDoc :
                newSeason
            }
          </span>
        </div>
      </React.Fragment>
    )
  }

  return (
    <div className={getClassName('container', null)}>
      <div className={getClassName('container-message', null)}>
        {staticText.getIn(['data', 'comingSoon'])}
      </div>
      <Row
        createAccessor={() => null}
        items={List(getThumbnail(userLanguage))}
        auth={auth}
        useShelfV1
        inverted
        disableHover
      >
        {item => renderItem(item, props)}
      </Row>
    </div>
  )
}

AccountCancelDissatisfied.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  userLanguage: PropTypes.string,
}

export default compose(
  connectStaticText({ storeKey: 'accountCancelDissatisfied' }),
  connectRedux(
    state => ({
      auth: state.auth,
      userLanguage: getPrimary(state.user.getIn(['data', 'language'], List())),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setUserComp: actions.subscription.setUserComp,
      }
    },
  ),
)(AccountCancelDissatisfied)
