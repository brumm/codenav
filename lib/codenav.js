'use babel'

import { CompositeDisposable, TextEditor } from 'atom'
import React from 'react'
import { render } from 'react-dom'

import { makeStore, serialize } from './store'
import { narrowMixin } from './narrow'
import Root from './components/Root'

export default {
  ...narrowMixin,
  subscriptions: new CompositeDisposable(),
  symbolView: null,

  activate() {
    this.store = makeStore()
    let subscriptions = this.subscriptions

    subscriptions.add(
      this.addNarrowCommand(),
      atom.commands.add('atom-workspace', {
        'codenav:toggle': ::this.toggle,
      }),
      atom.workspace.observeTextEditors(editor => {
        this.store.addEditor(editor)

        subscriptions.add(
          editor.onDidDestroy(() => this.store.removeEditor(editor)),
          editor.onDidStopChanging(() =>
            this.store.updateSymbolsForEditor(editor)
          ),
          editor.onDidChangeCursorPosition(({ newBufferPosition }) =>
            this.store.updateCursorPositionForEditor(editor, newBufferPosition)
          )
        )
      }),
      atom.workspace.observeActiveTextEditor(editor => {
        if (atom.workspace.isTextEditor(editor)) {
          this.store.setActiveEditor(editor)
        }
      })
    )

    this.symbolView = this.createSymbolView(this.store)
  },

  toggle() {
    atom.workspace.toggle(this.symbolView)
  },

  createSymbolView(store) {
    const view = {
      getTitle: () => 'CodeNav',
      getDefaultLocation: () => 'right',
    }

    const element = document.createElement('div')
    render(<Root store={store} />, element)
    view.element = element.firstElementChild

    return view
  },

  // serialize() {
  //   return serialize(this.store)
  // },

  deactivate() {
    this.subscriptions.dispose()
  },
}
