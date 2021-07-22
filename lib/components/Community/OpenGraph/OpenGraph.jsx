import React from 'react'
import { H4, HEADING_TYPES } from 'components/Heading'
import Thumbnail from 'components/Community/Thumbnail'

export default function OpenGraph (props) {
  const {
    description,
    onRemove,
    verified,
    preview,
    title,
    image,
    url,
  } = props
  const desc = preview && !verified
    ? `Searching for ${url}...`
    : description
  return (
    <li className="opengraph">
      <Thumbnail
        error={verified && !image}
        processing={!verified}
        onRemove={onRemove}
        name={title}
        src={image}
      />
      <H4
        as={HEADING_TYPES.H6_MOBILE}
        className="opengraph__title"
      >{title}
      </H4>
      <p className="opengraph__desc">{desc}</p>
      {!preview && url ? (
        <a
          className="opengraph__link"
          target="_blank"
          title={title}
          href={url}
        ><span>{url}</span>
        </a>
      ) : null}
    </li>
  )
}
