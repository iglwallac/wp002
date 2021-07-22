import { Map } from 'immutable'
import PropTypes from 'prop-types'
import FormsyForm from 'formsy-react'
import _replace from 'lodash/replace'
import _parseInt from 'lodash/parseInt'
import React, { useMemo, useState, useCallback } from 'react'
import { connect as connectRedux } from 'react-redux'
import { NumberInput } from 'components/FormInput.v2'
import { Button, TYPES } from 'components/Button.v2'
import { ICON_TYPES } from 'components/Icon.v2'

function getInputClass (value) {
  const length = (value && value.length) || 0
  const className = ['pager-v2__form-input']
  if (length > 1) {
    className.push(length === 2
      ? 'pager-v2__form-input--two-digits'
      : 'pager-v2__form-input--three-digits',
    )
  }
  return className.join(' ')
}

function Pager ({
  onChangePage,
  staticText,
  total,
  pp,
  p,
}) {
  if (total < pp) {
    return null
  }

  const pages = Math.ceil(total / pp)

  let displayText = staticText.get('displayText')
  let assistiveText = staticText.get('assistiveText')
  let ariaPrevText = staticText.get('ariaPrev')
  let ariaNextText = staticText.get('ariaNext')

  /* eslint-disable no-template-curly-in-string */
  displayText = _replace(displayText, '${ pages }', pages)
  assistiveText = _replace(assistiveText, '${ p }', p)
  assistiveText = _replace(assistiveText, '${ pages }', pages)
  ariaPrevText = _replace(ariaPrevText, '${ prevPage }', p - 1)
  ariaNextText = _replace(ariaNextText, '${ nextPage }', p + 1)

  const [inputValue, setInputValue] = useState(p)

  const onChange = useCallback((value) => {
    setInputValue(value)
    return value
  }, [])

  const validations = useMemo(() => ({
    isNumeric: true,
    validatePageNo: (values, value) => (
      value > pages || value < 1
        ? staticText.get('inputInvalidPageNumber')
        : true
    ),
  }), [staticText])

  const onSubmit = useCallback(({ page }) => {
    const pageInt = _parseInt(page)
    if (pageInt >= 1 && pageInt <= pages && pageInt !== p) {
      onChangePage(pageInt)
    }
  }, [p, onChangePage])

  const onBlur = useCallback((page) => {
    const pageInt = _parseInt(page)
    if (pageInt !== p) {
      onSubmit({ page })
    }
  }, [p])

  const prev = useCallback(() => {
    onChangePage(p - 1)
  }, [p, onChangePage])

  const next = useCallback(() => {
    onChangePage(p + 1)
  }, [p, onChangePage])

  return (
    <div className="pager-v2">
      <div className="pager-v2__inner">
        <Button
          className="pager-v2__button pager-v2__button-left"
          icon={ICON_TYPES.CHEVRON_LEFT}
          aria-label={ariaPrevText}
          disabled={p <= 1}
          type={TYPES.ICON}
          onClick={prev}
        />
        <FormsyForm
          onSubmit={onSubmit}
          className="pager-v2__form"
        >
          <NumberInput
            label={staticText.get('inputLabel')}
            className={getInputClass(inputValue)}
            validations={validations}
            onChange={onChange}
            onBlur={onBlur}
            name="page"
            value={p}
            required
          />
        </FormsyForm>
        <span
          className="pager-v2__pages"
          role="presentation"
        >{displayText}
        </span>
        <span className="assistive">
          {assistiveText}
        </span>
        <Button
          className="pager-v2__button pager-v2__button-right"
          icon={ICON_TYPES.CHEVRON_RIGHT}
          aria-label={ariaNextText}
          disabled={p >= pages}
          type={TYPES.ICON}
          onClick={next}
        />
      </div>
    </div>
  )
}

Pager.propTypes = {
  onChangePage: PropTypes.func.isRequired,
  total: PropTypes.number,
  pp: PropTypes.number,
  p: PropTypes.number,
}

Pager.defaultProps = {
  total: 0,
  pp: 0,
  p: 1,
}

export default connectRedux(({
  staticText,
}) => ({
  staticText: staticText.getIn(
    ['data', 'pager', 'data'], Map()),
}))(Pager)
