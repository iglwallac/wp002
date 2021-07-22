import get from 'lodash/get'
import find from 'lodash/find'
import func from 'lodash/isFunction'
import Default from './_Default'
import Case from './_Case'

function render (component) {
  if (component) {
    const children = get(
      component, 'props.children')
    return children()
  }
  return null
}

function conditionWasMet (component) {
  const condition = get(component, 'props.condition')
  return !!(func(condition) ? condition() : condition)
}

export default function Switch ({ children }) {
  const component = find(children, c => (
    c && c.type === Case && conditionWasMet(c)
  )) || find(children, c => c && c.type === Default)
  return render(component)
}
