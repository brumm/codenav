const { parse } = require('babylon')
const { default: traverse } = require('babel-traverse')
const fs = require('fs')
const path = require('path')
const groupBy = require('lodash/groupBy')
const omit = require('lodash/omit')

const filePath = path.join(__dirname, 'lib', 'codenav.js')
const nodeMap = []

const POS = 3111

function isInRange(range, pos) {
  return pos >= range[0] && pos <= range[1];
}

const pushNode = path => {
  nodeMap.push({
    type: path.node.type,
    loc: path.node.loc,
    path: omit(path, 'node'),
    node: path.node,
  })
}

fs.readFile(filePath, 'utf8', function(err, contents) {
  const ast = parse(contents, {
    sourceType: 'module',
    plugins: ['*']
  })

  traverse(ast, {
    // ClassDeclaration: path => pushNode(path),
    // ObjectMethod: pushNode,
  })

  console.log(
    nodeMap[0]
  )
})
