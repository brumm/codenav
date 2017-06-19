'use babel'

import React from 'react'
import cx from 'classnames'
import groupBy from 'lodash/groupBy'

const Params = ({ params }) =>
  <span>
    {params.length === 0 && <span className="text-subtle">()</span>}
    {params.length === 1 &&
      <span>
        <span className="text-subtle">{'('}</span>
        <span>{makeComponentForNode(params[0])}</span>
        <span className="text-subtle">{')'}</span>
      </span>}
    {params.length > 1 &&
      <span>
        <span className="text-subtle">{'('}</span>
        <span>{params.map(makeComponentForNode).join(', ')}</span>
        <span className="text-subtle">{')'}</span>
      </span>}
  </span>

const TYPES = {
  ImportDeclaration: ({ source, specifiers }) => {
    let {
      ImportDefaultSpecifier: [ImportDefaultSpecifier] = [],
      ImportNamespaceSpecifier: [ImportNamespaceSpecifier] = [],
      ImportSpecifier,
    } = groupBy(specifiers, 'type')

    return (
      <span>
        {[
          ImportDefaultSpecifier && `${makeComponentForNode(ImportDefaultSpecifier)}`,
          ImportNamespaceSpecifier && `${makeComponentForNode(ImportNamespaceSpecifier)}`,
          ImportSpecifier && ` { ${ImportSpecifier.map(makeComponentForNode).join(', ')} }`,
        ]
          .filter(Boolean)
          .join(', ')}
        <span className="text-subtle">{` from `}</span>
        <span>{makeComponentForNode(source)}</span>
      </span>
    )
  },
  ImportDefaultSpecifier: ({ local }) => makeComponentForNode(local),
  ImportNamespaceSpecifier: ({ local }) => `* as ${makeComponentForNode(local)}`,
  ImportSpecifier: ({ imported }) => makeComponentForNode(imported),
  StringLiteral: ({ value }) => `'${value}'`,
  Identifier: ({ name }) => name,
  MemberExpression: ({ object, property }) =>
    `${makeComponentForNode(object)}.${makeComponentForNode(property)}`,
  ArrowFunctionExpression: ({ params, body }) =>
    <span>
      <Params params={params} />
      <span className="text-subtle">{' => '}</span>
      {body.type === 'BlockStatement'
        ? <span className="text-subtle">{'{}'}</span>
        : <span className="text-subtle">{'()'}</span>}
    </span>,
  AssignmentPattern: ({ left, right }) =>
    <span>
      {makeComponentForNode(left)}
      <span className="text-subtle">{' = '}</span>
      {makeComponentForNode(right)}
    </span>,
  ObjectPattern: ({ properties }) =>
    <span>
      <span className="text-subtle">{'{ '}</span>
      {properties.map(makeComponentForNode)}
      <span className="text-subtle">{' }'}</span>
    </span>,
  ObjectMethod: ({ key }) =>
    <span>
      {makeComponentForNode(key)}
      <span className="text-subtle">{' () {}'}</span>
    </span>,
  ObjectProperty: ({ key, value, shorthand }) =>
    <span className="needs-spacer">
      {makeComponentForNode(key)}
      {!shorthand &&
        <span>
          <span className="text-subtle">{': '}</span>
          {makeComponentForNode(value)}
        </span>}
    </span>,
  ObjectExpression: () => <span className="text-subtle">{'{}'}</span>,
  ClassProperty: ({ key, value }) =>
    <span>
      {makeComponentForNode(key)}
      <span className="text-subtle">{' = '}</span>
      {makeComponentForNode(value)}
    </span>,
  ClassMethod: ({ key }) =>
    <span>
      {makeComponentForNode(key)}
      <span className="text-subtle">{' () {}'}</span>
    </span>,
  ClassDeclaration: ({ id, superClass }) =>
    <span>
      <span className="text-subtle">{'class '}</span>
      {makeComponentForNode(id)}
      {superClass &&
        <span>
          <span className="text-subtle">{' extends '}</span>
          {makeComponentForNode(superClass)}
          <span className="text-subtle">{' {}'}</span>
        </span>}
    </span>,
  FunctionDeclaration: ({ id, params }) =>
    <span>
      {makeComponentForNode(id)}
      <span>{' '}</span>
      <Params params={params} />
      <span className="text-subtle">{' {}'}</span>
    </span>,
  VariableDeclarator: ({ kind, id, init }) =>
    <span>
      {makeComponentForNode(id)}
      <span className="text-subtle">{` = `}</span>
      {makeComponentForNode(init)}
    </span>,
}

const makeComponentForNode = node =>
  TYPES[node.type] ? TYPES[node.type](node) : <span className="text-error">{node.type}</span>

export default makeComponentForNode
