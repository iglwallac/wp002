import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { getBoundActions } from 'actions'
import isFunction from 'lodash/isFunction'
import { connect as connectRedux } from 'react-redux'

function ReplaceHistory ({
  replaceHistory,
  condition,
  timeout,
  query,
  url,
}) {
  useEffect(() => {
    const replace = !!(isFunction(condition)
      ? condition() : condition)
    if (replace) {
      replaceHistory({
        timeout,
        query,
        url,
      })
    }
  }, [condition])
  return null
}

ReplaceHistory.defaultProps = {
  condition: true,
}

ReplaceHistory.propTypes = {
  url: PropTypes.string.isRequired,
  timeout: PropTypes.number,
  condition: PropTypes.any,
  query: PropTypes.object,
}

export default connectRedux(null, () => {
  const { navigation } = getBoundActions()
  return { replaceHistory: navigation.replaceHistory }
})(ReplaceHistory)
