import React from 'react'
import { H4, HEADING_TYPES } from 'components/Heading'
import Thumbnail from 'components/Getstream/Thumbnail'

export default function OpenGraph ({
  description,
  onRemove,
  verified,
  preview,
  title,
  image,
  url,
}) {
  const desc = preview && !verified
    ? `Searching for ${url}...`
    : description
  return (
    <li className="og">
      <Thumbnail
        error={verified && !image}
        processing={!verified}
        onRemove={onRemove}
        name={title}
        src={image}
      />
      <H4
        as={HEADING_TYPES.H6}
        className="og__title"
      >{title}
      </H4>
      <p className="og__desc">{desc}</p>
      {!preview && url ? (
        <a
          className="og__link"
          target="_blank"
          title={title}
          href={url}
        ><span>{url}</span>
        </a>
      ) : null}
    </li>
  )
}
