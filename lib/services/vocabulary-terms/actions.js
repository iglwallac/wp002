import { get as getVocabularyTerms } from 'services/vocabulary-terms'

export const SET_VOCABULARY_TERMS_DATA_PROCESSING = 'SET_VOCABULARY_TERMS_DATA_PROCESSING'
export const SET_VOCABULARY_TERMS_DATA = 'SET_VOCABULARY_TERMS_DATA'

export function setVocabularyTermsDataProcessing (vocabularyId, processing) {
  return {
    type: SET_VOCABULARY_TERMS_DATA_PROCESSING,
    payload: { vocabularyId, processing },
  }
}

export function setVocabularyTermsData (vocabularyId, data, processing = false) {
  return {
    type: SET_VOCABULARY_TERMS_DATA,
    payload: { vocabularyId, data, processing },
  }
}

export function getVocabularyTermsData (vocabularyId, options) {
  return function getVocabularyTermsDataThunk (dispatch) {
    dispatch(setVocabularyTermsDataProcessing(vocabularyId, true))
    return getVocabularyTerms(
      vocabularyId,
      options.toJS(),
    ).then(data => dispatch(setVocabularyTermsData(vocabularyId, data)))
  }
}
