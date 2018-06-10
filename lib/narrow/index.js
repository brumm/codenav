'use babel'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import NarrowCodenav from './NarrowCodenav'
import NarrowProjectCodenav from './NarrowProjectCodenav'

const settings = require(atom.packages.resolvePackagePath('narrow') +
  '/lib/settings')

const PROVIDER_ID = 'narrow-codenav'

export const narrowMixin = {
  narrowInstance: null,
  config: settings.createProviderConfig({
    autoPreview: true,
    autoPreviewOnQueryChange: true,
    negateNarrowQueryByEndingExclamation: true,
    revealOnStartCondition: 'never',
  }),

  ensureNarrow() {
    if (!this.narrowInstance) {
      this.forceConsumeNarrow()
    }
  },

  addNarrowCommand() {
    return atom.commands.add('atom-text-editor', {
      'narrow:codenav-symbols': () => {
        this.ensureNarrow()
        this.narrowInstance(PROVIDER_ID)
      },
      'narrow:codenav-project-symbols': () => {
        this.ensureNarrow()
        this.narrowInstance(PROVIDER_ID + '-foo')
      },
    })
  },

  forceConsumeNarrow() {
    atom.commands.dispatch(
      atom.workspace.getElement(),
      'narrow:activate-package'
    )
  },

  consumeNarrow({ Provider, registerProvider, narrow }) {
    this.narrowInstance = narrow
    registerProvider(
      PROVIDER_ID + '-foo',
      makeProvider(Provider, this.store, PROVIDER_ID, true)
    )
    registerProvider(
      PROVIDER_ID,
      makeProvider(Provider, this.store, PROVIDER_ID)
    )
  },
}

const makeProvider = (Provider, store, providerId, isProject) =>
  isProject
    ? NarrowProjectCodenav(Provider, store, providerId)
    : NarrowCodenav(Provider, store, providerId)
