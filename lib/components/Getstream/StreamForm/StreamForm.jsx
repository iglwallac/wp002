import { ACTIVITY_VERBS } from 'services/getstream/activity'
import { REACTION_KINDS } from 'services/getstream/reaction'
import { FORM_TYPES } from 'services/getstream/draft'
import React from 'react'

import ReactionForm from './_ReactionForm'
import ActivityForm from './_ActivityForm'

export { ACTIVITY_VERBS }
export { REACTION_KINDS }
export { FORM_TYPES }

export function StreamActivityForm (props) {
  return <ActivityForm {...props} />
}

export function StreamReactionForm (props) {
  return <ReactionForm {...props} />
}
