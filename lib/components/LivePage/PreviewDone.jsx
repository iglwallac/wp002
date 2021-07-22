import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import Button from 'components/Button'
import { UPGRADE_NOW_URL, JOIN_NOW_URL, JOIN_NOW_QUERY } from 'services/live-access-events/constants'

class PreviewDone extends React.PureComponent {
  render () {
    const { props } = this
    const { staticText, auth, line1, line2 } = props
    const subscriptions = auth.getIn(['subscriptions'])
    const isEntitled = subscriptions && !!subscriptions.size
    const buttonText = isEntitled ? staticText.getIn(['data', 'upgradeNow']) : staticText.getIn(['data', 'joinNow'])
    const url = isEntitled ? UPGRADE_NOW_URL : JOIN_NOW_URL
    const query = isEntitled ? null : JOIN_NOW_QUERY
    return (
      <div className="preview-done">
        <div>
          <div className="preview-done__label1">
            {line1 || staticText.getIn(['data', 'previewDoneLabel1'])}
          </div>
          <div className="preview-done__label2">
            {line2 || staticText.getIn(['data', 'previewDoneLabel2'])}
          </div>
          <Button
            buttonClass={'button button--primary'}
            text={buttonText}
            url={url}
            query={query}
          />
        </div>
      </div>
    )
  }
}

export default compose(
  connectStaticText({ storeKey: 'livePage' }),
  connectRedux(
    state => ({
      auth: state.auth,
    }),
  ))(PreviewDone)
