import PropTypes from 'prop-types'
import React from 'react'

function WatchAccessAllowed (props) {
  return <div className="watch-access-allowed">{props.children}</div>
}

WatchAccessAllowed.propTypes = {
  access: PropTypes.string,
}

export default React.memo(WatchAccessAllowed)
