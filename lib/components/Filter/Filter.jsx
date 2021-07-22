import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { SimpleSelect } from 'react-selectize'

function getClassName (inputClassName, isCompact) {
  const classes = ['filter'].concat(inputClassName || [])
  if (isCompact) {
    classes.push('filter--compact')
  }
  return classes.join(' ')
}

function getLabelClassName (labelClassName) {
  const classes = ['filter__label'].concat(labelClassName || [])
  return classes.join(' ')
}

function createOption (option, i) {
  return option
    .set('label', option.get('name', option.get('value')))
    .set('index', i)
}

function Filter (props) {
  const {
    label,
    defaultOption,
    className,
    isCompact,
    labelClassName,
    options,
    placeholder,
    onChange,
  } = props
  // shim to fix content service returning options without translated display labels
  const filteredOptions = options.filter(option => option.has('name') && option.get('name'))
  // The key value below is to fix a re-render issue where even when
  // the default value changes the component does not.
  /* eslint-disable jsx-a11y/label-has-for */
  return (
    <div className={getClassName(className, isCompact)}>
      <label className={getLabelClassName(labelClassName)}>{label}</label>
      <SimpleSelect
        className={'filter__control'}
        value={defaultOption ? createOption(defaultOption).toJS() : undefined}
        onValueChange={onChange}
        options={filteredOptions.map(createOption).toJS()}
        hideResetButton
        // Used to override the highlighting until actual hover
        firstOptionIndexToHighlight={() => -1}
        renderOption={(item) => {
          let isActive = ''
          if (defaultOption) {
            isActive = defaultOption.get('name') === item.name ? 'is-active' : isActive
          }
          return (
            <div className="option-wrapper">
              <div className={`simple-option ${isActive}`}>
                <span>{item.name}</span>
              </div>
            </div>
          )
        }}
        editable={false}
        inputProps={{ readOnly: true }}
        placeholder={placeholder}
        theme=""
      />
    </div>
  )
  /* eslint-enable jsx-a11y/label-has-for */
}

Filter.propTypes = {
  options: ImmutablePropTypes.list.isRequired,
  defaultOption: ImmutablePropTypes.map,
  label: PropTypes.string.isRequired,
  labelClassName: PropTypes.array,
  placeholder: PropTypes.string,
  className: PropTypes.array,
  isCompact: PropTypes.bool,
  onChange: PropTypes.func,
}

export default Filter
