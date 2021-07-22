import { EN } from 'services/languages/constants'
import { getTerms } from '.'
import { GET_PM_MULTIPLE_TERMS, setMultipleTerms } from './actions'

const fetchMultipleTerms = ({ takeEvery }) => {
  return takeEvery(GET_PM_MULTIPLE_TERMS, async ({ action, state }) => {
    const { payload } = action
    const { termIds } = payload
    const language = state.user.getIn(['data', 'language', 0]) || EN
    const data = await getTerms(
      {
        ids: termIds,
        language,
      },
    )
    return setMultipleTerms(termIds, language, data)
  })
}

export default fetchMultipleTerms
