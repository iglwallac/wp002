import { Map } from 'immutable'
import PropTypes from 'prop-types'
import parseInt from 'lodash/parseInt'
import React, { useCallback } from 'react'
import { TAG_LIMIT } from 'services/portal'
import { H2, H4, HEADING_TYPES } from 'components/Heading'
import { Button, TYPES } from 'components/Button.v2'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { requestAnimationFrame } from 'services/animate'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { HiddenInput } from 'components/FormInput.v2/FormInput'
import { URL_JAVASCRIPT_VOID } from 'components/Link/constants'

function getId (tag) {
  return (tag && (
    tag.get('tagId') || tag.get('id')
  )) || null
}

function hasTag (tags, selectedId) {
  return !!tags.find(tag => (
    getId(tag) === selectedId
  ))
}

function getClass (tags, id) {
  const isSelected = hasTag(tags, id)
  const selectedClass = isSelected ? ' portal-v2-tags__edit-item--selected' : ''
  return `portal-v2-tags__edit-item ${selectedClass}`
}

export default function UserTags ({
  updatePortal,
  updateEditor,
  currentTags,
  setMode,
  options,
  modes,
  mode,
  tags,
  text,
}) {
  //
  const onToggleSelector = useCallback(() => {
    if (mode === modes.PROFILE_EDIT) {
      requestAnimationFrame(() => window.scrollTo(0, 0))
      setMode(modes.TAGS_EDIT)
    }
    if (mode === modes.TAGS_EDIT) {
      if (!tags.equals(currentTags)) setMode(modes.UNSAVED_CHANGES)
      else setMode(modes.PROFILE_EDIT)
    }
  }, [mode, tags, currentTags])

  const onClick = useCallback((e) => {
    const { currentTarget: ct } = e
    const dataId = ct.getAttribute('data-id')
    const dataIdInt = parseInt(dataId)
    const tag = options.find(o => getId(o) === dataIdInt)
    const tagId = getId(tag)

    let next = tags

    if (hasTag(tags, tagId)) {
      next = tags.filter(t => getId(t) !== tagId)
    } else if (tags.size < TAG_LIMIT) {
      next = tags.push(tag)
    }
    updateEditor('tags', next)
  }, [tags])

  const onSubmitTags = useCallback(() => {
    updatePortal(Map({ tags }))
    setMode(modes.PROFILE_EDIT)
  }, [tags, mode])

  return (
    <div className="portal-v2-tags">
      <H4>{text.get('titleTags', '')}</H4>
      <p>{text.get('descriptionTags', '')}</p>
      <div className="portal-v2-tags__display">
        <Button
          scrollToTop
          className={tags.size > 0 ? 'portal-v2-tags__add' : ''}
          icon={ICON_TYPES.PLUS}
          type={tags.size > 0 ? TYPES.ICON_FILL : TYPES.ICON_PILL}
          onClick={onToggleSelector}
          to={URL_JAVASCRIPT_VOID}
        >
          {tags.size > 0 ? '' : (
            <span className="portal-v2-tags__add-text">
              {text.get('buttonTextAdd')}
            </span>
          )}
        </Button>
        <ul className="portal-v2-tags__list">
          {tags.map((tag, i) => (
            <li key={getId(tag)} className="portal-v2-tags__item">
              <span className="portal-v2-tags__tag">
                {tag.get('label')}
              </span>
              <HiddenInput
                label={`tags[${i}]`}
                name={`tags[${i}]`}
                value={getId(tag)}
              />
            </li>
          )).slice(0, TAG_LIMIT)}
        </ul>
      </div>
      {mode === modes.TAGS_EDIT ? (
        <div className="portal-v2-tags__chooser">
          <div className="portal-v2-tags__inner">
            <div className="portal-v2-tags__header">
              <H2 as={HEADING_TYPES.H4}>
                {text.get('tagsEditTitle')}
              </H2>
              <Button
                onClick={onToggleSelector}
                className="portal-v2-tags__close"
                icon={ICON_TYPES.CLOSE}
                type={TYPES.ICON}
              />
            </div>
            <div className="portal-v2-tags__line" role="presentation" />
            <p className="portal-v2-tags__message">
              {text.get('maxTags')}
            </p>
            {options.size ? (
              <ul className="portal-v2-tags__edit-list">
                {options.map((tag) => {
                  const id = getId(tag)
                  return (
                    <li className={getClass(tags, id)} key={id}>
                      <Button
                        disabled={!hasTag(tags, id) && tags.size >= TAG_LIMIT}
                        onClick={onClick}
                        type={TYPES.PILL}
                        data-id={id}
                      >
                        <Icon type={ICON_TYPES.CHECK} />
                        {tag.get('label')}
                        <Icon type={ICON_TYPES.CLOSE} />
                      </Button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <Sherpa type={TYPE_LARGE} />
            )}
            <Button
              className="portal-v2-tags__save"
              disabled={tags.equals(currentTags)}
              type={TYPES.PRIMARY}
              onClick={onSubmitTags}
            >
              {text.get('buttonTextSave', '')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

UserTags.propTypes = {
  currentTags: ImmutablePropTypes.list.isRequired,
  options: ImmutablePropTypes.list.isRequired,
  tags: ImmutablePropTypes.list.isRequired,
  text: ImmutablePropTypes.map.isRequired,
  updateEditor: PropTypes.func.isRequired,
  updatePortal: PropTypes.func.isRequired,
  setMode: PropTypes.func.isRequired,
  modes: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
}

