import React from 'react'
import PropTypes from 'prop-types'
import _forEach from 'lodash/forEach'

export const HEADING_TYPES = {
  H1: 'h1',
  H1_DE: 'h1-de',
  H1_FR: 'h1-fr',
  H1_ES: 'h1-es',
  H1_MOBILE: 'h1-mobile',
  H1_DESKTOP: 'h1-desktop',
  H2: 'h2',
  H2_DE: 'h2-de',
  H2_FR: 'h2-fr',
  H2_ES: 'h2-es',
  H2_MOBILE: 'h2-mobile',
  H2_DESKTOP: 'h2-desktop',
  H3: 'h3',
  H3_DE: 'h3-de',
  H3_FR: 'h3-fr',
  H3_ES: 'h3-es',
  H3_MOBILE: 'h3-mobile',
  H3_DESKTOP: 'h3-desktop',
  H4: 'h4',
  H4_DE: 'h4-de',
  H4_FR: 'h4-fr',
  H4_ES: 'h4-es',
  H4_MOBILE: 'h4-mobile',
  H4_DESKTOP: 'h4-desktop',
  H5: 'h5',
  H5_DE: 'h5-de',
  H5_FR: 'h5-fr',
  H5_ES: 'h5-es',
  H5_MOBILE: 'h5-mobile',
  H5_DESKTOP: 'h5-desktop',
  H6: 'h6',
  H6_DE: 'h6-de',
  H6_FR: 'h6-fr',
  H6_ES: 'h6-es',
  H6_MOBILE: 'h6-mobile',
  H6_DESKTOP: 'h6-desktop',
  BANNER_TEXT_XL: 'banner-text-xl',
  BANNER_TEXT_LG: 'banner-text-lg',
  BANNER_TEXT: 'banner-text',
}

function getClassName (props) {
  const { as, inverted, className } = props
  const cls = ['heading']
  if (className) cls.push(className)
  if (inverted) cls.push('heading--inverted')
  if (as) {
    _forEach([].concat(as), (
      m => cls.push(`heading--${m}`)
    ))
  }
  return cls.join(' ')
}

export default function Heading (props = {}) {
  const { id, tag, children } = props
  return React.createElement(tag, {
    className: getClassName(props),
    id,
  }, children)
}

Heading.propTypes = {
  tag: PropTypes.oneOf([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  ]),
  as: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  inverted: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
}

