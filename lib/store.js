'use babel'

import { observable, toJS, autorun } from 'mobx'

import { getSymbolsForEditor, getCursorPosition } from './utils'

const INITIAL_EDITOR_STATE = {
  id: null,
  cursorPosition: null,
  symbols: {
    imports: [],
    exports: [],
    classes: [],
    objectMethods: [],
    functions: [],
  },
}

const INITIAL_STATE = {
  activeEditorId: null,
  editorIds: [],
  editors: {},

  getActiveEditor(id = this.activeEditorId) {
    return this.editors[id] || INITIAL_EDITOR_STATE
  },

  setActiveEditor(editor) {
    this.activeEditorId = editor.id
    this.updateSymbolsForEditor(editor)
  },

  addEditor(editor) {
    const id = editor.id
    const cursorPosition = editor
      .getBuffer()
      .characterIndexForPosition(editor.getCursorBufferPosition())

    if (!this.editorIds.includes(id)) {
      this.editorIds.push(id)
      this.editors[id] = {
        ...INITIAL_EDITOR_STATE,
        id,
        cursorPosition,
      }
    }
  },

  removeEditor({ id }) {
    const index = this.editorIds.indexOf(id)
    if (index !== -1) {
      this.editorIds.splice(index, 1)
      delete this.editors[id]
    }
  },

  updateSymbolsForEditor(editor) {
    const symbols = getSymbolsForEditor(editor)
    if (symbols) {
      this.editors[editor.id].symbols = symbols
    }
  },

  updateCursorPositionForEditor(editor, bufferPosition) {
    const position = getCursorPosition(editor, bufferPosition)
    this.editors[editor.id].cursorPosition = position
  },
}

export const makeStore = () => {
  const store = observable(INITIAL_STATE)
  Object.defineProperty(window, 'store', {
    get() {
      return toJS(store)
    },
  })

  return store
}
