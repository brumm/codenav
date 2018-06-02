'use babel'

import React from 'react'
import cx from 'classnames'
import groupBy from 'lodash/groupBy'
import isEqual from 'lodash/isEqual'

const Subtle = props => <span className="text-subtle" {...props} />
const Spacer = props => <span className="needs-spacer" {...props} />

function foo() {}

const needsParenthesesForArguments = params =>
  !params.every(({ type }) => type === 'Identifier') || params.length > 1

const makeParams = params => (
  <span>
    {params.map(node => <Spacer>{makeComponentForNode(node)}</Spacer>)}
  </span>
)

const TYPES = {
  ExportDefaultDeclaration: ({ declaration }) => (
    <Spacer>
      <Subtle>{'export default '}</Subtle>
      {makeComponentForNode(declaration)}
    </Spacer>
  ),
  ExportNamedDeclaration: ({ declaration, specifiers }) => (
    <span>
      <Subtle>{'export '}</Subtle>
      {declaration && makeComponentForNode(declaration)}
      {!!specifiers.length && (
        <Spacer>
          <Subtle>{'{ '}</Subtle>
          {specifiers.map(makeComponentForNode)}
          <Subtle>{' }'}</Subtle>
        </Spacer>
      )}
    </span>
  ),
  ExportDefaultSpecifier: ({ local, exported }) => (
    <Spacer>
      {makeComponentForNode(local)}
      {exported && (
        <span>
          <Subtle>{' as '}</Subtle>
          {makeComponentForNode(exported)}
        </span>
      )}
    </Spacer>
  ),
  ExportSpecifier: ({ local, exported }) => (
    <Spacer>
      {makeComponentForNode(local)}
      {exported && (
        <span>
          <Subtle>{' as '}</Subtle>
          {makeComponentForNode(exported)}
        </span>
      )}
    </Spacer>
  ),
  ImportDeclaration: ({ source, specifiers }) => {
    let {
      ImportDefaultSpecifier: [ImportDefaultSpecifier] = [],
      ImportNamespaceSpecifier: [ImportNamespaceSpecifier] = [],
      ImportSpecifier,
    } = groupBy(specifiers, 'type')

    return (
      <span>
        {[
          ImportDefaultSpecifier && (
            <Spacer>{makeComponentForNode(ImportDefaultSpecifier)}</Spacer>
          ),
          ImportNamespaceSpecifier && (
            <Spacer>{makeComponentForNode(ImportNamespaceSpecifier)}</Spacer>
          ),
          ImportSpecifier && (
            <Spacer>
              <Subtle>{'{ '}</Subtle>
              {ImportSpecifier.map(node => (
                <Spacer>{makeComponentForNode(node)}</Spacer>
              ))}
              <Subtle>{' }'}</Subtle>
            </Spacer>
          ),
        ].filter(Boolean)}
        <Subtle>{` from `}</Subtle>
        <span>{makeComponentForNode(source)}</span>
      </span>
    )
  },
  ImportDefaultSpecifier: ({ local }) => makeComponentForNode(local),
  ImportNamespaceSpecifier: ({ local }) =>
    `* as ${makeComponentForNode(local)}`,
  ImportSpecifier: ({ imported }) => makeComponentForNode(imported),
  CallExpression: ({ callee }) => (
    <span>
      {makeComponentForNode(callee)}
      <Subtle>{'()'}</Subtle>
    </span>
  ),
  StringLiteral: ({ value }) => `'${value}'`,
  Identifier: ({ name }) => name,
  MemberExpression: ({ object, property }) => (
    <span>
      {makeComponentForNode(object)}
      <Subtle>.</Subtle>
      {makeComponentForNode(property)}
    </span>
  ),
  ArrowFunctionExpression: ({ params, body }) => {
    const parens = needsParenthesesForArguments(params)
    return (
      <span>
        {parens && <Subtle>{'('}</Subtle>}
        {makeParams(params)}
        {parens && <Subtle>{')'}</Subtle>}
        <Subtle>{' => '}</Subtle>
        {body.type === 'BlockStatement' ? (
          <Subtle>{'{}'}</Subtle>
        ) : (
          <Subtle>{'()'}</Subtle>
        )}
      </span>
    )
  },
  AssignmentPattern: ({ left, right }) => (
    <span>
      {makeComponentForNode(left)}
      <Subtle>{' = '}</Subtle>
      {makeComponentForNode(right)}
    </span>
  ),
  ObjectPattern: ({ properties }) => (
    <span>
      <Subtle>{'{ '}</Subtle>
      {properties.map(node => <Spacer>{makeComponentForNode(node)}</Spacer>)}
      <Subtle>{' }'}</Subtle>
    </span>
  ),
  ArrayPattern: ({ elements }) => (
    <span>
      <Subtle>{'[ '}</Subtle>
      {elements.map(node => <Spacer>{makeComponentForNode(node)}</Spacer>)}
      <Subtle>{' ]'}</Subtle>
    </span>
  ),
  ObjectMethod: ({ key }) => (
    <span>
      {makeComponentForNode(key)}
      <Subtle>{'() {}'}</Subtle>
    </span>
  ),
  RestProperty: ({ argument, ...stuff }) => (
    <span>
      <Subtle>...</Subtle>
      {makeComponentForNode(argument)}
    </span>
  ),
  ObjectProperty: ({ key, value, shorthand }) => {
    const isShorthand = shorthand && isEqual(key.loc, value.loc)
    const shouldShowKey = value.type !== 'AssignmentPattern'
    if (isShorthand) return makeComponentForNode(key)

    return (
      <span>
        {shouldShowKey && makeComponentForNode(key)}
        {shouldShowKey && <Subtle>{': '}</Subtle>}
        {makeComponentForNode(value)}
      </span>
    )
  },
  ArrayExpression: () => <span>{'[]'}</span>,
  ObjectExpression: () => <span>{'{}'}</span>,
  ClassProperty: ({ key, value }) => (
    <span>
      {makeComponentForNode(key)}
      <Subtle>{' = '}</Subtle>
      {makeComponentForNode(value)}
    </span>
  ),
  ClassMethod: ({ key, params }) => {
    return (
      <span>
        {makeComponentForNode(key)}
        <Subtle>{'('}</Subtle>
        {makeParams(params)}
        <Subtle>{')'}</Subtle>
        <Subtle>{' {}'}</Subtle>
      </span>
    )
  },
  ClassDeclaration: ({ id, superClass }) => (
    <span>
      <Subtle>{'class '}</Subtle>
      {makeComponentForNode(id)}
      {superClass && (
        <span>
          <Subtle>{' extends '}</Subtle>
          {makeComponentForNode(superClass)}
          <Subtle>{' {}'}</Subtle>
        </span>
      )}
    </span>
  ),
  FunctionDeclaration: ({ id, params }) => {
    return (
      <span>
        <Subtle>{'function '}</Subtle>
        {makeComponentForNode(id)}
        <Subtle>{'('}</Subtle>
        {makeParams(params)}
        <Subtle>{')'}</Subtle>
        <Subtle>{' {}'}</Subtle>
      </span>
    )
  },
  VariableDeclaration: ({ declarations }) =>
    declarations.map(({ id }) => makeComponentForNode(id)),
  VariableDeclarator: ({ kind, id, init }) => (
    <span>
      {makeComponentForNode(id)}
      <Subtle>{` = `}</Subtle>
      {makeComponentForNode(init)}
    </span>
  ),
}

const makeComponentForNode = node => {
  if (!node) {
    console.trace('no node')
    return <span className="text-error">no node</span>
  }
  return TYPES[node.type] ? (
    TYPES[node.type](node)
  ) : (
    <span className="text-warning">{node.type}</span>
  )
}

export default makeComponentForNode
