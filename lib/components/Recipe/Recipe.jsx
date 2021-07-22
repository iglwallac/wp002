/* eslint-disable no-nested-ternary, react/no-danger */
import React, { Component } from 'react'
import { List, Map } from 'immutable'
import _includes from 'lodash/includes'
import compose from 'recompose/compose'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { markdownToHtml } from 'services/markdown'
import { Card } from 'components/Card'
import { Button, TYPES, SIZES } from 'components/Button.v2'

export const DELIMITER = '---'
const DELIMITER2 = '### Directions'

class Recipe extends Component {
  constructor (props) {
    super(props)
    const { data } = props
    let markdown = data.get('description', '')
    let recipe = Map()
    if (_includes(markdown, DELIMITER)) {
      markdown = List(markdown.split(DELIMITER)) || List()
      recipe = List(markdown.get(1).replace(DELIMITER2, `${DELIMITER}${DELIMITER2}`).split(DELIMITER))
    }

    this.state = {
      title: data.get('title', ''),
      ingredients: recipe.get(0, ''),
      directions: recipe.get(1, ''),
      viewMore: false,
    }
  }

  printRecipe = () => {
    const curURL = window.location.href
    history.replaceState(history.state, '', '/')
    window.print()
    history.replaceState(history.state, '', curURL)
  }

  toggleHiddenDirections = () => {
    const { viewMore } = this.state
    this.setState({ viewMore: !viewMore })
  }

  renderMarkdown = (markdown, className) => {
    const { viewMore } = this.state
    if (!markdown) {
      return null
    }
    const html = markdownToHtml(markdown)
    const cn = `recipe__${className}`

    if (className === 'directions') {
      return (
        <div className={viewMore ? cn : `${cn} hidden`} dangerouslySetInnerHTML={{ __html: html }} />
      )
    }

    return <div className={cn} dangerouslySetInnerHTML={{ __html: html }} />
  }

  render () {
    const { title, ingredients, directions, viewMore } = this.state
    const { toggleHiddenDirections, renderMarkdown, printRecipe, props } = this
    const { staticText } = props

    return (
      <Card className="recipe__card">
        <div className="recipe__header">
          <div className="recipe__title">{title}</div>
          <Button
            onClick={printRecipe}
            className="recipe__print-button"
            size={SIZES.DEFAULT}
            type={TYPES.ICON}
            icon={ICON_TYPES.PRINTER}
          >
            {staticText.getIn(['data', 'printRecipe'])}
          </Button>
        </div>
        {renderMarkdown(ingredients, 'ingredients')}
        {renderMarkdown(directions, 'directions')}
        {directions === '' ?
          null :
          viewMore ?
            <a onClick={toggleHiddenDirections} className="recipe__directions-toggle">{staticText.getIn(['data', 'viewLess'])}<IconV2 className="recipe__chevron" type={ICON_TYPES.CHEVRON_UP} /></a>
            :
            <a onClick={toggleHiddenDirections} className="recipe__directions-toggle">{staticText.getIn(['data', 'viewMore'])}<IconV2 className="recipe__chevron" type={ICON_TYPES.CHEVRON_DOWN} /></a>
        }
      </Card>
    )
  }
}

export default compose(
  connectStaticText({ storeKey: 'recipe' }),
)(Recipe)
