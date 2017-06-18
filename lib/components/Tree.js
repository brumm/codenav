'use babel'

import React from 'react'
import cx from 'classnames'

export class TreeNode extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expanded: props.expanded,
    }
  }

  render() {
    const { label, children, onClick } = this.props
    const { expanded } = this.state
    const hasChildren = React.Children.count(children) > 0

    return (
      <li
        className={cx({
          'list-nested-item': !!hasChildren,
          'list-item': !hasChildren,
          collapsed: !expanded,
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
