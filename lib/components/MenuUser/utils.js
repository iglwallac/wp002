import { USD } from 'services/currency'
import _isEmpty from 'lodash/isEmpty'

/*
 * A user can manage their accout if we can not fetch their
 * subs or they have a sub without a USD currency
 * @param {List} subscriptions - An immutable list of subscriptions
 */
export function canManageAccount (subscriptions) {
  return !subscriptions || subscriptions.get('currencyIso') === USD || _isEmpty(subscriptions.get('currencyIso'))
}

export default { }
