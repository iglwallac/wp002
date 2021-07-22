import _get from 'lodash/get'
import _parseInt from 'lodash/parseInt'
import {
  format as formatDateTime,
  getCurrentDay,
  getCurrentTime,
  subtractDays,
  getStartOfDay,
} from 'services/date-time'

const DAY_MONDAY_INDEX = 1

/**
 * Create a model for recently added buckets
 * @param {Object} data The data to map
 * @param {String} locale The locale
 */
export function createModel (data, locale) {
  const currentTime = _parseInt(_get(data, 'currentTime', -1))
  const currentWeek = _parseInt(_get(data, 'currentWeek', -1))
  const formattedCurrentWeek = formatDateTime(currentWeek, locale, 'x')
  return {
    currentTime,
    currentWeek: _parseInt(formattedCurrentWeek),
    dateTimeText: formatDateTime(currentTime, locale),
  }
}

function getCurrentWeekTime (locale) {
  let currentDay = getCurrentDay()
  if (currentDay === 0) {
    // Treat as 7th day of week if Sunday
    currentDay = 7
  }

  const daysPastMonday = currentDay - DAY_MONDAY_INDEX
  const monday = subtractDays(getCurrentTime(), daysPastMonday, 'days', locale)

  return getStartOfDay(monday, locale)
}

/**
 * Get the recently added buckets
 * @param {Object} options The options
 * @param {String} options.locale The locale
 * @returns
 */
export async function getRecentlyAdded (options = {}) {
  const { locale } = options
  const data = {
    currentWeek: getCurrentWeekTime(locale),
    currentTime: getCurrentTime(),
  }
  return createModel(data, locale)
}
