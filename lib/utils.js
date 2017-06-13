'use babel'

import { Point } from 'atom'

export const goTo = ({ start, end }) => {
  const startPosition = new Point(start.line - 1, start.column)
  const editor = atom.workspace.getActiveTextEditor()

  editor.setCursorBufferPosition(startPosition)
  editor.scrollToBufferPosition(startPosition, { center: true })
}
