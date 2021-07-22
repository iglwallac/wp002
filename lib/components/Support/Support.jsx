import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List } from 'immutable'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { TARGET_BLANK } from 'components/Link'
import Button from 'components/Button'
import { H3 } from 'components/Heading'
import { getPrimary } from 'services/languages'
import {
  getHelpCenterUrl,
} from 'services/url'

const Support = (props) => {
  const { staticText, userLanguage } = props
  const userPrimaryLanguage = getPrimary(userLanguage)
  return (
    <div className="support">
      <H3 inverted>{ staticText.getIn(['data', 'title']) }</H3>
      <div className="support__body">
        { staticText.getIn(['data', 'body']) } <br /><br />
        { staticText.getIn(['data', 'spain']) }<br />
        { staticText.getIn(['data', 'mexico']) }
      </div>
      <div className="support__container">
        <div className="support__button-container">
          <div className="support__button-cell">
            <Button
              directLink
              url={getHelpCenterUrl(userPrimaryLanguage)}
              text={staticText.getIn(['data', 'supportCenter'])}
              rel="nofollow"
              target={TARGET_BLANK}
              buttonClass={['support__button button--secondary', 'button--stacked', 'button--with-icon']}
              iconClass={['icon-v2--comment']}
            />
          </div>
        </div>
      </div>
    </div>
  )
}


Support.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  userLanguage: ImmutablePropTypes.list.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'support' }),
  connectRedux(
    state => ({
      userLanguage: state.user.getIn(['data', 'language'], List()),
    }),
  ),
)(Support)
