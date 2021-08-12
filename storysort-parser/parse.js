const fs = require("fs");
const path = require("path");
const acorn = require("acorn");
const walk = require("acorn-walk");
const astring = require("astring");

const examples = {
  arraySortWithWildcard: fs.readFileSync(
    path.join(__dirname, "./examples/array-sort-with-wildcard.js"),
    {
      encoding: "utf-8",
    }
  ),
  arraySort: fs.readFileSync(path.join(__dirname, "./examples/array-sort.js"), {
    encoding: "utf-8",
  }),
  emptySort: fs.readFileSync(path.join(__dirname, "./examples/empty-sort.js"), {
    encoding: "utf-8",
  }),
  arrowFunction: fs.readFileSync(
    path.join(__dirname, "./examples/arrow-function.js"),
    {
      encoding: "utf-8",
    }
  ),
  // This one fails to eval
  /*
  function: fs.readFileSync(path.join(__dirname, "./examples/function.js"), {
    encoding: "utf-8",
  }),
  */
};
const stories = [{ kind: "test" }, { kind: "test" }];

function parse(file, stories) {
  const ast = acorn.parse(file, { ecmaVersion: 2020, sourceType: "module" });
  let ret = [];

  walk.findNodeAt(ast, null, null, (nodeType, node) => {
    if (nodeType === "ObjectExpression") {
      const childNode = node.properties[0];

      if (childNode) {
        if (childNode.key.name === "order") {
          const value = childNode.value;

          ret = parseValue(value);
        }
        // TODO: Figure out why a regular function fails to eval
        else if (
          childNode.value.type === "ArrowFunctionExpression" // ||
          // childNode.value.type === "FunctionExpression"
        ) {
          const fnAst = childNode.value;
          const code = astring.generate(fnAst);

          // TODO: This is applied wrong, this should follow Storybook source
          ret = eval(code)(stories, stories);
        } else {
          // console.error(`Unknown node type ${childNode.value.type}`);
        }
      }
    }
  });

  return ret;
}

function parseValue(value) {
  if (value.type === "ArrayExpression") {
    return value.elements.map((o) => {
      const { type, value } = o;

      if (type === "Literal") {
        return value;
      }

      if (type === "ArrayExpression") {
        return parseValue(o);
      }

      console.error(`Unknown node type ${value.type}`);
    });
  }

  console.error(`Unknown node type ${value.type}`);
}

Object.entries(examples).map(([name, file]) => {
  console.log(`Parsing ${name}`);
  console.log(parse(file, stories));
});
