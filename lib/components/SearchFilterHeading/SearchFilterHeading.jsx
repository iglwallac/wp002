import React from 'react'
import { H6 } from 'components/Heading'

const SearchFilterHeading = props => (
  <header className="search-filter">
    <H6>{props.heading}</H6>
    <small>{props.help}</small>
  </header>
)

export default SearchFilterHeading
