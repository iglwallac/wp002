import React from 'react'

import { PP_DEFAULT } from 'services/hidden-content-preferences'

const useHiddenContentSettings = (
  hiddenContent,
  getHiddenContent,
  hideContent,
  unhideContent,

) => {
  const [content, setContent] = React.useState(hiddenContent)
  const [currentPage, setCurrentPage] = React.useState(0)

  React.useEffect(() => {
    const newContent = content.mergeDeep(hiddenContent)
    setContent(newContent)
  }, [content, hiddenContent])

  React.useEffect(() => {
    if (currentPage === 0) return
    getHiddenContent({ p: currentPage, pp: PP_DEFAULT })
  }, [currentPage])

  const toggleContent = (addedBack, contentItem) => {
    const contentId = contentItem.get('contentId')
    const contentType = contentItem.get('contentType')
    const id = hiddenContent.getIn([contentId, 'id'])
    if (addedBack) {
      hideContent({ contentType, contentId })
    } else {
      unhideContent({ id, contentId })
    }
  }

  const loadMoreContent = () => {
    setCurrentPage(currentPage + 1)
  }

  return { content, toggleContent, loadMoreContent }
}

export default useHiddenContentSettings
