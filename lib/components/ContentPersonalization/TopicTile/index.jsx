import React from 'react'
import { H3, HEADING_TYPES } from 'components/Heading'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'

export default function TopicTile ({
  id,
  title,
  description,
  iconKey,
  highlighted = false,
  selected = false,
  checkbox: Checkbox,
  onClick,
}) {
  const selectedClassName = selected ? 'topic-tile--selected' : ''
  const highlightedClassName = highlighted ? 'topic-tile--highlighted' : ''
  return (
    <li className={`topic-tile ${selectedClassName} ${highlightedClassName}`}>
      <button onClick={() => onClick(!selected, id)}>
        <div className="topic-tile__header">
          <span className="topic-tile__icon">
            <IconV2 type={iconKey} />
          </span>
          <H3 as={HEADING_TYPES.H6} className="topic-tile__title">{title}</H3>
          <span className="topic-tile__checkbox">
            <Checkbox selected={selected} />
          </span>
        </div>
        <p>{description}</p>
      </button>
    </li>
  )
}

const CheckboxHeart = ({ selected }) => {
  const color = selected ? '#CA4186' : '#D8D8D8'
  return <IconV2 type={ICON_TYPES.HEART} iconStyle={{ color }} />
}

const CheckboxCheckMark = ({ selected }) => {
  return selected ? <IconV2 type={ICON_TYPES.CHECKBOX_CHECKED} iconStyle={{ color: '#01b4b4' }} /> : null
}

TopicTile.CheckboxHeart = CheckboxHeart
TopicTile.CheckboxCheckMark = CheckboxCheckMark
