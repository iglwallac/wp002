import { RadioGroup, Radio, RADIO_STYLES } from 'components/FormInput.v2'
import { TYPES as ABUSE_TYPES, ACCUSATION_CODES } from 'services/abuse'
import ImmutablePropTypes from 'react-immutable-proptypes'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { connect as connectRedux } from 'react-redux'
import { Button, TYPES } from 'components/Button.v2'
import React, { PureComponent } from 'react'
import { getBoundActions } from 'actions'
import FormsyForm from 'formsy-react'
import PropTypes from 'prop-types'
import { Map } from 'immutable'

class ModalPortalFlag extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      pristine: true,
    }
  }


  onReport = (model) => {
    const { props } = this
    const { reason } = model
    const { createAbuseReport, accusedUuid, dismissModal } = props
    createAbuseReport({
      accusationContext: 'flag from portal',
      accusationCode: reason,
      type: ABUSE_TYPES.PORTAL,
      accusedUuid,
    })
    dismissModal()
  }

  onChange = () => {
    const { state } = this
    const { pristine } = state
    if (pristine) {
      this.setState(() => ({
        pristine: false,
      }))
    }
  }

  render () {
    const { props, state } = this
    const { pristine } = state
    const { staticText, dismissModal } = props

    return (
      <div className="portal-flag">
        <span className="portal-flag__subtitle">
          {staticText.get('whyReporting')}
        </span>
        <FormsyForm
          className="portal-flag__form"
          onSubmit={this.onReport}
          onChange={this.onChange}
        >
          <RadioGroup name="reason">
            <Radio
              style={RADIO_STYLES.SECONDARY}
              note={staticText.get('inappropriateAvatarExplanation')}
              label={staticText.get('inappropriateAvatar')}
              value={ACCUSATION_CODES.P001}
              block
            />
            <Radio
              style={RADIO_STYLES.SECONDARY}
              label={staticText.get('spammy')}
              value={ACCUSATION_CODES.P005}
              note={staticText.get('spammyExplanation')}
              block
            />
            <Radio
              style={RADIO_STYLES.SECONDARY}
              label={staticText.get('badVideos')}
              value={ACCUSATION_CODES.P004}
              note={staticText.get('badVideosExplanation')}
              block
            />
            <Radio
              style={RADIO_STYLES.SECONDARY}
              label={staticText.get('badConduct')}
              value={ACCUSATION_CODES.P003}
              note={staticText.get('badConductExplanation')}
              block
            />
            <Radio
              style={RADIO_STYLES.SECONDARY}
              label={staticText.get('impersonation')}
              value={ACCUSATION_CODES.P002}
              note={staticText.get('impersonationExplanation')}
              block
            />
          </RadioGroup>
          <div className="portal-flag__buttons">
            <Button
              icon={ICON_TYPES.FLAG}
              type={TYPES.GHOST}
              onClick={dismissModal}
            >
              {staticText.get('cancel')}
            </Button>
            <Button
              disabled={pristine}
              icon={ICON_TYPES.FLAG}
              type={TYPES.PRIMARY}
              submit
            >
              <IconV2 type={ICON_TYPES.FLAG} />
              {staticText.get('report')}
            </Button>
          </div>
        </FormsyForm>
      </div>
    )
  }
}

ModalPortalFlag.propTypes = {
  createAbuseReport: PropTypes.func.isRequired,
  dismissModal: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  accusedUuid: PropTypes.string.isRequired,
}

export default connectRedux(
  state => ({
    staticText: state.staticText.getIn(['data', 'modalPortalFlag', 'data'], Map()),
    accusedUuid: state.portal.getIn(['data', 'uuid'], ''),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      createAbuseReport: actions.abuse.createAbuseReport,
      dismissModal: actions.dialog.dismissModal,
    }
  })(ModalPortalFlag)
