import PropTypes from 'prop-types'
import React from 'react'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _concat from 'lodash/concat'
import _join from 'lodash/join'

function ErrorMessage (props) {
  const { errorMessages, children, errorMessageClass } = props
  const itemClass = errorMessageClass
    ? _join(errorMessageClass, ' ')
    : null
  let messagesChildren = []
  if (errorMessages) {
    messagesChildren = _map(errorMessages, (error, index) => {
      return (
        <span key={`error-${index}`} className="error-message__item">
          {error}
        </span>
      )
    })
  }
  return (
    <div className={itemClass ? `error-message ${itemClass}` : 'error-message'}>
      {_compact(_concat(messagesChildren, children))}
    </div>
  )
}

ErrorMessage.propTypes = {
  errorMessageClass: PropTypes.array,
  errorMessages: PropTypes.array,
}

export default ErrorMessage
