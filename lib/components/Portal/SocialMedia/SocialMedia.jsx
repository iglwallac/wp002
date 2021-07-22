import { MEDIA_OPTIONS, VALIDATIONS_SOCIAL } from 'services/portal'
import SocialButton, { SOCIAL_BUTTON_SIZES } from 'components/SocialButton'
import { TextInput } from 'components/FormInput.v2/FormInput'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React, { useMemo, useCallback } from 'react'
import { Map, fromJS } from 'immutable'
import { H4 } from 'components/Heading'
import PropTypes from 'prop-types'


function getLabel (type, text) {
  const key = (type === 'instagram' && 'inputLabelInstagram')
    || (type === 'facebook' && 'inputLabelFacebook')
    || (type === 'twitter' && 'inputLabelTwitter')
    || (type === 'youtube' && 'inputLabelYoutube')
    || 'inputLabelWebsite'
  return text.get(key, '')
}

export default function SocialMedia ({ updateEditor, text, urls }) {
  //
  const options = useMemo(() => (
    fromJS(MEDIA_OPTIONS)
  ), [])

  const validationErrors = useMemo(() => ({
    matchRegexp: text.get('invalidUrl'),
  }), [text])

  const onChange = useCallback((value, { name, identifier }) => {
    const option = options.find(o => o.get('type') === name)
    const domain = option.get('url', '')
    let newVal = value
    if (!value.startsWith(domain)) {
      newVal = domain
    }
    const media = Map({ type: name, url: newVal })
    const mediaList = urls.filter(u => u.get('type') !== name)
    const next = newVal !== domain ? mediaList.push(media) : mediaList
    updateEditor(identifier, next)
    return newVal
  }, [urls])

  return (
    <div className="portal-v2-media__accounts">
      <H4>{text.get('titleConnectedAccounts', '')}</H4>
      <ul className="portal-v2-media__list">
        {options.map((media) => {
          const type = media.get('type')
          const link = urls.find(l => l.get('type') === type) || media
          return (
            <li key={type} className="portal-v2-media__item">
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.XSMALL}
                type={media.get('type')}
                to={media.get('url')}
              />
              <div className="portal-v2-media__account">
                <TextInput
                  validationErrors={validationErrors}
                  validations={VALIDATIONS_SOCIAL}
                  label={getLabel(type, text)}
                  identifier="userPortalUrls"
                  value={link.get('url')}
                  onChange={onChange}
                  autocomplete="off"
                  name={type}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

SocialMedia.propTypes = {
  urls: ImmutablePropTypes.list.isRequired,
  updateEditor: PropTypes.func.isRequired,
  text: ImmutablePropTypes.map.isRequired,
}
