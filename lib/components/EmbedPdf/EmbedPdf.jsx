import PropTypes from 'prop-types'
import React from 'react'
import _isString from 'lodash/isString'
import _isObject from 'lodash/isObject'
import Icon from 'components/Icon'
import Link, { TARGET_BLANK } from 'components/Link'
import { H4 } from 'components/Heading'

function getClassName (className) {
  return ['embed-pdf'].concat(className || []).join(' ')
}

function renderThumbnail (thumbnail) {
  if (!thumbnail) {
    return null
  }
  return <div className="embed-pdf__thumbnail" />
}

function renderDescription (description) {
  if (!description) {
    return null
  }
  if (_isString(description)) {
    return <p className="embed-pdf__description">{description}</p>
  } else if (_isObject(description) && description.__html) {
    const { __html } = description
    /* eslint-disable react/no-danger */
    return (
      <div
        className="embed-pdf__description"
        dangerouslySetInnerHTML={{ __html }}
      />
    )
    /* eslint-enable react/no-danger */
  }
  return null
}

function renderTitle (title, url) {
  if (!title && !url) {
    return null
  }
  return (
    <H4 className="embed-pdf__title">
      <Link className="embed-pdf__link" to={url} target={TARGET_BLANK}>
        {title}
      </Link>
    </H4>
  )
}

function renderDownloadIcon (url) {
  if (!url) {
    return null
  }
  return (
    <div className="embed-pdf__download">
      <Link className="embed-pdf__link" to={url} target={TARGET_BLANK}>
        <Icon iconClass={['icon--download']} />
      </Link>
    </div>
  )
}

function EmbedPdf (props) {
  const { className } = props

  return (
    <div className={getClassName(className)}>
      {renderThumbnail(props.thumbnail)}
      <div className="embed-pdf__content">
        {renderTitle(props.title, props.url)}
        {renderDescription(props.description)}
      </div>
      {renderDownloadIcon(props.url)}
    </div>
  )
}

EmbedPdf.propTypes = {
  className: PropTypes.array,
  thumbnail: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onClickDownload: PropTypes.func,
  url: PropTypes.string.isRequired,
}

export default EmbedPdf
