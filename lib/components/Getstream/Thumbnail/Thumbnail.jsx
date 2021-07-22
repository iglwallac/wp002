import React, { useState, useEffect, useCallback } from 'react'
import { Button, SIZES, TYPES } from 'components/Button.v2'
import { ICON_TYPES } from 'components/Icon.v2'
import { If } from 'components/Conditionals'

function getClass (preview, error) {
  const hasError = preview instanceof Error || error
  const root = 'stream-thumbnail'
  const className = [root]

  if (!preview && !hasError) {
    className.push(`${root}--loading`)
  }
  if (hasError) {
    className.push(`${root}--error`)
  }
  if (preview && !hasError) {
    className.push(
      preview.height > preview.width
        ? `${root}--vertical`
        : '')
  }
  return className.join(' ')
}

export default function Thumbnail ({
  processing,
  onRemove,
  error,
  name,
  src,
  tag,
  id,
}) {
  const [preview, setPreview] = useState(null)
  const className = getClass(preview, error)
  const onClick = useCallback((evt) => {
    evt.preventDefault()
    onRemove(id, src)
  }, [id, src, onRemove])

  useEffect(() => {
    if (src) {
      let img = new Image()
      img.src = src
      img.onload = () => {
        setPreview(img)
        img = null
      }
      img.onerror = () => {
        const err = new Error('failed to load image.')
        setPreview(err)
        img = null
      }
    }
  }, [src])

  return React.createElement(tag, { className },
    <If condition={preview || error}>
      {() => (
        <div className="stream-thumbnail__preview">
          <If condition={!!onRemove}>
            {() => (
              <Button
                className="stream-thumbnail__remove"
                icon={ICON_TYPES.CLOSE}
                type={TYPES.ICON_FILL}
                disabled={processing}
                size={SIZES.SMALL}
                onClick={onClick}
              />
            )}
          </If>
          <div className="stream-thumbnail__src">
            <If condition={preview && preview.src}>
              {() => <img src={preview.src} alt={name} />}
            </If>
          </div>
        </div>
      )}
    </If>,
  )
}

Thumbnail.defaultProps = {
  onRemove: null,
  tag: 'div',
}
