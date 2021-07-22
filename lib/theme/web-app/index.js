import _isString from 'lodash/isString'

// Helper to format duration
export function formatDuration (seconds) {
  let formattedDuration

  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    formattedDuration = `${minutes} min${minutes > 1 ? 's' : ''}`
  } else if (minutes === 0) {
    formattedDuration = `${hours} hr${hours > 1 ? 's' : ''}`
  } else {
    formattedDuration =
      `${hours
      } hr${
        hours > 1 ? 's' : ''
      }, ${
        minutes
      } min${
        minutes > 1 ? 's' : ''}`
  }

  return formattedDuration
}

// Helper for truncating strings on word boundry
export function truncate (string, limit) {
  if (_isString(string) && string.length > limit) {
    return (
      `${string
        .substring(0, limit)
        .replace(/\w+$/, '')
        .trim()}...`
    )
  }
  return string
}

// Helper for capitalizing the first letter of a string
export function capitalizeFirstLetter (string) {
  if (_isString(string)) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
  return string
}

export function formatSeriesHost (series, host, separator) {
  if (series && host && separator) {
    return `${series} ${separator} ${host}`
  }
  if (series && host && !separator) {
    return `${series} with ${host}`
  }
  if (series && !host) {
    return series
  }
  return host
}

export function formatSeriesEpisodeTotals (total, singularText, pluralText) {
  if (!total) {
    return ''
  }

  const text = total > 1 ? pluralText : singularText

  return `${total} ${text}`
}
