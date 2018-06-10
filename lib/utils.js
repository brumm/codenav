'use babel'

import { Point } from 'atom'
import { parse } from 'babylon'
import traverse from 'babel-traverse'
import fs from 'fs'

import { VALID_SCOPES, PARSER_OPTIONS } from './constants'

const readFile = path =>
  new Promise((resolve, reject) =>
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  )

export const goTo = ({ start, end }) => {
  const startPosition = new Point(start.line - 1, start.column)
  const editor = atom.workspace.getActiveTextEditor()

  editor.setCursorBufferPosition(startPosition)
  editor.scrollToBufferPosition(startPosition, { center: true })
  atom.workspace.open(editor)
}

export const getASTFor = text => {
  try {
    return parse(text, PARSER_OPTIONS)
  } catch (e) {
    return false
  }
}

export const getCursorPosition = (editor, bufferPosition) =>
  editor.getBuffer().characterIndexForPosition(bufferPosition)

export const getSymbolsForEditor = editor => {
  let ast
  const symbols = {
    imports: [],
    exports: [],
    classes: [],
    objectMethods: [],
    functions: [],
  }
  if (editor && editor.getRootScopeDescriptor) {
    const [rootScope] = editor.getRootScopeDescriptor().getScopesArray()
    const bufferText = editor.getBuffer().getText()

    if (VALID_SCOPES.includes(rootScope)) {
      ast = getASTFor(bufferText)
      if (ast) {
        try {
          traverse(ast, {
            'ExportDefaultDeclaration|ExportNamedDeclaration': path => {
              symbols.exports.push(path)
            },

            ImportDeclaration: path => {
              symbols.imports.push(path)
            },

            ObjectMethod: path => {
              symbols.objectMethods.push(path)
            },

            ClassDeclaration: path => {
              symbols.classes.push(path)
            },

            ArrowFunctionExpression: ({ parentPath }) => {
              parentPath.isObjectProperty() &&
                symbols.objectMethods.push(parentPath)
              parentPath.isVariableDeclarator() &&
                symbols.functions.push(parentPath)
            },

            FunctionDeclaration: path => {
              symbols.functions.push(path)
            },
          })

          return symbols
        } catch (e) {
          return symbols
        }
      }
    } else {
      return symbols
    }
  }
}

export const getSymbolsForPath = path =>
  readFile(path)
    .then(getSymbolsForText)
    .then(symbols => ({ path, symbols }))

const getSymbolsForText = bufferText => {
  let ast
  const symbols = []

  ast = getASTFor(bufferText)
  if (ast) {
    try {
      traverse(ast, {
        'ObjectMethod|FunctionDeclaration|ClassProperty|ClassMethod': path => {
          symbols.push(path)
        },

        ArrowFunctionExpression: ({ parentPath }) => {
          parentPath.isObjectProperty() && symbols.push(parentPath)
          parentPath.isVariableDeclarator() && symbols.push(parentPath)
        },
      })
      return symbols
    } catch (e) {
      return symbols
    }
  }
}

export const getRenderedTextForComponent = Component => {
  if (typeof Component === 'string' || Component === null) {
    return Component
  }

  if (Array.isArray(Component)) {
    return Component.map(getRenderedTextForComponent).join('')
  }

  if (Component.props && Component.props.children) {
    return getRenderedTextForComponent(Component.props.children)
  }

  if (Component.props && !Component.props.children) {
    return ''
  }
}

export const getPointForNode = ({ loc: { start: { line, column } } }) =>
  new Point(line - 1, column)
