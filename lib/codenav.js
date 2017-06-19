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

const STATE = observable({
  editor: null,
  focusPath: null,
  imports: [],
  classes: [],
  objectMethods: [],
  functions: [],
})

export default {
  panel: null,
  subscriptions: null,

  activate() {
    const that = this
    this.item = {
      element: document.createElement('div'),
      getTitle() {
        return 'CodeNav'
      },
      getDefaultLocation() {
        return 'left'
      },
      getPreferredWidth() {
        return that.appRef.getWidth()
      },
    }
    this.item.element.className = 'tool-panel tree-view'

    render(
      <Provider store={STATE}>
        <App ref={({ wrappedInstance }) => this.appRef = wrappedInstance} />
      </Provider>,
      this.item.element
    )

    this.subscriptions = new CompositeDisposable(
      atom.workspace.observeTextEditors(editor =>
        editor.onDidStopChanging(() => this.updateTree(editor))
      ),
      // atom.workspace.observeTextEditors(editor =>
      //   editor.onDidChangeCursorPosition(({ newBufferPosition }) => this.getPathForCursor(editor, newBufferPosition))
      // ),
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

  getPathForCursor(editor, newBufferPosition) {
    const position = editor.getBuffer().characterIndexForPosition(newBufferPosition)
    if (this.ast) {
      STATE.focusPath = getFocusPath(this.ast, position)
    }
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
        const classes = []
        const objectMethods = []
        const functions = []

        if (this.ast) {
          try {
            traverse(this.ast, {
              ImportDeclaration: path => {
                imports.push(path)
              },

              ObjectMethod: path => {
                objectMethods.push(path)
              },

              ArrowFunctionExpression: path => {
                path.parentPath.isObjectProperty() && objectMethods.push(path.parentPath)
              },

              ClassDeclaration: path => {
                classes.push(path)
              },

              ArrowFunctionExpression: ({ parentPath }) => {
                parentPath.isVariableDeclarator() && functions.push(parentPath)
              },

              FunctionDeclaration: path => {
                functions.push(path)
              },
            })

            runInAction(() => {
              STATE.imports = imports
              STATE.classes = classes
              STATE.objectMethods = objectMethods
              STATE.functions = functions
            })
          } catch (e) {
            console.error(e)
          }
        }
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
