module.exports = {
  require: ["ts-node/register"],
  extension: ["ts"],
  spec: ["test/**/*.test.ts"],
  timeout: 15000,
  recursive: true,
};
