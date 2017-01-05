'use babel'

import { CompositeDisposable, Point } from 'atom'
import React from 'react'
import { render } from 'react-dom'
import flattenDeep from 'lodash/flattenDeep'
import * as babylon from 'babylon'
const { default: traverse} = require('babel-traverse')

import * as COMPONENTS from './components'
import getFocusPath from './getFocusPath'

const VALID_SCOPES = [
  'source.js',
  'source.js.jsx'
]

const fakeParser = {
  nodeToRange(node) {
    if (typeof node.start !== 'undefined') {
      return [node.start, node.end];
    }
  },

  *forEachProperty(node) {
    for (let prop in node) {
      yield {
        value: node[prop],
        key: prop,
        computed: false,
      }
    }
  },
}


const PARSER_OPTIONS = {
    sourceType: 'module',
    plugins: ['*']
}

const goTo = ({ start, end }) => {
  const startPosition = new Point(start.line - 1, start.column)

  const editor = atom.workspace.getActiveTextEditor()

  editor.setCursorBufferPosition(startPosition)
  editor.scrollToBufferPosition(startPosition, { center: true })
}

const renderNode = node => (
  COMPONENTS[node.type]
  ? React.createElement(
    COMPONENTS[node.type], {
      node,
      goTo: () => goTo(node.loc),
      renderNode
    })
  : console.info('unknown type', node.type, node) || null
)

const Error = ({ error }) => (
  <div className='list-tree codenav'>
    <li className='list-nested-item'>
      <div className='list-item' onClick={() => goTo({start: error.loc})}>
        <span className='inline-block text-error'>{error.message}</span>
      </div>
    </li>
  </div>
)

class App extends React.Component {
  state = {
    ast: {}
  }

  render() {
    const { ast, error } = this.state

    if (error) {
      console.dir(error)
      return <Error error={error} />
    }

    return (
      ast.program ? (
        <ol className='list-tree codenav'>
          {ast.program.body.map(renderNode)}
        </ol>
      ) : null
    )
  }
}

export default {

  panel: null,
  subscriptions: null,

  activate() {
    this.panel = atom.workspace.addRightPanel({
      item: document.createElement('div'),
      visible: true
    })

    render(
      <App ref={component => this.setState = ::component.setState} />,
      this.panel.item
    )

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register command that toggles this view
    this.subscriptions.add(
      atom.workspace.observeTextEditors(editor => editor.onDidStopChanging(::this.updateTree)),
      atom.workspace.onDidStopChangingActivePaneItem(::this.updateTree),

      atom.commands.add('atom-workspace', { 'codenav:toggle': ::this.toggle }),
      atom.commands.add('atom-workspace', { 'codenav:highlightCurrentScope': ::this.highlightCurrentScope })
    )
  },

  deactivate() {
    this.panel.destroy()
    this.subscriptions.dispose()
  },

  getEditor() {
    return atom.workspace
      .getActiveTextEditor()
  },

  getActiveBufferText() {
    return this.getEditor()
      .getBuffer().getText()
  },

  getAST() {
    try {
      return {
        ast: babylon.parse(this.getActiveBufferText(), PARSER_OPTIONS),
        error: false
      }
    } catch (error) {
      return { error }
    }
  },

  highlightCurrentScope() {
    // const AST = this.getAST()
    const editor = this.getEditor()
    console.log(
      editor.getBuffer().characterIndexForPosition(
        this.getEditor().getCursorBufferPosition()
      )
    )

    //
    // let nodeChain = flattenDeep(
    //   getFocusPath(
    //     AST,
    //     editor.getBuffer().characterIndexForPosition(
    //       this.getEditor().getCursorBufferPosition()
    //     ),
    //     fakeParser
    //   )
    //   .filter(node => !Array.isArray(node))
    // )
    //
    // nodeChain = nodeChain.slice(2)
    //
    // nodeChain.forEach(({ loc: { start, end }}) => {
    //   const marker = editor.markBufferRange(
    //     [[start.line - 1, start.column], [end.line - 1, end.column]],
    //     { invalidate: 'never' }
    //   )
    //
    //   editor.decorateMarker(marker, {
    //     type: 'highlight',
    //     class: 'codenav-highlight',
    //   })
    // })
  },

  updateTree() {
    const editor = this.getEditor()
    if (editor) {
      const rootScope = editor.getRootScopeDescriptor().getScopesArray()[0]
      if (VALID_SCOPES.includes(rootScope)) {
        const AST = this.getAST()
        this.setState(AST)
        this.panel.show()
      } else {
        this.panel.hide()
      }
    }
  },

  toggle() {
    if (this.panel.isVisible()) {
      this.panel.hide()
    } else {
      this.updateTree()
      this.panel.show()
    }
  }

}
