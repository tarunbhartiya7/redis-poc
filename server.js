const express = require("express");
const axios = require("axios");
const redis = require("redis");
const util = require("util");

// const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient();
client.set("key", "value");
client.get = util.promisify(client.get);

const app = express();
const port = 3000;
const DEFAULT_CACHE_EXPIRATION = 3600;

const getOrSetCache = (key, cb) => {
  return new Promise(async (resolve, reject) => {
    const cacheValue = await client.get(key);

    if (cacheValue) {
      return resolve(JSON.parse(cacheValue));
    }

    const freshData = await cb();

    client.set(key, JSON.stringify(freshData), "EX", DEFAULT_CACHE_EXPIRATION);
    resolve(freshData);
  });
};

app.get("/todos", async (req, res) => {
  try {
    const todos = await getOrSetCache("todos", async () => {
      const { data } = await axios.get(
        `https://jsonplaceholder.typicode.com/todos`
      );

      return data;
    });

    res.send(todos);
  } catch (error) {
    console.log(error);
  }
});

app.get("/todos/:id", async (req, res) => {
  const todoId = req.params.id;

  try {
    const todo = await getOrSetCache(`todos:${todoId}`, async () => {
      const { data } = await axios.get(
        `https://jsonplaceholder.typicode.com/todos/${todoId}`
      );

      return data;
    });

    res.send(todo);
  } catch (error) {
    console.log(error);
  }
});

app.get("/photos", async (req, res) => {
  try {
    const photos = await getOrSetCache("photos", async () => {
      const { data } = await axios.get(
        `https://jsonplaceholder.typicode.com/photos`
      );

      return data;
    });

    res.send(photos);
  } catch (error) {
    console.log(error);
  }
});

app.get("/photos/:id", async (req, res) => {
  const photoId = req.params.id;

  try {
    const photo = await getOrSetCache(`photos:${photoId}`, async () => {
      const { data } = await axios.get(
        `https://jsonplaceholder.typicode.com/photos/${photoId}`
      );

      return data;
    });

    res.send(photo);
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
