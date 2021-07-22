export const ARS = 'ARS'
export const AUD = 'AUD'
export const CAD = 'CAD'
export const COP = 'COP'
export const EUR = 'EUR'
export const GBP = 'GBP'
export const MXN = 'MXN'
export const NZD = 'NZD'
export const USD = 'USD'
export const LTM = 'LTM'

export const renderSymbol = (currencyIso) => {
  let symbol = '$'
  if (currencyIso === EUR) {
    symbol = '€'
  }
  if (currencyIso === GBP) {
    symbol = '£'
  }
  return symbol
}
