import get from 'lodash/get'
import set from 'lodash/set'
import split from 'lodash/split'
import parseInt from 'lodash/parseInt'
import isBoolean from 'lodash/isBoolean'
import { Map } from 'immutable'
import React, { PureComponent } from 'react'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import FormsyForm from 'formsy-react'
import PropTypes from 'prop-types'
import { TextInput } from 'components/FormInput.v2'
import SocialButton, { SOCIAL_BUTTON_TYPES, SOCIAL_BUTTON_SIZES } from 'components/SocialButton'
import { openWindow, SHARE_LINKS } from 'services/share'
// import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { TARGET_SELF } from 'components/Link'
// import Link, { TARGET_SELF, TARGET_BLANK } from 'components/Link'
// import ShareInterstitial from '../Interstitial'
import ShareEmbed from '../Embed'

function format (time) {
  if (time < 10) {
    return `0${time}`
  }
  return `${time}`
}

function getPlayerTimecode () {
  const { videojs } = global
  if (videojs && videojs.getAllPlayers) {
    const players = videojs.getAllPlayers()
    const player = get(players, 0, undefined)
    try {
      return player ? player.currentTime() : 0
    } catch (e) {
      // Player threw an error just return zero
      return 0
    }
  }
  return 0
}

function formatTimecode (time) {
  const flooredTime = Math.floor(time)
  const seconds = flooredTime % 60
  let minutes = Math.floor(flooredTime / 60)
  const hours = Math.floor(minutes / 60)
  minutes -= hours * 60
  return `${format(hours)}:${format(minutes)}:${format(seconds)}`
}

export function getTimecode (timecode) {
  const parts = split(timecode, ':')
  const hours = parts.length === 3
    ? parseInt(parts[0]) * 3600
    : 0
  const minutes = parts.length >= 2
    ? parseInt(parts[1]) * 60
    : 0
  const seconds = parts.length >= 1
    ? parseInt(parts[2])
    : 0
  return hours + minutes + seconds
}

function getSource (type) {
  switch (type) {
    case SHARE_LINKS.FACEBOOK:
      return 'facebook'
    case SHARE_LINKS.REDDIT:
      return 'reddit'
    case SHARE_LINKS.TWITTER:
      return 'twitter'
    case SHARE_LINKS.EMAIL:
      return 'email'
    default:
      return 'copy'
  }
}

function getShareLink (props, state) {
  const { token, userLang } = props
  const { timecode, openEmbed, includeTimecode } = state
  if (token) {
    const langQuery = `?language[]=${userLang}`
    const timecodeQuery = includeTimecode ? `&startAt=${timecode}` : ''
    const embedQuery = openEmbed ? '&embed=true' : ''
    const queryString = `${langQuery}${timecodeQuery}${embedQuery}&utm_source=share`
    return `${global.location.origin}/share/${token}${queryString}`
  }
  return ''
}

class ModalShare extends PureComponent {
  //
  static getDerivedStateFromProps (props, state) {
    const { interstitialConfirmed } = state
    const { hasShared } = props
    // always update the shareLink
    // if nothing changed, it will not cause a re-render
    const shareLink = getShareLink(props, state)
    const nextState = { shareLink }
    // determine if we should open the interstitial page
    // that explains a first-time share to users.
    if (isBoolean(hasShared) && !interstitialConfirmed) {
      set(nextState, 'view', hasShared ? 'share' : 'interstitial')
      set(nextState, 'interstitialConfirmed', hasShared)
      set(nextState, 'openInterstitial', !hasShared)
    }
    return nextState
  }

  constructor (props) {
    //
    super(props)
    // populate with initial user
    // and video player data
    const { staticText } = props
    const timecode = getPlayerTimecode()

    this.personalizeValidations = {
      matchRegexp: /^[\w@.\s]+$/,
      maxLength: 120,
    }

    this.personalizationErrors = {
      maxLength: staticText.getIn(['data', 'invalidCharacterLimit']),
      matchRegexp: staticText.getIn(['data', 'invalidCharacters']),
    }

    this.timecodeValidations = {
      matchRegexp: /^(\d|:)+$/,
    }

    this.timecodeErrors = {
      matchRegexp: staticText.getIn(['data', 'invalidTimecode']),
    }

    this.state = {
      interstitialConfirmed: false,
      includePersonalization: false,
      initialTimecode: timecode,
      includeTimecode: false,
      personalization: null,
      view: 'loading',
      shareLink: '',
      siteUrl: '',
      timecode,
    }
  }

  componentDidMount () {
    const { props } = this
    const { getUserHasShared } = props
    getUserHasShared()
  }

  componentDidUpdate (prevProps, prevState) {
    const { props, state } = this
    const { token, view, update } = props

    const {
      includePersonalization,
      personalization,
      siteUrl,
    } = state

    const {
      includePersonalization: prevIncludePersonalization,
      personalization: prevPersonalization,
      view: prevView,
    } = prevState

    if (view !== prevView) {
      update()
    }

    if (!includePersonalization && prevIncludePersonalization) {
      this.removePersonalization()
    } else if ((includePersonalization && !prevIncludePersonalization)
      || (includePersonalization && personalization !== prevPersonalization)) {
      this.addPersonalization()
    }

    if (siteUrl && token) {
      this.connectMedia()
    }
  }

  onBlurTimecode = (value) => {
    const { props, state } = this
    const { initialTimecode } = state
    const { duration } = props
    const time = getTimecode(value)

    if (time < duration) {
      return formatTimecode(time)
    }
    return formatTimecode(initialTimecode)
  }

  onChecked = (key, checked) => {
    //
    switch (key) {
      case 'personalization': {
        return this.setState(() => ({
          includePersonalization: checked,
        }))
      }
      case 'timecode':
        return this.setState(() => ({
          includeTimecode: checked,
        }))
      default:
        return null
    }
  }

  onChange = (value, { name, isValidValue }) => {
    if (isValidValue(value)) {
      this.setState(() => ({
        [name]: name === 'timecode'
          ? getTimecode(value)
          : value,
      }))
    }
    return value
  }

  openEmbed = () => {
    const { state } = this
    this.createShare(state)
    this.setState(() => ({
      openEmbed: true,
      view: 'embed',
    }))
  }

  // closeModal = () => {
  //   const { props } = this
  //   const { clearShare, dismissModal } = props
  //   clearShare()
  //   dismissModal()
  // }

  connectMedia () {
    const { state, props } = this
    const { setShareSource, token } = props
    const { siteUrl, shareLink } = state

    const source = getSource(siteUrl)
    const shareUrl = encodeURIComponent(shareLink)
    const url = siteUrl.replace('{url}', shareUrl)
      .replace('{user_id}', SHARE_LINKS.GAIA_USER)
      .replace('{title}', this.props.title)

    setShareSource({ token, source })

    if (siteUrl.includes('mailto')) {
      window.location.href = url
    } else {
      openWindow(null, true, url)
    }
    this.setState(() => ({
      siteUrl: '',
    }))
  }

  confirmInterstitial = () => {
    this.setState(() => ({
      interstitialConfirmed: true,
      openInterstitial: false,
      view: 'share',
    }))
  }

  confirmEmbed = () => {
    this.setState(() => ({
      openEmbed: false,
      view: 'share',
    }))
  }

  createShare = (data) => {
    const { props, state } = this
    const { token } = props

    if (!token) {
      const { siteUrl } = data
      const source = getSource(siteUrl)
      const { type, contentId, createShare } = props
      const { personalization, includePersonalization } = state
      createShare({
        personalization: includePersonalization
          ? personalization : null,
        contentId,
        source,
        type,
      })
    }
  }

  addPersonalization () {
    const { props, state } = this
    const { personalization } = state
    const { token, addPersonalization } = props

    if (this.timer) {
      clearTimeout(this.timer)
    }

    if (token && personalization) {
      this.timer = setTimeout(() => {
        addPersonalization({ personalization, token })
        this.timer = null
      }, 1000)
    }
  }

  removePersonalization () {
    const { props } = this
    const { token, removePersonalization } = props
    if (token) {
      removePersonalization({ token })
    }
  }

  shareMedia (siteUrl) {
    return (e) => {
      e.preventDefault()
      const { state } = this
      this.createShare(state)
      this.setState(() => ({
        siteUrl,
      }))
    }
  }

  render () {
    const { props, state, confirmEmbed } = this // confirmInterstitial,
    const { view, shareLink, personalization, initialTimecode } = state
    const { token, staticText, enableTime, duration } = props

    if (view === 'loading') {
      return <Sherpa type={TYPE_LARGE} />
    }

    // if (view === 'interstitial') {
    //   return (
    //     <ShareInterstitial
    //       onContinue={confirmInterstitial}
    //       staticText={staticText}
    //     />
    //   )
    // }

    if (view === 'embed') {
      return (
        <ShareEmbed
          onContinue={confirmEmbed}
          staticText={staticText}
          shareLink={shareLink}
        />
      )
    }

    const nameOptionClass = enableTime
      ? 'modal-share__option modal-share__option-name'
      : 'modal-share__option modal-share__option-name modal-share__option-name-only'

    return (
      <FormsyForm
        className="modal-share__form"
        onSubmit={this.createShare}
      >
        <div className="modal-share__description">
          {staticText.getIn(['data', 'shareUnlimited'])}
        </div>
        <div className="modal-share__input-wrapper">
          <div className="modal-share__options">
            {enableTime
              ? <div className="modal-share__option modal-share__option-time">
                <TextInput
                  label={staticText.getIn(['data', 'startAt'])}
                  value={formatTimecode(initialTimecode) || ''}
                  validations={this.timecodeValidations}
                  onBlur={this.onBlurTimecode}
                  onChecked={this.onChecked}
                  onChange={this.onChange}
                  duration={duration}
                  autocomplete="off"
                  name="timecode"
                  checkable
                  block
                />
              </div>
              : null}
            <div className={nameOptionClass}>
              <TextInput
                placeholder={staticText.getIn(['data', 'nameHere'])}
                label={staticText.getIn(['data', 'optionalName'])}
                validationErrors={this.personalizationErrors}
                validations={this.personalizeValidations}
                value={personalization || ''}
                onChecked={this.onChecked}
                onChange={this.onChange}
                name="personalization"
                autocomplete="off"
                checkable
                block
              />
            </div>
          </div>
        </div>
        <div className="modal-share__input-wrapper">
          <TextInput
            label={staticText.getIn(['data', 'link'])}
            value={shareLink || ''}
            copyable={!!token}
            autocomplete="off"
            name="link"
            readonly
            block
          />
          {token
            ? null
            : (
              <button
                type="submit"
                className="button button--ghost modal-share__link-btn"
              >
                {staticText.getIn(['data', 'generateLink'])}
              </button>
            )
          }
        </div>
        <div className="modal-share__social">
          <ul className="modal-share__btns modal-share__btns__left">
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.LARGE}
                type={SOCIAL_BUTTON_TYPES.EMBED}
                onClick={this.openEmbed}
                target={TARGET_SELF}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.LARGE}
                type={SOCIAL_BUTTON_TYPES.EMAIL}
                onClick={this.shareMedia(SHARE_LINKS.EMAIL)}
              />
            </li>
          </ul>
          <ul className="modal-share__btns modal-share__btns__right">
            <li className="modal-share__btns__vertical" />
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.LARGE}
                type={SOCIAL_BUTTON_TYPES.TWITTER}
                onClick={this.shareMedia(SHARE_LINKS.TWITTER)}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.LARGE}
                type={SOCIAL_BUTTON_TYPES.FACEBOOK}
                onClick={this.shareMedia(SHARE_LINKS.FACEBOOK)}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.LARGE}
                type={SOCIAL_BUTTON_TYPES.REDDIT}
                onClick={this.shareMedia(SHARE_LINKS.REDDIT)}
              />
            </li>
          </ul>
        </div>
      </FormsyForm>
    )
  }
}

ModalShare.propTypes = {
  contentId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  enableTime: PropTypes.bool,
}

export default connectRedux(
  state => ({
    userReferralId: state.share.getIn(['created', 'data', 'userReferralId'], ''),
    hasShared: state.share.getIn(['hasShared', 'data', 'hasShared']),
    duration: state.video.getIn(['data', 'feature', 'duration'], 0),
    staticText: state.staticText.getIn(['data', 'share'], Map()),
    token: state.share.getIn(['created', 'data', 'token'], ''),
    userLang: state.user.getIn(['data', 'language', 0], 'en'),
    userName: state.user.getIn(['data', 'name'], 'Name'),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      removePersonalization: actions.share.removePersonalization,
      addPersonalization: actions.share.addPersonalization,
      getUserHasShared: actions.share.getUserHasShared,
      setShareSource: actions.share.setShareSource,
      dismissModal: actions.dialog.dismissModal,
      createShare: actions.share.createShare,
      clearShare: actions.share.clearShare,
    }
  })(ModalShare)
