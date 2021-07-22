import PropTypes from 'prop-types'
import React from 'react'

function getClassName (props) {
  const { className } = props
  return ['user__avatar'].concat(className || []).join(' ')
}

function getAvatarStyle (imagePath) {
  const style = {}

  if (imagePath) {
    style.backgroundImage = `url(${imagePath})`
  }

  return style
}

const UserAvatar = React.memo((props) => {
  return (
    <div
      style={getAvatarStyle(props.path)}
      className={getClassName(props)}
    />
  )
})

UserAvatar.propTypes = {
  path: PropTypes.string,
  className: PropTypes.array,
}

export default UserAvatar
