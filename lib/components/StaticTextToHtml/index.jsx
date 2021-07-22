import React from 'react'

/*
* Render text from the translation strings as HTML
*/
export default function StaticTextToHtml ({ staticText, staticTextKey }) {
  let arrKey = staticTextKey
  if (typeof staticTextKey === 'string') {
    arrKey = [staticTextKey]
  }
  // eslint-disable-next-line react/no-danger
  return <span dangerouslySetInnerHTML={{ __html: staticText.getIn(arrKey) }} />
}
