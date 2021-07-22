import SocialButton, { SOCIAL_BUTTON_TYPES, SOCIAL_BUTTON_SIZES } from 'components/SocialButton'
import React, { useEffect, useState, useCallback } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { openWindow, SHARE_LINKS } from 'services/share'
import { TextInput } from 'components/FormInput.v2'
import { TARGET_SELF } from 'components/Link'
import FormsyForm from 'formsy-react'
import PropTypes from 'prop-types'

function ModalShare ({
  description,
  staticText,
  title,
  url,
}) {
  const [socialURL, setSocialURL] = useState(null)

  const onClickEmail = useCallback(() => {
    setSocialURL(SHARE_LINKS.EMAIL)
  }, [url])

  const onClickTwitter = useCallback(() => {
    setSocialURL(SHARE_LINKS.TWITTER)
  }, [url])

  const onClickFacebook = useCallback(() => {
    setSocialURL(SHARE_LINKS.FACEBOOK)
  }, [url])

  const onClickReddit = useCallback(() => {
    setSocialURL(SHARE_LINKS.REDDIT)
  }, [url])

  useEffect(() => {
    if (socialURL) {
      const encodeURL = encodeURIComponent(url)
      const destinationURL = socialURL.replace('{url}', encodeURL)
        .replace('{title}', staticText.get('checkOutThisPortal'))
        .replace('{user_id}', title)

      if (socialURL.includes('mailto')) {
        window.location.href = destinationURL
      } else {
        openWindow(null, true, destinationURL)
      }
      setSocialURL(null)
    }
  })

  return (
    <FormsyForm className="modal-share__form">
      <div className="modal-share__input-wrapper">
        {description ? (
          <div className="modal-share__desc">
            {description}
          </div>
        ) : null}
        <TextInput
          label={staticText.get('labelUrl')}
          autocomplete="off"
          value={url || ''}
          name="shareLink"
          copyable
          readonly
          block
        />
      </div>
      <div className="modal-share__social">
        <ul className="modal-share__btns modal-share__btns__left">
          <li>
            <SocialButton
              size={SOCIAL_BUTTON_SIZES.LARGE}
              type={SOCIAL_BUTTON_TYPES.EMAIL}
              onClick={onClickEmail}
              target={TARGET_SELF}
            />
          </li>
        </ul>
        <ul className="modal-share__btns modal-share__btns__right">
          <li className="modal-share__btns__vertical" />
          <li>
            <SocialButton
              size={SOCIAL_BUTTON_SIZES.LARGE}
              type={SOCIAL_BUTTON_TYPES.TWITTER}
              onClick={onClickTwitter}
              target={TARGET_SELF}
            />
          </li>
          <li>
            <SocialButton
              size={SOCIAL_BUTTON_SIZES.LARGE}
              type={SOCIAL_BUTTON_TYPES.FACEBOOK}
              onClick={onClickFacebook}
              target={TARGET_SELF}
            />
          </li>
          <li>
            <SocialButton
              size={SOCIAL_BUTTON_SIZES.LARGE}
              type={SOCIAL_BUTTON_TYPES.REDDIT}
              onClick={onClickReddit}
              target={TARGET_SELF}
            />
          </li>
        </ul>
      </div>
    </FormsyForm>
  )
}

export default ModalShare

ModalShare.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  description: PropTypes.string,
}
