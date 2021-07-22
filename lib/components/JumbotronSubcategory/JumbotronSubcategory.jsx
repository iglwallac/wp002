import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import SubcategoryDescription from 'components/SubcategoryDescription'
import HeroImage, { HERO_IMAGE_OVERLAY_TO_RIGHY_OPACITY_DARK } from 'components/HeroImage'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import WithAuth from 'components/WithAuth'
import { H1 } from 'components/Heading'

function getClassName (hasAuth, description) {
  const className = ['jumbotron-subcategory']
  if (!hasAuth) {
    className.push('jumbotron-subcategory--show-cta')
  }
  if (!description) {
    className.push('jumbotron-subcategory--no-description')
  }
  return className.join(' ')
}

function JumbotronSubcategory (props) {
  const {
    auth,
    title,
    description,
    heroImage,
    staticText,
    setOverlayDialogVisible,
    id,
  } = props
  const hasAuth = auth.get('jwt', false)

  return (
    <div className={getClassName(hasAuth, description)}>
      <HeroImage
        className={['jumbtron-subcategory__background-hero']}
        hasOverlay
        overlayOpacity={HERO_IMAGE_OVERLAY_TO_RIGHY_OPACITY_DARK}
        smallUrl={heroImage.get('small')}
        mediumSmallUrl={heroImage.get('mediumSmall')}
        mediumUrl={heroImage.get('medium')}
        largeUrl={heroImage.get('large')}
      />
      <div className="jumbotron-subcategory__wrapper">
        <H1 inverted className="jumbotron-subcategory__title">{title}</H1>
        <SubcategoryDescription
          description={description}
          setOverlayDialogVisible={setOverlayDialogVisible}
        />
        {id ? (
          <WithAuth>
            <NotificationsFollowButton
              subscriptionType={SUBSCRIPTION_TYPES.TERM}
              type={BUTTON_TYPES.ROUND}
              contentId={id}
              title={title}
            />
          </WithAuth>
        ) : null}
      </div>
      {hasAuth ? null : (
        <div className="jumbotron-subcategory__signup-container">
          <ButtonSignUp
            text={staticText.get('signUpToStartWatching')}
            buttonClass={['button--primary', 'jumbotron-subcategory__signup-cta']}
            type={BUTTON_SIGN_UP_TYPE_BUTTON}
            scrollToTop
          />
        </div>
      )}
    </div>
  )
}

JumbotronSubcategory.propTypes = {
  auth: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  heroImage: ImmutablePropTypes.map.isRequired,
  setOverlayDialogVisible: PropTypes.func,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default connect(state => ({
  staticText: state.staticText.getIn([
    'data',
    'jumbotronSubcategory',
    'data',
  ]),
}))(JumbotronSubcategory)
