import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { List, Map, fromJS } from 'immutable'
import FormsyForm from 'formsy-react'
import FormButton from 'components/FormButton'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import FormSelect from 'components/FormSelect'
import { Card } from 'components/Card'
import { H3 } from 'components/Heading'

import {
  createUpstreamContext,
  SCREEN_TYPE_MEMBER_HOME,
} from 'services/upstream-context'
import { getBoundActions } from 'actions'

const CONTEXT_TYPE_PRACTICE_PICKER = 'practice-picker'

const TIME = ['5', '15', '20-30', '45 - 60', '60+']
const FEEL = List([
  {
    value: 'relaxed',
    label: 'relaxed',
  },
  {
    value: 'energized',
    label: 'energized',
  },
])
const MOOD = List([
  {
    value: 'hatha flow',
    label: 'hatha flow',
  },
  {
    value: 'yin',
    label: 'yin',
  },
])

class SectionPracticePicker extends React.Component {
  constructor (props) {
    super(props)
    const {
      sectionId,
      sectionIndex,
    } = props

    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_MEMBER_HOME,
      contextType: CONTEXT_TYPE_PRACTICE_PICKER,
      sectionId,
      sectionIndex,
      headerLabel: CONTEXT_TYPE_PRACTICE_PICKER,
    })

    this.state = {
      upstreamContext,
      activeTab: 0,
      internalOpenShelfIndex: 0,
      hoverActive: null,
    }
  }

  render () {
    return (
      <Card className="practice-picker">
        <div className="practice-picker__questions">
          <H3 className="practice-picker__title">Practice Picker</H3>
          <FormsyForm>
            { // TODO: Move this to a Component Radio
            }
            <div className="practice-picker__time">
              <span className="practice-picker__time-label">I have</span>
              {
                TIME.map((item) => {
                  return (
                    <div className="practice-picker__time-item" key={item}>
                      <input type="radio" name="practice-picker__time-item" vlaue={item} id={`time-${item}`} />
                      <label htmlFor={`time-${item}`}>
                        {item} min
                      </label>
                    </div>
                  )
                })
              }
            </div>

            <div className="practice-picker__practice">
              <span className="practice-picker__practice-label">I want to practice</span>
              <FormSelect name="practice-picker__feel" options={FEEL} defaultOption={fromJS(FEEL.first())} />
            </div>

            <div className="practice-picker__style">
              <span className="practice-picker__style-label">I&apos;m in the mood for</span>
              <FormSelect name="practice-picker__mood" options={MOOD} defaultOption={fromJS(MOOD.first())} />
            </div>

            <FormButton
              formButtonClass={['form-button--primary', 'practice-picker-button']}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              type={FORM_BUTTON_TYPE_SUBMIT}
              text="Let's Go"
            />
          </FormsyForm>
        </div>
      </Card>
    )
  }
}

export default compose(
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const exploreByTopicStore = state.pmExploreByTopic.get(language, Map())
      const topicsList = exploreByTopicStore.get('data', List())

      return {
        staticText: state.staticText.getIn(['data', 'SectionPracticePicker', 'data'], Map()),
        auth: state.auth,
        language,
        hasData: exploreByTopicStore.has('data'),
        processing: exploreByTopicStore.get('processing', false),
        topicsList,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
      }
    },
  ),
)(SectionPracticePicker)
