const Products = require("../models/Products");
const Product = require("../models/Products");

const router = require("express").Router();
const amqb = require("amqplib");

let connection, channel;

async function connectToRabbitMQ() {
  const amqServer = "amqp://guest:guest@localhost:5673";
  connection = await amqb.connect(amqServer);
  channel = await connection.createChannel();
  await channel.assertQueue("product-service-queue");
}

connectToRabbitMQ();

// create a product
router.post("/products", async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    if (!name || !price || !quantity) {
      res.status(400).json({ message: "required keys missing" });
    }
    // save product to db
    const product = new Product({ name, price, quantity });
    await product.save();
    res
      .status(201)
      .json({ message: "product created successfully", product: req.body });
  } catch (error) {
    res.status(400).json({ message: "Somethign went wrong", error });
  }
});

router.post("/buy", async (req, res) => {
  try {
    const { productIds } = req.body;
    const products = await Products.find({ _id: { $in: productIds } });
    console.log("products", products);

    channel.sendToQueue(
      "order-service-queue",
      Buffer.from(JSON.stringify({ products }))
    );
    let order;

    channel.consume("product-service-queue", (data) => {
      order = JSON.parse(data.content);
      console.log("consumed from prod service queue", order);
      channel.ack(data);
    });
    return res
      .status(201)
      .json({ message: "Order placed successfully", order });
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ message: "Somethign went wrong", error });
  }
});

module.exports = { router };
