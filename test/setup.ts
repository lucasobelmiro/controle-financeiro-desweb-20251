import { ready } from "../src/app";

before(async () => {
  await ready;
});
