'use babel'

import React, { Fragment } from 'react'
import cx from 'classnames'
import groupBy from 'lodash/groupBy'
import isEqual from 'lodash/isEqual'

const Subtle = props => <span className="text-subtle" {...props} />
const Spacer = ({ index = 0, array = [], children }) => (
  <Fragment>
    {children}
    {index !== array.length - 1 && <Subtle>{', '}</Subtle>}
  </Fragment>
)

const needsParenthesesForArguments = params => {
  if (params.length === 0) {
    return true
  } else {
    return (
      !params.every(({ type }) => type === 'Identifier') || params.length > 1
    )
  }
}

const makeParams = params => (
  <Fragment>
    {params.map((node, index, array) => (
      <Spacer {...{ index, array }}>{makeComponentForNode(node)}</Spacer>
    ))}
  </Fragment>
)

const TYPES = {
  ExportDefaultDeclaration: ({ declaration }) => (
    <Fragment>
      <Subtle>{'export default '}</Subtle>
      {makeComponentForNode(declaration)}
    </Fragment>
  ),
  ExportNamedDeclaration: ({ declaration, specifiers }) => (
    <Fragment>
      <Subtle>{'export '}</Subtle>
      {declaration && makeComponentForNode(declaration)}
      {!!specifiers.length && (
        <strong>
          <Subtle>{'{ '}</Subtle>
          {specifiers.map((node, index, array) => (
            <Spacer {...{ index, array }}>{makeComponentForNode(node)}</Spacer>
          ))}
          <Subtle>{' }'}</Subtle>
        </strong>
      )}
    </Fragment>
  ),
  ExportDefaultSpecifier: ({ local, exported }) => (
    <Fragment>
      {makeComponentForNode(local)}
      {exported && (
        <Fragment>
          <Subtle>{' as '}</Subtle>
          {makeComponentForNode(exported)}
        </Fragment>
      )}
    </Fragment>
  ),
  ExportSpecifier: ({ local, exported }) => {
    const localEqualsExported = local.name === exported.name
    return (
      <Fragment>
        {makeComponentForNode(local)}
        {!localEqualsExported &&
          exported && (
            <span>
              <Subtle>{' as '}</Subtle>
              {makeComponentForNode(exported)}
            </span>
          )}
      </Fragment>
    )
  },
  ImportDeclaration: ({ source, specifiers }) => {
    let {
      ImportDefaultSpecifier: [ImportDefaultSpecifier] = [],
      ImportNamespaceSpecifier: [ImportNamespaceSpecifier] = [],
      ImportSpecifier = [],
    } = groupBy(specifiers, 'type')
    let nodes = [...[ImportDefaultSpecifier, ImportNamespaceSpecifier]].filter(
      Boolean
    )
    if (ImportSpecifier.length) {
      nodes = [
        ...nodes,
        { type: '@@@ImportNamedSpecifier', nodes: ImportSpecifier },
      ]
    }

    return (
      <Fragment>
        <Subtle>{`import `}</Subtle>
        {nodes.map((node, index, array) => (
          <Spacer {...{ index, array }}>{makeComponentForNode(node)}</Spacer>
        ))}
        <Subtle>{` from `}</Subtle>
        {makeComponentForNode(source)}
      </Fragment>
    )
  },
  '@@@ImportNamedSpecifier': ({ nodes }) => (
    <Fragment>
      <Subtle>{'{ '}</Subtle>
      {nodes.map((node, index, array) => (
        <Spacer {...{ index, array }}>{makeComponentForNode(node)}</Spacer>
      ))}
      <Subtle>{' }'}</Subtle>
    </Fragment>
  ),
  ImportDefaultSpecifier: ({ local }) => makeComponentForNode(local),
  ImportNamespaceSpecifier: ({ local }) =>
    `* as ${makeComponentForNode(local)}`,
  ImportSpecifier: ({ imported }) => makeComponentForNode(imported),
  CallExpression: ({ callee, arguments: [args] }) => (
    <Fragment>
      {makeComponentForNode(callee)}
      <Subtle>{'('}</Subtle>
      {makeComponentForNode(args)}
      <Subtle>{')'}</Subtle>
    </Fragment>
  ),
  StringLiteral: ({ value }) => `'${value}'`,
  Identifier: ({ name }) => name,
  MemberExpression: ({ object, property }) => (
    <Fragment>
      {makeComponentForNode(object)}
      <Subtle>.</Subtle>
      {makeComponentForNode(property)}
    </Fragment>
  ),
  ArrowFunctionExpression: ({ params, body }) => {
    const parens = needsParenthesesForArguments(params)
    return (
      <Fragment>
        {parens && <Subtle>{'('}</Subtle>}
        {makeParams(params)}
        {parens && <Subtle>{')'}</Subtle>}
        <Subtle>{' => '}</Subtle>
        {body.type === 'BlockStatement' ? (
          <Subtle>{'{}'}</Subtle>
        ) : (
          <Subtle>{'()'}</Subtle>
        )}
      </Fragment>
    )
  },
  AssignmentPattern: ({ left, right }) => (
    <Fragment>
      {makeComponentForNode(left)}
      <Subtle>{' = '}</Subtle>
      {makeComponentForNode(right)}
    </Fragment>
  ),
  ObjectPattern: ({ properties }) => (
    <Fragment>
      <Subtle>{'{ '}</Subtle>
      {properties.map((node, index, array) => (
        <Spacer {...{ index, array }}>{makeComponentForNode(node)}</Spacer>
      ))}
      <Subtle>{' }'}</Subtle>
    </Fragment>
  ),
  ArrayPattern: ({ elements }) => (
    <Fragment>
      <Subtle>{'[ '}</Subtle>
      {elements.map((node, index, array) => (
        <Spacer {...{ index, array }}>{makeComponentForNode(node)}</Spacer>
      ))}
      <Subtle>{' ]'}</Subtle>
    </Fragment>
  ),
  ObjectMethod: ({ key }) => (
    <Fragment>
      {makeComponentForNode(key)}
      <Subtle>{'() {}'}</Subtle>
    </Fragment>
  ),
  RestProperty: ({ argument, ...stuff }) => (
    <Fragment>
      <Subtle>...</Subtle>
      {makeComponentForNode(argument)}
    </Fragment>
  ),
  ObjectProperty: ({ key, value, shorthand }) => {
    const isShorthand = shorthand && isEqual(key.loc, value.loc)
    const shouldShowKey = value.type !== 'AssignmentPattern'
    if (isShorthand) return makeComponentForNode(key)

    return (
      <Fragment>
        {shouldShowKey && makeComponentForNode(key)}
        {shouldShowKey && <Subtle>{': '}</Subtle>}
        {makeComponentForNode(value)}
      </Fragment>
    )
  },
  ArrayExpression: () => '[]',
  ObjectExpression: () => '{}',
  ClassProperty: ({ key, value }) => (
    <Fragment>
      {makeComponentForNode(key)}
      <Subtle>{' = '}</Subtle>
      {makeComponentForNode(value)}
    </Fragment>
  ),
  ClassMethod: ({ key, params }) => (
    <Fragment>
      {makeComponentForNode(key)}
      <Subtle>{'('}</Subtle>
      {makeParams(params)}
      <Subtle>{')'}</Subtle>
      <Subtle>{' {}'}</Subtle>
    </Fragment>
  ),
  ClassDeclaration: ({ id, superClass }) => (
    <Fragment>
      <Subtle>{'class '}</Subtle>
      {makeComponentForNode(id)}
      {superClass && (
        <Fragment>
          <Subtle>{' extends '}</Subtle>
          {makeComponentForNode(superClass)}
          <Subtle>{' {}'}</Subtle>
        </Fragment>
      )}
    </Fragment>
  ),
  FunctionDeclaration: ({ id, params }) => {
    return (
      <Fragment>
        <Subtle>{'function '}</Subtle>
        {makeComponentForNode(id)}
        <Subtle>{'('}</Subtle>
        {makeParams(params)}
        <Subtle>{')'}</Subtle>
        <Subtle>{' {}'}</Subtle>
      </Fragment>
    )
  },
  VariableDeclaration: ({ declarations }) =>
    declarations.map(({ id }, index, array) => (
      <Spacer {...{ index, array }}>{makeComponentForNode(id)}</Spacer>
    )),
  VariableDeclarator: ({ kind, id, init }) => (
    <Fragment>
      {makeComponentForNode(id)}
      <Subtle>{` = `}</Subtle>
      {makeComponentForNode(init)}
    </Fragment>
  ),
  BooleanLiteral: ({ value }) => value,
  NumericLiteral: ({ value }) => value,
}

const makeComponentForNode = node => {
  if (!node) {
    return null
  }
  return TYPES[node.type] ? (
    TYPES[node.type](node)
  ) : (
    <span className="text-warning">{node.type}</span>
  )
}

export default makeComponentForNode
