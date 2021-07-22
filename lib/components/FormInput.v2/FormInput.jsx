import React from 'react'
import CheckboxInput, { STYLES as CHECKBOX_STYLES } from './_CheckboxInput'
import RadioInput, { STYLES as RADIO_STYLES } from './_Radio'
import FileInput, { FILE_TYPES } from './_FileInput'
import { TYPES } from './utils'
import RadioGrouping from './_RadioGroup'
import SelectInput from './_SelectInput'
import Input from './_Input'

export { CHECKBOX_STYLES }
export { RADIO_STYLES }
export { FILE_TYPES }

export function TelInput (props) {
  return <Input type={TYPES.TEL} {...props} />
}

export function TextInput (props) {
  return <Input type={TYPES.TEXT} {...props} />
}

export function PasswordInput (props) {
  return <Input type={TYPES.PASSWORD} {...props} />
}

export function NumberInput (props) {
  return <Input type={TYPES.NUMBER} {...props} />
}

export function EmailInput (props) {
  return <Input type={TYPES.EMAIL} {...props} />
}

export function Textarea (props) {
  return <Input type={TYPES.TEXTAREA} {...props} />
}

export function TimeInput (props) {
  return <Input type={TYPES.TIME} {...props} />
}

export function Checkbox (props) {
  return <CheckboxInput type={TYPES.CHECKBOX} {...props} />
}

export function RadioGroup (props) {
  return <RadioGrouping {...props} />
}

export function SlideInput (props) {
  return <CheckboxInput asSlider type={TYPES.CHECKBOX} {...props} />
}

export function Select (props) {
  return <SelectInput {...props} />
}

export function Radio (props) {
  return <RadioInput {...props} />
}

export function HiddenInput (props) {
  return <Input {...props} type={TYPES.HIDDEN} />
}

export function FileUpload (props) {
  return <FileInput {...props} />
}

export function CommentBox (props) {
  return <Input {...props} type={TYPES.COMMENTBOX} autogrow />
}
