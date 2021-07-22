
import PropTypes from 'prop-types'
import truncate from 'lodash/truncate'
import { List, fromJS } from 'immutable'
import React, { useCallback, useState } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { MEDIA_OPTIONS } from 'services/portal'
import { TYPE_PORTAL_V2_SHARE } from 'services/dialog'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import SocialButton, { SOCIAL_BUTTON_SIZES } from 'components/SocialButton'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { Button, TYPES } from 'components/Button.v2'
import { H2, H4, H5, HEADING_TYPES } from 'components/Heading'
import UserAvatar from 'components/UserAvatar'

function getSocialMediaLinks (urls) {
  const options = fromJS(MEDIA_OPTIONS)
  return options.reduce((acc, option) => {
    const type = option.get('type')
    const link = urls.find(l => (
      l.get('type') === type
    ))
    if (link) {
      return acc.push(link)
    }
    return acc
  }, List())
}

function getCoverCls (portal) {
  const portalCover = portal.getIn(['data', 'coverPhotoKey'])
  const noAccess = portal.get('error') || !portal.get('allowAccess')
  const cls = ['portal-v2-profile__header-wrapper']
  if (noAccess) cls.push('portal-v2__cover--none')
  if (portalCover && !noAccess) cls.push(`portal-v2__cover--${portalCover}`)
  if (!portalCover && !noAccess) cls.push('portal-v2__cover--default')
  return cls.join(' ')
}


function getHeaderCls (noAccess, hasInfo, isPortalOwner, urls) {
  const cls = ['portal-v2-profile__header']
  if (noAccess) cls.push('portal-v2-profile__header--no-access')
  if (!hasInfo && isPortalOwner && urls.size < 1) cls.push('portal-v2-profile__header--empty-bio')
  return cls.join(' ')
}

function renderBio (tagline, desc, staticText, bioIsExpanded, onExpandBio, hasInfo) {
  const linkText = staticText.get(bioIsExpanded ? 'readLess' : 'readMore')
  const className = ['portal-v2-profile__bio-des']
  const shouldExpand = desc && desc.length > 250
  const type = bioIsExpanded
    ? ICON_TYPES.CHEVRON_UP
    : ICON_TYPES.CHEVRON_DOWN

  if (!hasInfo) {
    return null
  }

  if (bioIsExpanded) {
    className.push('open')
  }

  return (
    <div className="portal-v2-profile__bio">
      {tagline ? (
        <H4 as={HEADING_TYPES.H5} className="portal-v2-profile__bio-title">
          {tagline}
        </H4>
      ) : null}
      {desc ? (
        <p
          className={className.join(' ')}
          data-teaser={truncate(desc, { length: 250 })}
        ><span>{desc}</span>
        </p>
      ) : null}
      {shouldExpand ? (
        <Button type={BUTTON_TYPES.LINK} onClick={onExpandBio}>
          {linkText}
          <IconV2 type={type} />
        </Button>
      ) : null}
    </div>
  )
}

function renderSocialMedia (urls, staticText, hasInfo) {
  const socialMediaLinks = getSocialMediaLinks(urls)
  return socialMediaLinks.size ? (
    <div className={hasInfo
      ? 'portal-v2-profile__info-social-media'
      : 'portal-v2-profile__info-social-media portal-v2-profile__info-social-media--left'}
    >
      <H5 as={HEADING_TYPES.H6}>{staticText.get('followMe')}</H5>
      <ul>
        {socialMediaLinks.map(media => (
          <li key={media.get('id')}>
            <SocialButton
              size={SOCIAL_BUTTON_SIZES.SMALL}
              type={media.get('type')}
              to={media.get('url')}
            />
          </li>
        ))}
      </ul>
    </div>
  ) : null
}

function onReturnFocus () {
  // TO DO: Solve forward ref problem
  return null
}

export default function Profile ({
  auth,
  modes,
  portal,
  setMode,
  staticText,
  renderModal,
}) {
  const isAnon = !auth.get('jwt')
  const allowAccess = portal.get('allowAccess')
  const isPortalOwner = portal.get('isPortalOwner')
  const userImage = portal.getIn(['data', 'profilePicture'], '')
  const urls = portal.getIn(['data', 'userPortalUrls'], List())
  const uuid = portal.getIn(['data', 'uuid'])
  const userPortalUrl = portal.getIn(['data', 'url'], '')
  const verifiedAuthentic = portal.getIn(['data', 'verifiedAuthentic'], false)
  const portalError = portal.get('error')
  const displayName = portal.getIn(['data', 'displayName'])
  const noAccess = portal.get('error') || !portal.get('allowAccess')
  let noAccessText = !allowAccess ? staticText.get('noAccess', '') : null
  noAccessText = portalError ? staticText.get('doesNotExist', '') : noAccessText
  const desc = portal.getIn(['data', 'description'], '')
  const tagline = portal.getIn(['data', 'tagline'], '')
  const hasInfo = !!(desc || tagline)

  const [bioIsExpanded, expandBio] = useState(false)

  const onExpandBio = useCallback(() => {
    expandBio(!bioIsExpanded)
  }, [bioIsExpanded])

  const editPortal = useCallback(() => {
    setMode(modes.PROFILE_EDIT)
  }, [])

  const onClickShareUsersPortal = useCallback(() => {
    renderModal(TYPE_PORTAL_V2_SHARE, {
      title: staticText.get('shareUsersPortal', '').replace(/\$\{displayName\}/, displayName),
      url: `${global.location.origin}/portal/${userPortalUrl}?utm_source=portal`,
      onReturnFocus,
      staticText,
    })
    if (global.dataLayer) {
      global.dataLayer.push({
        event: 'customEvent',
        eventCategory: 'User Engagement',
        eventAction: 'share button',
        eventLabel: 'portal share',
      })
    }
  }, [staticText])

  return (
    <section className={'portal-v2-profile'}>
      <div className={getCoverCls(portal)}>
        <div className={noAccess ? '' : 'portal-v2-profile__gradient'} />
        <header className={getHeaderCls(noAccess, hasInfo, isPortalOwner, urls)}>
          <div className="portal-v2-profile__header-content">
            <div className={!portalError ? 'portal-v2-profile__avatar-gradient' : ''}>
              <UserAvatar path={userImage} />
            </div>
            <div className="portal-v2-profile__header-text">
              <div className="portal-v2-profile__header-text-container">
                <H2
                  className="portal-v2-profile__title"
                  inverted={!noAccess}
                  as={[HEADING_TYPES.H4_MOBILE, HEADING_TYPES.H3_DESKTOP]}
                >
                  {portalError ? staticText.get('unknownPortal') : displayName}
                </H2>
                {verifiedAuthentic ? (
                  <span className="portal-v2-profile__verified" role="presentation">
                    <IconV2 type={ICON_TYPES.CHECK} />
                    {!noAccess && <span>{staticText.get('verifiedAuthentic')}</span> }
                  </span>
                ) : null}
              </div>
              {noAccess ? (
                <H5 as={[HEADING_TYPES.H5_MOBILE, HEADING_TYPES.H5_DESKTOP]} >
                  {noAccessText}
                </H5>
              ) : null}
            </div>
          </div>
          <div className="portal-v2-profile__actions">
            {allowAccess && !isPortalOwner && !isAnon ? (
              <div className="portal-v2-profile__actions-follow">
                <NotificationsFollowButton
                  subscriptionType={SUBSCRIPTION_TYPES.MEMBER}
                  type={BUTTON_TYPES.PILL}
                  contentId={uuid}
                />
              </div>
            ) : null}
            {allowAccess ? (
              <Button
                className="portal-v2-profile__actions-share"
                onClick={onClickShareUsersPortal}
                type={TYPES.ICON_PRIMARY}
                icon={ICON_TYPES.SHARE}
                shadow
              />
            ) : null}
            {isPortalOwner ? (
              <Button
                className="portal-v2-profile__actions-edit"
                type={TYPES.ICON_PRIMARY}
                icon={ICON_TYPES.PENCIL}
                onClick={editPortal}
                shadow
              />
            ) : null}
          </div>
        </header>
      </div>
      {allowAccess && (hasInfo || urls.size > 0) ? (
        <div className="portal-v2-profile__info">
          {renderBio(tagline, desc, staticText, bioIsExpanded, onExpandBio, hasInfo)}
          {renderSocialMedia(urls, staticText, hasInfo)}
        </div>
      ) : null}
    </section>
  )
}

Profile.defaultProps = {
  isPortalOwner: false,
  allowAccess: false,
}

Profile.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  portal: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  renderModal: PropTypes.func.isRequired,
  isPortalOwner: PropTypes.bool,
  allowAccess: PropTypes.bool,
}
