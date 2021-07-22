/* eslint-disable react/jsx-filename-extension */
import { describe, it } from 'mocha'
import { assert } from 'chai'
import td from 'testdouble'
import { getIcon, handleOnClick } from './Button'

const props = {
  url: 'http://www.example.org',
  rel: 'noopener noreferrer',
  query: {},
  text: 'Foo',
  buttonClass: ['button--foo', 'button-bar', 'button-baz'],
  iconClass: ['icon--foo'],
  // onClick: _identity,
  target: '_blank',
}

describe('component Button', () => {
  describe('Function getIcon()', () => {
    // it('well-formed data', () => {
    //   const result = getIcon(props.iconClass)
    //   assert.equal(
    //     result.type.name,
    //     'Icon',
    //     'A valid "Button" component is returned',
    //   )
    // })

    it('malformed data', () => {
      const result = getIcon(props.iconClass.shift())
      assert.equal(result, null, 'Expect function to return "null"')
    })
  })

  describe('Function handleOnClick()', () => {
    it('stopPropagation() is called on the event', () => {
      const event = { stopPropagation: td.function() }
      handleOnClick(event, props)
      td.verify(event.stopPropagation())
    })

    it('preventDefault() called when props are empty', () => {
      const event = {
        stopPropagation () {},
        preventDefault: td.function(),
      }
      handleOnClick(event, {})
      td.verify(event.preventDefault())
    })
  })
})
