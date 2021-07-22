import React from 'react'

const createOption = (option) => {
  return option.set('label', option.get('name', option.get('value')))
}

class YogaOption extends React.Component {
  handleChange = () => {
    const { props } = this
    const {
      onChange,
      option,
      i,
      setActiveOption,
    } = props


    onChange(createOption(option).toJS())
    setActiveOption(i)
  }

  render () {
    const {
      handleChange,
      props,
    } = this
    const {
      option,
      defaultOption,
    } = props

    let activeClass
    if (defaultOption && option) {
      if (defaultOption.get('value') === option.get('value')) {
        activeClass = 'active'
      }
    }

    const name = option.get('name')

    return (
      <li className={`yoga-option yoga-option__${activeClass}`} key={name}>
        <a onClick={handleChange}>
          { name }
        </a>
      </li>
    )
  }
}

export default YogaOption
