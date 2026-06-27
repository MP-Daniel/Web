const { app } = require("./app.js");
const { env } = require("./config/env.js");

app.listen(env.port, () => {
  console.log(`Della Shop API running on http://localhost:${env.port}`);
});
