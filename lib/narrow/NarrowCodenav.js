'use babel'

import { getPointForNode, getRenderedTextForComponent } from '../utils'
import makeComponentForNode from '../components/types'

export default (Provider, store, providerId) =>
  class NarrowCodenav {
    constructor(state) {
      this.provider = Provider.create({
        configScope: providerId,
        name: this.constructor.name,
        state,
        getItems: this.getItems,
        config: {
          refreshOnDidStopChanging: true,
        },
      })
    }

    start(options) {
      return this.provider.start(options)
    }

    getItems = async () => {
      const { symbols } = store.getActiveEditor(this.provider.editor.id)
      const indent = this.provider.editor.getTabText()

      return [
        ...[
          // ...symbols.imports,
          // ...symbols.exports,
          ...symbols.objectMethods,
          ...symbols.functions,
        ].map(({ node }) => ({
          text: getRenderedTextForComponent(makeComponentForNode(node)),
          point: getPointForNode(node),
        })),
        ...symbols.classes.reduce(
          (collection, { node }) => [
            ...collection,
            {
              text: getRenderedTextForComponent(makeComponentForNode(node)),
              point: getPointForNode(node),
            },
            ...node.body.body.map(node => ({
              text:
                indent +
                getRenderedTextForComponent(makeComponentForNode(node)),
              point: getPointForNode(node),
            })),
          ],
          []
        ),
      ]
    }
  }
