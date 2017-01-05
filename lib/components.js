'use babel'

import React from 'react'
import cx from 'classnames'

export class VariableDeclaration extends React.Component {
  render() {
    let { kind, declarations } = this.props.node
    const { children } = this.props

    declarations = declarations.map(({ id }) => {
      switch (id.type) {
        case 'Identifier':
          return id.name
        case 'ObjectPattern':
          return `{ ${id.properties.map(({ key: { name }}) => name).join(', ')} }`
        default:
          return id.type
      }
    })

    return (
      <li
        className='list-item'
        onClick={this.props.goTo}
      >
        {children}
        <span className='inline-block text-warning'>{kind}</span>
        <span className='inline-block'>
          {declarations.join(', ')}
        </span>
      </li>
    )
  }
}

export class ClassMethod extends React.Component {
  render() {
    let { key: { name }} = this.props.node
    return (
      <li
        className='list-item'
        onClick={this.props.goTo}
      >
        <span className='inline-block'>
          {`${name}() {}`}
        </span>
      </li>
    )
  }
}

export class ClassProperty extends React.Component {
  render() {
    let { key: { name }} = this.props.node
    return (
      <li
        className='list-item'
        onClick={this.props.goTo}
      >
        <span className='inline-block'>
          {name}
        </span>
      </li>
    )
  }
}

export class ClassDeclaration extends React.Component {
  render() {
    const { id, superClass, body: { body }} = this.props.node
    const { children, renderNode } = this.props

    return (
      <li className='list-nested-item'>
        <div className='list-item' onClick={this.props.goTo}>
          {children}
          <span className='inline-block text-success'>class</span>
          <span className='inline-block'>{id.name}</span>
        </div>

        {body.length > 0 &&
          <ol className='list-tree'>
            {body.map(renderNode)}
          </ol>
        }
      </li>
    )
  }
}

export class FunctionDeclaration extends React.Component {
  render() {
    const { id, superClass } = this.props.node
    const { children } = this.props
    return (
      <li
        className='list-item'
        onClick={this.props.goTo}
      >
        {children}
        <span className='inline-block text-success'>
          function
        </span>
        <span className='inline-block'>
          {`${id.name} {}`}
        </span>
      </li>
    )
  }
}

export class ArrowFunctionExpression extends React.Component {
  render() {
    const { body: { type } } = this.props.node
    const { children } = this.props

    return (
      <li
        className='list-item'
        onClick={this.props.goTo}
      >
        {children}
        <span className='inline-block'>
          {`() => ${type === 'BlockStatement' ? '{}' : '()'}`}
        </span>
      </li>
    )
  }
}

export class ObjectExpression extends React.Component {
  render() {
    const { children } = this.props

    return (
      <li
        className='list-item'
        onClick={this.props.goTo}
      >
        {children}
        <span className='inline-block'>
          {`{}`}
        </span>
      </li>
    )
  }
}

export class ArrayExpression extends React.Component {
  render() {
    const { children } = this.props

    return (
      <li
        className='list-item'
        onClick={this.props.goTo}
      >
        {children}
        <span className='inline-block'>
          {`[]`}
        </span>
      </li>
    )
  }
}

export class Identifier extends React.Component {
  render() {
    const { name } = this.props.node
    const { children } = this.props

    return (
      <li
        className='list-item'
        onClick={this.props.goTo}
      >
        {children}
        <span className='inline-block'>
          {name}
        </span>
      </li>
    )
  }
}

export class CallExpression extends React.Component {
  render() {
    const { name } = this.props.node
    const { children } = this.props

    return (
      <li
        className='list-item'
        onClick={this.props.goTo}
      >
        {children}
        <span className='inline-block'>
          CallExpression
        </span>
      </li>
    )
  }
}

const Prefixed = ({ prefix, goTo, renderNode, node: { type, declaration }}) => {
  switch (declaration.type) {
    case 'ClassDeclaration':
      return <ClassDeclaration node={declaration} renderNode={renderNode} goTo={goTo}>
        <span className='inline-block text-info'>{prefix}</span>
      </ClassDeclaration>

    case 'FunctionDeclaration':
      return <FunctionDeclaration node={declaration} goTo={goTo}>
        <span className='inline-block text-info'>{prefix}</span>
      </FunctionDeclaration>

    case 'ArrowFunctionExpression':
      return <ArrowFunctionExpression node={declaration} goTo={goTo}>
        <span className='inline-block text-info'>{prefix}</span>
      </ArrowFunctionExpression>

    case 'ObjectExpression':
      return <ObjectExpression node={declaration} goTo={goTo}>
        <span className='inline-block text-info'>{prefix}</span>
      </ObjectExpression>

    case 'ArrayExpression':
      return <ArrayExpression node={declaration} goTo={goTo}>
        <span className='inline-block text-info'>{prefix}</span>
      </ArrayExpression>

    case 'Identifier':
      return <Identifier node={declaration} goTo={goTo}>
        <span className='inline-block text-info'>{prefix}</span>
      </Identifier>

    case 'CallExpression':
      return <CallExpression node={declaration} goTo={goTo}>
        <span className='inline-block text-info'>{prefix}</span>
      </CallExpression>

    case 'VariableDeclaration':
      return <VariableDeclaration node={declaration} goTo={goTo}>
        <span className='inline-block text-info'>{prefix}</span>
      </VariableDeclaration>

    default:
      console.log(prefix, declaration)
      return <li>{type}</li>
  }
}

export class ExportNamedDeclaration extends React.Component {
  render() {
    if (this.props.node.declaration === null) {
      return null
    }
    return <Prefixed prefix='export' {...this.props} />
  }
}

export class ExportDefaultDeclaration extends React.Component {
  render() {
    if (this.props.node.declaration === null) {
      return null
    }
    return <Prefixed prefix='export default' {...this.props} />
  }
}
