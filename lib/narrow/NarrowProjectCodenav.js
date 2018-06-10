'use babel'

import {
  getSymbolsForPath,
  getPointForNode,
  getRenderedTextForComponent,
} from '../utils'
import makeComponentForNode from '../components/types'
import gitLsFiles from './gitls'

export default (Provider, store, providerId) =>
  class NarrowProjectCodenav {
    constructor(state) {
      this.provider = Provider.create({
        configScope: providerId,
        name: this.constructor.name,
        state,
        getItems: this.getItems,
        config: {
          showFileHeader: true,
          supportFilePathOnlyItemsUpdate: true,
        },
      })
    }

    start(options) {
      return this.provider.start(options)
    }

    getItems = async () => {
      const root = atom.workspace.project.getPaths()[0]

      const { js } = gitLsFiles({
        cwd: root,
      })

      const items = await Promise.all(
        js.map(path => getSymbolsForPath(root + '/' + path))
      ).then(sets =>
        sets.reduce(
          (collection, { path, symbols }) => [
            ...collection,
            ...symbols.map(({ node }) => ({
              filePath: path,
              text: getRenderedTextForComponent(makeComponentForNode(node)),
              point: getPointForNode(node),
            })),
          ],
          []
        )
      )

      return items
    }
  }
