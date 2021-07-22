import React from 'react'
import { partial as _partial } from 'lodash'
import CommentsLoader from './CommentsLoader'

const COMPONENT_NAME =
  process.env.NODE_ENV === 'production' ? 'clc' : 'CommentsLoaderConnect'

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

export default function connect (options) {
  return _partial(wrapComponent, options)
}

function wrapComponent (options, WrappedComponent) {
  function CommentsLoaderHOC (props) {
    if (!WrappedComponent) {
      return null
    }
    return (
      <WrappedComponent {...props}>
        <CommentsLoader />
      </WrappedComponent>
    )
  }

  CommentsLoaderHOC.displayName = `${COMPONENT_NAME}(${getDisplayName(
    WrappedComponent,
  )})`

  CommentsLoaderHOC.propTypes = {}

  return CommentsLoaderHOC
}
