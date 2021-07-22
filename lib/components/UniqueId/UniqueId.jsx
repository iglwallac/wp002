import React from 'react'

let id = 0

function createId (key) {
  id += 1
  return key ? `${key}-${id}` : id
}

export default function createUnique (key) {
  return function createUniqueId (Component) {
    return class Unique extends React.Component {
      constructor (props) {
        super(props)
        this.uniqueId = createId(key)
      }
      render () {
        const { uniqueId, props } = this
        return <Component uniqueId={uniqueId} {...props} />
      }
    }
  }
}
