const Order = require("../models/Orders");
const router = require("express").Router();
const amqb = require("amqplib");

let connection, channel;

async function connectToRabbitMQ() {
  const amqServer = "amqp://guest:guest@localhost:5673";
  connection = await amqb.connect(amqServer);
  channel = await connection.createChannel();
  await channel.assertQueue("order-service-queue");
}

connectToRabbitMQ().then(() => {
  try {
    channel.consume("order-service-queue", async (data) => {
      console.log("this is data", data);
      console.log("this is parsed data", JSON.parse(data.content));
      const { products } = JSON.parse(data.content);
      const newOrder = await createOrder(products);
      console.log("this is new Order", newOrder);
      channel.ack(data);
      channel.sendToQueue(
        "product-service-queue",
        Buffer.from(JSON.stringify(newOrder))
      );
    });
  } catch (error) {}
});

const createOrder = async (products) => {
  let total = 0;
  products.forEach((item) => {
    total += item.price;
  });

  const order = new Order({
    products,
    total,
  });
  await order.save();
  return order;
};

router.get("/", (req, res) => {
  res.send("Hi from order service");
});

module.exports = { router };
