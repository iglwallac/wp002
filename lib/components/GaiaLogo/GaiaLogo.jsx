import PropTypes from 'prop-types'
import React from 'react'
import Link from 'components/Link'

export const TYPE_TEAL = 'teal'
export const TYPE_BLUE_DARK = 'blue-dark'
export const TYPE_WHITE = 'white'
export const TYPE_BLACK = 'black'

function getClassName (props) {
  const { className = [], inline } = props
  const inlineClass = inline ? 'gaia-logo__inline' : ''
  const logoClass = `gaia-logo--${props.type}`
  return ['gaia-logo', logoClass, inlineClass].concat(className).join(' ')
}

const GaiaLogo = React.memo((props) => {
  const className = getClassName(props)
  const { isHref = false, onClick, inline = false } = props
  if (isHref) {
    return (
      <React.Fragment>
        <Link
          className={className}
          to="/"
          onClick={onClick}
        >
          <span className="assistive">Gaia</span>
        </Link>
      </React.Fragment>
    )
  }
  if (inline) {
    return <span className={className} />
  }
  return <div className={className} />
})

GaiaLogo.propTypes = {
  type: PropTypes.string.isRequired,
  className: PropTypes.array,
  onClick: PropTypes.func,
  inline: PropTypes.bool,
  isHref: PropTypes.bool,
}

export default GaiaLogo
