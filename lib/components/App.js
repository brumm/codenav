'use babel'

import React from 'react'
import { observer, inject } from 'mobx-react'

import TreeNode from './TreeNode'
import makeComponentForNode from './types'
import { goTo } from '../utils'

class App extends React.Component {
  getWidth() {
    this.container.style.width = 'min-content'
    const result = this.container.offsetWidth
    this.container.style.width = ''
    return result
  }

  render () {
    const { imports, classes, objectMethods, functions } = this.props

    return (
      <div className="codenav" ref={component => this.container = component}>
        {/* <input className="input-text" type="text" placeholder="Search" /> */}

        <ul className="list-tree has-collapsable-children">
          {!!imports.length &&
            <TreeNode label="Imports">
              {imports.map(({ node }) =>
                <TreeNode onClick={() => goTo(node.loc)} label={makeComponentForNode(node)} />
              )}
            </TreeNode>}

          {!!functions.length &&
            <TreeNode expanded label="Functions">
              {functions.map(({ node }) =>
                <TreeNode onClick={() => goTo(node.loc)} label={makeComponentForNode(node)} />
              )}
            </TreeNode>}

          {classes.map(({ node }) =>
            <TreeNode expanded goTo={goTo} label={makeComponentForNode(node)}>
              {node.body.body.map(node =>
                <TreeNode onClick={() => goTo(node.loc)} label={makeComponentForNode(node)} />
              )}
            </TreeNode>
          )}

          {!!objectMethods.length &&
            <TreeNode expanded label="Object Methods">
              {objectMethods.map(({ node }) =>
                <TreeNode onClick={() => goTo(node.loc)} label={makeComponentForNode(node)} />
              )}
            </TreeNode>}
        </ul>
      </div>
    )
  }
}



export default inject(({ store }) => store)(observer(App))
