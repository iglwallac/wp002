import { useState, useEffect } from 'react'

export default function useContentPersonalization (
  topics = [],
  initialSelectedTopics = [],
  initialFavoriteTopic = null,
  alphabetizeTopics = false,
  onSelectedTopicsChange = () => {},
) {
  const [selectedTopics, setSelectedTopics] = useState(initialSelectedTopics)
  const [favoriteTopic, setFavoriteTopic] = useState(initialFavoriteTopic)

  useEffect(() => {
    onSelectedTopicsChange(selectedTopics)
  }, [selectedTopics])

  useEffect(() => {
    setSelectedTopics(initialSelectedTopics)
  }, [initialSelectedTopics])

  useEffect(() => {
    setFavoriteTopic(initialFavoriteTopic)
  }, [initialFavoriteTopic])

  useEffect(() => {
    if (alphabetizeTopics === true) {
      topics.sort((a, b) => {
        if (a.title < b.title) return -1
        if (a.title > b.title) return 1
        return 0
      })
    }
  }, [topics, alphabetizeTopics])

  useEffect(() => {
    if (alphabetizeTopics === true) {
      selectedTopics.sort((a, b) => {
        if (a.title < b.title) return -1
        if (a.title > b.title) return 1
        return 0
      })
    }
  }, [selectedTopics, alphabetizeTopics])

  const toggleTopic = (isSelected, id) => {
    if (isSelected) {
      const topic = topics.find(t => t.tid === id)
      setSelectedTopics([topic, ...selectedTopics])
    } else {
      const newTopics = selectedTopics.filter(topic => topic.tid !== id)
      setSelectedTopics(newTopics)
    }

    // In case the favorited topic was unselected from topics list
    const favoriteTopicId = favoriteTopic ? favoriteTopic.tid : null
    if (!isSelected && id === favoriteTopicId) {
      setFavoriteTopic(null)
    }
  }

  const isTopicSelected = (id) => {
    return !!selectedTopics.find(topic => topic.tid === id)
  }

  const toggleFavorite = (_isSelected, id) => {
    const favoriteTopicId = favoriteTopic ? favoriteTopic.tid : null
    if (favoriteTopicId === id) {
      setFavoriteTopic(null)
    } else {
      setFavoriteTopic(topics.find(topic => topic.tid === id))
    }
  }

  const isFavoriteSelected = (id) => {
    const favoriteTopicId = favoriteTopic ? favoriteTopic.tid : null
    return favoriteTopicId === id
  }

  return {
    toggleTopic,
    isTopicSelected,
    selectedTopics,
    toggleFavorite,
    isFavoriteSelected,
    favoriteTopic,
  }
}
