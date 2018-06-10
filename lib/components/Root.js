'use babel'

import React from 'react'
import { observer, inject, Provider } from 'mobx-react'

import SymbolsView from './SymbolsView'

export default ({ store }) => (
  <Provider store={store}>
    <div className="tool-panel codenav">
      <SymbolsView />
    </div>
  </Provider>
)
