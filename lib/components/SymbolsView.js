'use babel'

import React from 'react'
import { observer, inject } from 'mobx-react'

import TreeNode from './TreeNode'
import makeComponentForNode from './types'
import { goTo } from '../utils'

class SymbolsView extends React.Component {
  render() {
    const { imports, exports, classes, objectMethods, functions } = this.props

    return (
      <ul className="symbols-view list-tree has-collapsable-children">
        {!!imports.length && (
          <TreeNode expanded={imports.length < 5} label="Imports">
            {imports.map(({ node }) => (
              <TreeNode
                start={node.start}
                end={node.end}
                onClick={() => goTo(node.loc)}
                label={makeComponentForNode(node)}
              />
            ))}
          </TreeNode>
        )}

        {!!exports.length && (
          <TreeNode expanded={exports.length < 5} label="Exports">
            {exports.map(({ node }) => (
              <TreeNode
                start={node.start}
                end={node.end}
                onClick={() => goTo(node.loc)}
                label={makeComponentForNode(node)}
              />
            ))}
          </TreeNode>
        )}

        {!!functions.length && (
          <TreeNode expanded label="Functions">
            {functions.map(({ node }) => (
              <TreeNode
                start={node.start}
                end={node.end}
                onClick={() => goTo(node.loc)}
                label={makeComponentForNode(node)}
              />
            ))}
          </TreeNode>
        )}

        {classes.map(({ node }) => (
          <TreeNode expanded goTo={goTo} label={makeComponentForNode(node)}>
            {node.body.body.map(node => (
              <TreeNode
                start={node.start}
                end={node.end}
                onClick={() => goTo(node.loc)}
                label={makeComponentForNode(node)}
              />
            ))}
          </TreeNode>
        ))}

        {!!objectMethods.length && (
          <TreeNode expanded label="Object Methods">
            {objectMethods.map(({ node }) => (
              <TreeNode
                start={node.start}
                end={node.end}
                onClick={() => goTo(node.loc)}
                label={makeComponentForNode(node)}
              />
            ))}
          </TreeNode>
        )}
      </ul>
    )
  }
}

export default inject(({ store }) => store.getActiveEditor().symbols)(
  observer(SymbolsView)
)
