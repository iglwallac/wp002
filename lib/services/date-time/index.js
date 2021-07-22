import _head from 'lodash/head'
import _isString from 'lodash/isString'
import { get as getConfig } from 'config'
import getTime from 'date-fns/get_time'
import formatDateTime from 'date-fns/format'
import subDays from 'date-fns/sub_days'
import getDay from 'date-fns/get_day'
import startOfDay from 'date-fns/start_of_day'
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import addDaysFns from 'date-fns/add_days'
import addMonthsFns from 'date-fns/add_months'
import differenceInDays from 'date-fns/difference_in_days'
import isValid from 'date-fns/is_valid'
import esLocale from 'date-fns/locale/es'
import frLocale from 'date-fns/locale/fr'
import deLocale from 'date-fns/locale/de'
import enLocale from 'date-fns/locale/en'
import isWithinRange from 'date-fns/is_within_range'
import { DE, ES, FR } from 'services/languages/constants'

export const FORMAT_LOCALE_LONG_MDY_ORDINAL = 'MMMM Do, YYYY'
export const FORMAT_LOCALE_LONG_MDY = 'MMMM D, YYYY'
export const MOUNTAIN_STANDARD_TIME = 'MST (UTC-7)'
export const MOUNTAIN_DAYLIGHT_TIME = 'MDT (UTC-6)'
export const MOUNTAIN_STANDARD_TIME_OFFSET = 7
export const MOUNTAIN_DAYLIGHT_TIME_OFFSET = 6

const config = getConfig()

export function getDateLocale (language) {
  switch (language) {
    case DE:
      return deLocale
    case ES:
      return esLocale
    case FR:
      return frLocale
    default:
      return enLocale
  }
}

export function ordinalDateFormatingi18n (language) {
  return language !== 'fr' ? FORMAT_LOCALE_LONG_MDY_ORDINAL : FORMAT_LOCALE_LONG_MDY
}

function getLocale (locale = config.appLocale) {
  const lang = _isString(locale) ? _head(locale.split('_')) : 'en'
  if (lang === 'en') {
    return null
  }
  return null
}

export function getMountainTimezoneOffsetAbbreviation (serverTime) {
  const currentServerTime = new Date(serverTime)
  const savingsTime = currentServerTime.getTimezoneOffset() / 60
  let mountainTimezoneOffsetAbbreviation
  if (savingsTime === MOUNTAIN_DAYLIGHT_TIME_OFFSET) {
    mountainTimezoneOffsetAbbreviation = MOUNTAIN_DAYLIGHT_TIME
  } else {
    mountainTimezoneOffsetAbbreviation = MOUNTAIN_STANDARD_TIME
  }
  return mountainTimezoneOffsetAbbreviation
}

export function getCurrentTime () {
  return getTime(new Date())
}

export function format (
  time = getCurrentTime(),
  locale,
  _format = FORMAT_LOCALE_LONG_MDY,
) {
  const dt = new Date(time)
  return formatDateTime(dt, _format, { locale: getLocale() })
}

export function formatWithLocale (
  formattedDate,
  formattedDateStr,
  dateLocale,
) {
  return formatDateTime(formattedDate, formattedDateStr, dateLocale)
}

export function getDateTime (dateString) {
  return getTime(dateString)
}

export function subtractDays (time, num) {
  return subDays(time, num)
}

export function addDays (date, days) {
  return addDaysFns(date, days)
}

export function getCurrentDay () {
  return getDay(new Date())
}

export function getStartOfDay (time, locale) {
  return format(startOfDay(time), locale, 'x')
}

export function fromNow (time) {
  return distanceInWordsToNow(time, { locale: getLocale() })
}

export function getDifferenceInDays (laterDate, earlierDate) {
  return differenceInDays(laterDate, earlierDate)
}

export function addMonths (date, months) {
  return addMonthsFns(date, months)
}

export function dateIsValid (date) {
  return isValid(date)
}

export function dateIsWithinRange (date, startDate, endDate) {
  return isWithinRange(date, startDate, endDate)
}
