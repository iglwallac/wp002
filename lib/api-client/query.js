// eslint-disable-next-line import/prefer-default-export
export function getSeparator (url = '') {
  return String(url).includes('?') ? '&' : '?'
}
