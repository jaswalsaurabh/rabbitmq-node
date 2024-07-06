const express = require("express");
const { router } = require("./routes/routes");
const app = express();
const mongoose = require("mongoose");

const PORT = 3001;

app.use(express.json());

app.use(router);

app.listen(PORT, async () => {
  console.log("server staretd at port", PORT);
  mongoose
    .connect("mongodb://0.0.0.0:27017/scan-product-service")
    .then((res) => {
      console.log("Product DB connection success");
    })
    .catch((error) => {
      console.log("err in connecting with db", error);
    });
});
