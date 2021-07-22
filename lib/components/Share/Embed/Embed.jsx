import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import FormsyForm from 'formsy-react'
import Button from 'components/Button'
import { Textarea } from 'components/FormInput.v2'

const BUTTON_CLASS = [
  'button--ghost button--with-icon',
  'share-embed__btn',
]

const ICON_CLASS = [
  'icon--left',
]

function generateMarkup (link) {
  if (link) {
    return `
<iframe src="${link}"
  allow="accelerometer; autoplay; encrypted-media; gyroscope;"
  referrerpolicy="no-referrer"
  allowfullscreen
  frameborder="0"
  height="288"
  width="512"
  title="Gaia">
</iframe>`
  }
  return ''
}

export default function Embed (props) {
  const { staticText, shareLink, onContinue } = props
  const onClick = useCallback((e) => {
    e.preventDefault()
    onContinue()
  }, [])
  return (
    <div>
      <div className="modal-share__title">
        {staticText.getIn(['data', 'embed'])}
      </div>
      <FormsyForm
        className="modal-share__form"
      >
        <div className="modal-share__input-wrapper">
          <Textarea
            label={staticText.getIn(['data', 'embedLink'])}
            value={generateMarkup(shareLink)}
            className="share-embed__input"
            autocomplete="off"
            name="embed-link"
            readonly
            copyable
            restrict
            block
            mono
          />
        </div>
        <Button
          buttonClass={BUTTON_CLASS}
          iconClass={ICON_CLASS}
          text="Back to Share"
          onClick={onClick}
        />
      </FormsyForm>
    </div>
  )
}

Embed.propTypes = {
  onContinue: PropTypes.func.isRequired,
  shareLink: PropTypes.string.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}
