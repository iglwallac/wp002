import PropTypes from 'prop-types'
import React from 'react'

export const HERO_IMAGE_OVERLAY_OPACITY_SUPER_LIGHT = 'overlaySuperLight'
export const HERO_IMAGE_OVERLAY_OPACITY_LIGHT = 'overlayLight'
export const HERO_IMAGE_OVERLAY_OPACITY_MEDIUM = 'overlayMedium'
export const HERO_IMAGE_OVERLAY_OPACITY_DARK = 'overlayDark'
export const HERO_IMAGE_OVERLAY_LEFT_TO_RIGHY_OPACITY = 'leftToRight'
export const HERO_IMAGE_OVERLAY_TO_RIGHY_OPACITY_DARK = 'toRightDark'

function getClassName (className) {
  return ['hero-image'].concat(className || []).join(' ')
}

class HeroImage extends React.PureComponent {
  //
  constructor (props) {
    super(props)
    this.state = {
      loaded: false,
    }
  }

  componentDidMount () {
    const imageSrc = this.getTrueImage()
    if (imageSrc) {
      this.Image = new Image()
      this.Image.src = this.getTrueImage()
      this.Image.onload = () => {
        this.setState(() => ({ loaded: true }))
        this.destroyImage()
      }
    }
  }

  componentWillUnmount () {
    this.destroyImage()
  }

  getTrueImage () {
    const { props } = this
    const { alwaysUseProps } = props
    if (alwaysUseProps || !this.url) {
      const { url, largeUrl, mediumUrl, smallUrl } = props
      this.url = url || largeUrl || mediumUrl || smallUrl
    }
    return this.url
  }

  destroyImage () {
    if (this.Image) {
      this.Image.onload = null
      this.Image = null
    }
  }

  renderImage () {
    const { state } = this
    const { loaded } = state
    const imageUrl = this.getTrueImage()
    const style = imageUrl && loaded ? {
      backgroundImage: `url(${imageUrl})`,
    } : {}
    return (
      <div className={`hero-image__hero${loaded ? ' loaded' : ''}`}>
        <div className="hero-image__image" style={style} />
      </div>
    )
  }

  renderOverlay () {
    const { props } = this
    const { hasOverlay, overlayOpacity, overlayClassName } = props
    if (hasOverlay) {
      const base = 'hero-image__overlay'
      const className = [base].concat(overlayClassName || [])
      // _isArray(overlayClassName) ? overlayClassName : [],
      if (overlayOpacity === HERO_IMAGE_OVERLAY_OPACITY_SUPER_LIGHT) {
        className.push(`${base}--super-light`)
      } else if (overlayOpacity === HERO_IMAGE_OVERLAY_OPACITY_LIGHT) {
        className.push(`${base}--light`)
      } else if (overlayOpacity === HERO_IMAGE_OVERLAY_OPACITY_MEDIUM) {
        className.push(`${base}--medium`)
      } else if (overlayOpacity === HERO_IMAGE_OVERLAY_OPACITY_DARK) {
        className.push(`${base}--dark`)
      } else if (overlayOpacity === HERO_IMAGE_OVERLAY_LEFT_TO_RIGHY_OPACITY) {
        className.push(`${base}--left-to-right`)
      } else if (overlayOpacity === HERO_IMAGE_OVERLAY_TO_RIGHY_OPACITY_DARK) {
        className.push(`${base}--to-right-dark`)
      }
      return <div className={className.join(' ')} />
    }
    return null
  }

  render () {
    const { props } = this
    const { className } = props
    return (
      <div className={getClassName(className)}>
        {this.renderOverlay()}
        {this.renderImage()}
      </div>
    )
  }
}

HeroImage.props = {
  className: PropTypes.array,
  overlayClassName: PropTypes.array,
  url: PropTypes.string,
  smallUrl: PropTypes.string,
  mediumSmallUrl: PropTypes.string,
  mediumUrl: PropTypes.string,
  largeUrl: PropTypes.string,
  hasOverlay: PropTypes.bool,
  alwaysUseProps: PropTypes.bool,
  overlayOpacity: PropTypes.string,
}

export default HeroImage
