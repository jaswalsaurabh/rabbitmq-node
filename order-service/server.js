const express = require("express");
const { router } = require("./routes/routes");
const app = express();
const mongoose = require("mongoose");

const PORT = 3002;

app.use(express.json());

app.use(router);

app.listen(PORT, () => {
  console.log("server started at port", PORT);
  mongoose
    .connect("mongodb://0.0.0.0:27017/scan-order-service")
    .then((res) => {
      console.log("Order DB connection success");
    })
    .catch((error) => {
      console.log("err in connecting with db", error);
    });
});
