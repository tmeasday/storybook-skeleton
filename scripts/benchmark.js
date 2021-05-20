// console.time, console.timeEnd
// BUILDER = babel/swc/esbuild
// project = design-system
const { builderAlternatives } = require("../webpack.parts");

const alternativeNames = Object.keys(builderAlternatives);
const project = "design-system";

console.log(alternativeNames, project);
