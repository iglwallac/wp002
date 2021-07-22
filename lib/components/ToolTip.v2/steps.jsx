/* eslint-disable max-len */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable import/prefer-default-export */
import { List, Map } from 'immutable'
import {
  SET_NAVIGATION_OVERLAY_VISIBLE,
} from 'components/Header/actions'

const scrollSectionPlacement = () => {
  const element = document.querySelector('#main-app div.section-placement__wrapper')
  if (element) element.scrollIntoView()
}

const scrollToHeader = () => {
  const element = document.querySelector('#header-app header > div')
  if (element) element.scrollIntoView()
}

export const TOUR_STEPS_MOBILE = List([
  Map({
    title: 'Welcome to Your New Journey',
    body: 'Explore transformative content that supports your journey.',
    startFunctions: [
      scrollSectionPlacement,
      scrollToHeader,
    ],
    endActions: [{ type: SET_NAVIGATION_OVERLAY_VISIBLE, payload: true }],
  }),
  Map({
    title: 'Watch a Series',
    body: 'Original content by the people who inspire you most.',
    activeArrow: 'series-active-arrow',
    startFunctions: [
      () => {
        const scroll = setInterval(() => {
          const scrollElement = document.querySelector('#nav__mobile .nav__primary > .nav__item:nth-of-type(4)')
          if (scrollElement) scrollElement.scrollIntoView({ block: 'center', inline: 'center' })
          clearInterval(scroll)
        }, 1000)
      },
    ],
    startActions: [{ type: SET_NAVIGATION_OVERLAY_VISIBLE, payload: true }],
    endActions: [{ type: SET_NAVIGATION_OVERLAY_VISIBLE, payload: false }],
  }),
  Map({
    title: 'Films and Documentaries',
    body: 'Find empowering, eye-opening films and documentaries.',
    activeArrow: 'docs-films-arrow',
    startFunctions: [
      () => {
        const scroll = setInterval(() => {
          const scrollElement = document.querySelector('#nav__mobile .nav__primary > .nav__item:nth-of-type(5)')
          if (scrollElement) scrollElement.scrollIntoView({ block: 'center', inline: 'center' })
          clearInterval(scroll)
        }, 1000)
      },
    ],
    startActions: [{ type: SET_NAVIGATION_OVERLAY_VISIBLE, payload: true }],
    endActions: [{ type: SET_NAVIGATION_OVERLAY_VISIBLE, payload: false }],
  }),
  Map({
    title: 'Discover a New Topic',
    body: 'Explore dozens of topics and expand your toolbox.',
    activeArrow: 'topics-arrow',
    startFunctions: [
      () => {
        const scroll = setInterval(() => {
          const scrollElement = document.querySelector('#nav__mobile .nav__primary > .nav__item:nth-of-type(3)')
          if (scrollElement) scrollElement.scrollIntoView({ block: 'top', inline: 'center' })
          clearInterval(scroll)
        }, 1000)
      },
    ],
    startActions: [{ type: SET_NAVIGATION_OVERLAY_VISIBLE, payload: true }],
    endActions: [{ type: SET_NAVIGATION_OVERLAY_VISIBLE, payload: false }],
  }),
  Map({
    title: 'Expand Your Practice',
    body: 'Classes that you can sort by focus, teacher, or duration.',
    startActions: [{ type: SET_NAVIGATION_OVERLAY_VISIBLE, payload: true }],
    endActions: [{ type: SET_NAVIGATION_OVERLAY_VISIBLE, payload: false }],
    activeArrow: 'yoga-meditation-arrow',
  }),
])

export const TOUR_STEPS_DESKTOP = List([
  Map({
    title: 'Welcome to Your New Journey',
    body: 'Explore our wide library of transformative content and create a custom experience you’ll love.',
    startFunctions: [
      scrollSectionPlacement,
      scrollToHeader,
    ],
  }),
  Map({
    title: 'Watch a Series',
    body: 'Dive straight into a Gaia series and filter by the people who inspire you most.',
    activeArrow: 'series-active-arrow',
    startFunctions: [
      scrollSectionPlacement,
      scrollToHeader,
    ],
  }),
  Map({
    title: 'Films and Documentaries',
    body: 'Find empowering, eye-opening films and documentaries, and filter by some of your favorite subjects.',
    activeArrow: 'docs-films-arrow',
    startFunctions: [
      scrollSectionPlacement,
      scrollToHeader,
    ],
  }),
  Map({
    title: 'Discover a Topic',
    body: 'Explore dozens of topics and expand your toolbox.',
    activeArrow: 'topics-arrow',
    startFunctions: [
      scrollSectionPlacement,
      scrollToHeader,
    ],
  }),
  Map({
    title: 'Practice Yoga & Meditation',
    body: 'Transform your journey through yoga and meditation classes that you can sort by focus, teacher, or duration.',
    activeArrow: 'yoga-meditation-arrow',
    startFunctions: [
      scrollSectionPlacement,
      scrollToHeader,
    ],
  }),
])
