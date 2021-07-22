import PropTypes from 'prop-types'
import React from 'react'
import Icon from 'components/Icon'

function getClassName (inHideWatchHistory) {
  return ['watchhistory-edit']
    .concat(inHideWatchHistory ? ['watchhistory-edit--add'] : [])
    .join(' ')
}

function getIconClassNames (inHideWatchHistory) {
  const classNames = ['icon--x-small', 'icon--action', 'watchhistory-edit__icon']
  if (inHideWatchHistory) {
    classNames.push('icon--add', 'watchhistory-edit__icon--add')
  } else {
    classNames.push('icon--close', 'watchhistory-edit__icon--remove')
  }
  return classNames
}

function WatchHistoryEdit (props) {
  return (
    <div className={getClassName(props.inHideWatchHistory)}>
      <Icon
        iconClass={getIconClassNames(props.inHideWatchHistory)}
        onClick={props.onClick}
      />
    </div>
  )
}

WatchHistoryEdit.propTypes = {
  onClick: PropTypes.func.isRequired,
  inHideWatchHistory: PropTypes.bool.isRequired,
}

export default WatchHistoryEdit
