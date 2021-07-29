// Reference: https://blog.abelotech.com/posts/measure-execution-time-nodejs-javascript/
async function measure(fn) {
  const start = new Date();
  const hrstart = process.hrtime();

  await fn();

  const end = new Date() - start;
  const hrend = process.hrtime(hrstart);

  console.info("Execution time: %dms", end);
  console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
}

module.exports = {
  measure,
};
