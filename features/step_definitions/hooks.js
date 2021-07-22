import { After } from 'cucumber'
import { quitDriver } from '../support/world'

After({ tags: '@close-browser' }, () => quitDriver())
