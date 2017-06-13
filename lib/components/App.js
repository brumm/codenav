'use babel'

import React from 'react'
import { observer, inject } from 'mobx-react'

import { ListTree, TreeNode } from './Tree'
import makeComponentForNode from './types'
import { goTo } from '../utils'

const App = observer(({
  imports,
  classes,
  objectMethods,
  functions,
}) =>
  <div className="codenav">
    {/* <input className="input-text" type="text" placeholder="Text" /> */}
    <ListTree>
      {!!imports.length &&
        <TreeNode label="Imports">
          {imports.map(({ node }) =>
            <TreeNode onClick={() => goTo(node.loc)} label={makeComponentForNode(node)} />
          )}
        </TreeNode>}

      {!!imports.length &&
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
    </ListTree>
  </div>
)

export default inject(({ store }) => store)(App)
