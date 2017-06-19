'use babel'

import React from 'react'
import cx from 'classnames'
import { inject } from 'mobx-react'

class TreeNode extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expanded: props.expanded,
    }
  }

  render() {
    const { label, children, onClick, selected } = this.props
    const { expanded } = this.state
    const hasChildren = React.Children.count(children) > 0

    return (
      <li
        className={cx({
          'list-nested-item': !!hasChildren,
          'list-item': !hasChildren,
          collapsed: !expanded,
          selected,
        })}
        onClick={onClick}
      >
        <div className="list-item" onClick={() => this.setState({ expanded: !expanded })}>
          {label}
        </div>

        {hasChildren &&
          <ul className="list-tree has-flat-children">
            {children}
          </ul>}
      </li>
    )
  }
}

export default inject(({ store: { cursorPosition } }, { start, end }) => ({
  selected: cursorPosition >= start && cursorPosition <= end,
}))(TreeNode)
