import React from 'react'

function WatchAccessDenied (props) {
  return <div className="watch-access-denied">{props.children}</div>
}

WatchAccessDenied.propTypes = {}

export default React.memo(WatchAccessDenied)
