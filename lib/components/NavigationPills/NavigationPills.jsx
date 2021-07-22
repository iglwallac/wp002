import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Link from 'components/Link'

function createItem (props) {
  const { active, children, to = '' } = props
  const className = active ? ' active' : ''
  const role = to ? 'link' : 'button'
  return (
    <Link
      className={className}
      role={role}
      to={to}
      {...props}
    >
      {children}
    </Link>
  )
}

export default function NavigationPills (props) {
  const { items, children } = props
  return (
    <nav className="navigation-pills">
      <ul className="navigation-pills__list">
        {items.map((item, index) => {
          const key = `item-${index}`
          return (
            <li key={key} className="navigation-pills__item">
              {children(createItem, item, index, props)}
            </li>
          )
        }).toJS()}
      </ul>
    </nav>
  )
}

NavigationPills.propTypes = {
  items: ImmutablePropTypes.list.isRequired,
  children: PropTypes.func.isRequired,
}
