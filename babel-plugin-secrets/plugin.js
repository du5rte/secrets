const core = require('../src/core')

module.exports = function babelPluginSecrets({
  types: { valueToNode, logicalExpression, identifier },
}) {
  return {
    name: 'babel-plugin-secrets',
    pre() {
      this.values = core.search()
    },
    visitor: {
      MemberExpression(node) {
        if (!node.get('object').matchesPattern('process.env')) {
          return
        }
        const { value: key } = node.toComputedKey()

        if (Object.prototype.hasOwnProperty.call(this.values, key)) {
          node.replaceWith(
            logicalExpression(
              '||',
              identifier(`process.env.${key}`),
              valueToNode(this.values[key])
            )
          )
        }
      },
    },
  }
}
