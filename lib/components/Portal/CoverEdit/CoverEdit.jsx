import React, { useCallback } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { getPrimary } from 'services/languages'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import { Button, TYPES } from 'components/Button.v2'
import { FR } from 'services/languages/constants'
import { H2, HEADING_TYPES } from 'components/Heading'
import { List, Map } from 'immutable'
import FormsyForm from 'formsy-react'
import PropTypes from 'prop-types'

const COVER_PHOTOS = [
  'default',
  'ancient',
  'chakras',
  'ufos',
  'health',
  'sky',
  'beach',
  'geoflower',
  'dna',
  'yoga',
  'altar',
  'northernlights',
]

function isCoverItemSelected (item, selectedCoverPhoto, action) {
  const icon = selectedCoverPhoto === item ? ICON_TYPES.CHECK : ICON_TYPES.PLUS
  const type = selectedCoverPhoto === item ? TYPES.ICON_SECONDARY : TYPES.ICON_PRIMARY
  return action === 'icon' ? icon : type
}

function getHeadingCls (primaryLang) {
  const cls = ['portal-v2-cover-edit__heading']
  if (primaryLang === FR) {
    cls.push('portal-v2-cover-edit__heading--fr')
  }
  return cls.join(' ')
}

function getButtonCls (primaryLang) {
  const cls = ['portal-v2-cover-edit__close']
  if (primaryLang === FR) {
    cls.push('portal-v2-cover-edit__close--fr')
  }
  return cls.join(' ')
}

export default function CoverEdit ({
  updateUserPortal,
  currentCover,
  updateEditor,
  staticText,
  setMode,
  editor,
  modes,
  mode,
  user,
}) {
  const selectedCover = editor.get('coverPhotoKey', '') || 'default'
  const primaryLang = getPrimary(user.getIn(['data', 'language'], List()))

  const onToggleSelector = useCallback(() => {
    setMode(modes.COVER_EDIT)
  }, [currentCover])

  const onSelectCoverPhoto = useCallback((e) => {
    const { currentTarget } = e
    const coverImage = currentTarget.getAttribute('data-id')
    updateEditor('coverPhotoKey', coverImage)
  }, [])

  const onSave = useCallback(() => {
    if (selectedCover !== currentCover) {
      updateUserPortal(Map({ coverPhotoKey: selectedCover }))
      setMode(modes.PROFILE_EDIT)
    }
  }, [selectedCover, currentCover])

  const setModeProfileEdit = useCallback(() => {
    setMode(modes.PROFILE_EDIT)
  }, [])

  const onCloseEditCover = useCallback(() => {
    if (currentCover !== selectedCover) {
      setMode(modes.UNSAVED_CHANGES)
      return
    }
    setModeProfileEdit()
  }, [currentCover, selectedCover])

  return (
    <div className="portal-v2-cover-edit">
      {mode === modes.COVER_EDIT ? (
        <div className="portal-v2-cover-edit__outer">
          <div className="portal-v2-cover-edit__inner">
            <section className="portal-v2-cover-edit__header-section">
              <header className="portal-v2-cover-edit__header">
                <H2 as={HEADING_TYPES.H4} className={getHeadingCls(primaryLang)}>
                  {staticText.get('chooseCoverPhoto', '')}
                </H2>
                <Button
                  className={getButtonCls(primaryLang)}
                  onClick={onCloseEditCover}
                  type={TYPES.GHOST}
                >
                  <Icon type={ICON_TYPES.CLOSE} />
                </Button>
              </header>
              <div className="portal-v2-cover-edit__line" role="presentation" />
            </section>
            <FormsyForm className="portal-v2-cover-edit__form" onSubmit={onSave}>
              <ul className="portal-v2-cover-edit__list">
                {COVER_PHOTOS.map(item => (
                  <li className="portal-v2-cover-edit__list-item" key={item}>
                    <div
                      key={item}
                      className={`portal-v2-cover-edit__img portal-v2__cover--${item}`}
                      role="presentation"
                    >
                      <Button
                        type={isCoverItemSelected(item, selectedCover, 'type')}
                        icon={isCoverItemSelected(item, selectedCover, 'icon')}
                        className="portal-v2-cover-edit__btn"
                        onClick={onSelectCoverPhoto}
                        data-id={item}
                      />
                    </div>
                  </li>
                ))
                }
              </ul>
              <Button
                disabled={currentCover === selectedCover}
                className="portal-v2-cover-edit__save"
                type={TYPES.PRIMARY}
                submit
              >
                {staticText.get('buttonTextSave', '')}
              </Button>
            </FormsyForm>
          </div>
        </div>
      ) : (
        <div className={`portal-v2-edit__cover portal-v2__cover--${currentCover}`}>
          <Button
            className="portal-v2-edit__cover-cta"
            onClick={onToggleSelector}
            type={TYPES.ICON_PRIMARY}
            icon={ICON_TYPES.PENCIL}
          />
        </div>
      )}
    </div>
  )
}

CoverEdit.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  updateUserPortal: PropTypes.func.isRequired,
  editor: ImmutablePropTypes.map.isRequired,
  currentCover: PropTypes.string.isRequired,
  updateEditor: PropTypes.func.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  modes: PropTypes.object.isRequired,
  setMode: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
}
