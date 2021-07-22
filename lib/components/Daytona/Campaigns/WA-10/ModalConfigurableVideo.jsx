import React from 'react'
import _get from 'lodash/get'
import Button from 'components/Button'
import { deactivateSubject } from 'services/testarossa'

function formatURL (wa10Variation) {
  const assetURL = _get(wa10Variation, ['data', 'video', 'value'], '')
  if (/^http/i.test(assetURL)) {
    return assetURL
  }
  const { location = {} } = global
  const { origin = '' } = location
  return `${origin}/video/${assetURL}?fullplayer=feature`
}

export default class ModalConfigurableVideo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

    closeModal = () => {
      const { props } = this
      const { close } = props
      deactivateSubject({ campaign: 'WA-10' })
      close()
    }

    render () {
      const { props } = this
      const { v } = props
      const buttonText = _get(v, ['data', 'button', 'value'], '')
      return (
        <div>
          <div className="mcv__wa-10__desc-wrapper">
            <p>{_get(v, ['data', 'description', 'value'], '')}</p>
          </div>
          <div className="mcv__wa-10__iframe-wrapper">
            <iframe
              className="mcv__wa-10__iframe"
              title="video-iframe"
              src={formatURL(v)}
              allowFullScreen
              webkitallowfullscreen="true"
              mozallowafullscreen="true"
            />
          </div>
          {buttonText
            ? <div className="mcv__wa-10__btn-wrapper">
              <Button
                text={buttonText}
                onClick={this.closeModal}
                buttonClass={['button', 'button--secondary']}
              />
            </div>
            : null}
        </div>
      )
    }
}

