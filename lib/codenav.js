'use babel'

import { CompositeDisposable, TextEditor } from 'atom'
import React, { asd } from 'react'
import { render } from 'react-dom'
import { parse } from 'babylon'
import { observable, runInAction } from 'mobx'
import { Provider } from 'mobx-react'
import traverse from 'babel-traverse'

import App from './components/App'
import { VALID_SCOPES, PARSER_OPTIONS } from './constants'
import getFocusPath from './getFocusPath'

const INITIAL_STATE = {
  editor: null,
  cursorPosition: null,

  imports: [],
  exports: [],
  classes: [],
  objectMethods: [],
  functions: [],
}

let STATE = observable(INITIAL_STATE)

export default {
  subscriptions: null,

  activate() {
    const that = this
    this.item = {
      element: document.createElement('div'),
      getTitle() {
        return 'CodeNav'
      },
      getDefaultLocation() {
        return 'right'
      },
      getPreferredWidth() {
        return that.appRef.getWidth()
      },
    }
    this.item.element.className = 'tool-panel codenav-container'

    render(
      <Provider store={STATE}>
        <App ref={({ wrappedInstance }) => (this.appRef = wrappedInstance)} />
      </Provider>,
      this.item.element
    )

    this.subscriptions = new CompositeDisposable(
      atom.workspace.observeTextEditors(editor =>
        editor.onDidStopChanging(() => this.updateTree(editor))
      ),
      atom.workspace.observeTextEditors(editor =>
        editor.onDidChangeCursorPosition(({ newBufferPosition }) =>
          this.updateCursorPosition(editor, newBufferPosition)
        )
      ),
      atom.workspace.onDidStopChangingActivePaneItem(
        paneItem => paneItem instanceof TextEditor && this.updateTree(paneItem)
      ),
      atom.commands.add('atom-workspace', {
        'codenav:toggle': ::this.toggle,
      })
    )

    this.updateTree(atom.workspace.getActiveTextEditor())
    atom.workspace.open(this.item)
  },

  updateCursorPosition(editor, newBufferPosition) {
    STATE.cursorPosition = editor
      .getBuffer()
      .characterIndexForPosition(newBufferPosition)
  },

  getASTFor(text) {
    try {
      return parse(text, PARSER_OPTIONS)
    } catch (e) {
      return false
    }
  },

  updateTree(editor) {
    if (editor && editor.getRootScopeDescriptor) {
      const [rootScope] = editor.getRootScopeDescriptor().getScopesArray()
      const bufferText = editor.getBuffer().getText()

      if (VALID_SCOPES.includes(rootScope)) {
        this.ast = this.getASTFor(bufferText)
        const imports = []
        const exports = []
        const classes = []
        const objectMethods = []
        const functions = []

        if (this.ast) {
          try {
            traverse(this.ast, {
              'ExportDefaultDeclaration|ExportNamedDeclaration': path => {
                exports.push(path)
              },

              ImportDeclaration: path => {
                imports.push(path)
              },

              ObjectMethod: path => {
                objectMethods.push(path)
              },

              ClassDeclaration: path => {
                classes.push(path)
              },

              ArrowFunctionExpression: ({ parentPath }) => {
                parentPath.isObjectProperty() && objectMethods.push(parentPath)
                parentPath.isVariableDeclarator() && functions.push(parentPath)
              },

              FunctionDeclaration: path => {
                functions.push(path)
              },
            })

            runInAction(() => {
              STATE.imports = imports
              STATE.exports = exports
              STATE.classes = classes
              STATE.objectMethods = objectMethods
              STATE.functions = functions
            })
          } catch (e) {
            console.error(e)
          }
        }
      } else {
        runInAction(() => {
          STATE.imports = INITIAL_STATE.imports
          STATE.exports = INITIAL_STATE.exports
          STATE.classes = INITIAL_STATE.classes
          STATE.objectMethods = INITIAL_STATE.objectMethods
          STATE.functions = INITIAL_STATE.functions
        })
      }
    }
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  toggle() {
    atom.workspace.toggle(this.item)
  },
}
