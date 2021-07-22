import React from 'react'
import Heading, { HEADING_TYPES } from './_Heading'

export { HEADING_TYPES }

export const H1 = React.memo((props = {}) => {
  const {
    as,
    children,
    inverted = false,
    className,
    id,
  } = props
  return (
    <Heading
      tag="h1"
      as={as}
      id={id}
      inverted={inverted}
      className={className}
    >
      {children}
    </Heading>
  )
})

export const H2 = React.memo((props = {}) => {
  const {
    as,
    children,
    inverted = false,
    className,
    id,
  } = props
  return (
    <Heading
      tag="h2"
      as={as}
      id={id}
      inverted={inverted}
      className={className}
    >
      {children}
    </Heading>
  )
})

export const H3 = React.memo((props = {}) => {
  const {
    as,
    children,
    id,
    inverted = false,
    className,
  } = props
  return (
    <Heading
      tag="h3"
      as={as}
      inverted={inverted}
      id={id}
      className={className}
    >
      {children}
    </Heading>
  )
})

export const H4 = React.memo((props = {}) => {
  const {
    as,
    children,
    inverted = false,
    className,
    id,
  } = props
  return (
    <Heading
      tag="h4"
      as={as}
      id={id}
      inverted={inverted}
      className={className}
    >
      {children}
    </Heading>
  )
})

export const H5 = React.memo((props = {}) => {
  const {
    as,
    children,
    inverted = false,
    className,
    id,
  } = props
  return (
    <Heading
      tag="h5"
      as={as}
      id={id}
      inverted={inverted}
      className={className}
    >
      {children}
    </Heading>
  )
})

export const H6 = React.memo((props = {}) => {
  const {
    as,
    id,
    children,
    inverted = false,
    className,
  } = props
  return (
    <Heading
      tag="h6"
      as={as}
      id={id}
      inverted={inverted}
      className={className}
    >
      {children}
    </Heading>
  )
})
