import express from "express";
import fetch from "node-fetch";
import path from "path";
import send from "send";
const __dirname = path.resolve();

let orderMap = new Map(); // create a new map object to store givID and orderID
let amountMap = new Map(); // create a new map object to store givID and amount

const app = express();
const getAccessToken = async () => {
  const clientId =
    "AVkuImsa0vaRKpsqeYRuq7MvW9oaaTM-sZwiZ8dTz4llFyUVEXoLh9mSghcpbDRT8dUSEXAiOEPOyRic";
  const appSecret =
    "EKFMjbKVJz94B2Pmuo3OnwOTIGBx4lADduS_7-X89zMGmqlsatqlnDBDxzB7E1tMWuoNAWYZKqWb_e6a";
  const url = "https://api-m.sandbox.paypal.com/v1/oauth2/token";
  const response = await fetch(url, {
    body: "grant_type=client_credentials",
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(clientId + ":" + appSecret).toString("base64"),
    },
  });
  const data = await response.json();
  return data.access_token;
};

const createOrder = async (givID, amount) => {
  const url = "https://api-m.sandbox.paypal.com/v2/checkout/orders";
  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "CAD",
          value: amount,
        },
      },
    ],
  };
  const headers = {
    Authorization: `Bearer ${await getAccessToken()}`,
    "Content-Type": "application/json",
  };
  const response = await fetch(url, {
    headers,
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(error);
  }
  const orderID = data.id;
  console.log("orderID: ", orderID);
  console.log("givID: ", givID);
  orderMap.set(orderID, givID);
  console.log("orderMap: ", orderMap);
  return data;
};

const send2giv = async (givID, result) => {
  console.log("givID send2giv: ", givID);
  console.log("result send2giv: ", result);

  // /api/Order/payment/{orderNumber}
  const url = `https://mvpapi.giv2pay.com/api/Order/payment/${givID}`;
  // const headers = {
  //   "Content-Type": "application/json",
  // };
  // const response = await fetch(url, {
  //   headers,
  //   method: "POST",
  //   body: JSON.stringify(result),
  // });
  // const data = await response.json();
  // if (data.error) {
  //   throw new Error(error);
  // }
  return;
};

const capturePayment = async (orderID) => {
  const url = `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`;
  const headers = {
    Authorization: `Bearer ${await getAccessToken()}`,
    "Content-Type": "application/json",
  };
  const response = await fetch(url, {
    headers,
    method: "POST",
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(error);
  }
  //send givID and result to giv
  console.log("orderID from capture: ", orderID);
  console.log("givID from capture: ", orderMap.get(orderID));
  console.log("result from capture: ", data);
  send2giv(orderMap.get(orderID), data);
  //delete orderID from orderMap
  orderMap.delete(orderID);
  
  return data;
};

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.post("/orders", async (req, res) => {
  //read givID and amount from query string
  const givID = req.query.giv_id;
  const amount = req.query.amount;
  console.log("givID read by /orders: ", givID);
  console.log("amount read by /orders: ", amount);

  const response = await createOrder(givID, amount);
  res.json(response);
});

app.post("/orders/:orderID/capture", async (req, res) => {
  const response = await capturePayment(req.params.orderID);
  res.json(response);
});

app.listen(9597, () => {
  console.log("listening on http://localhost:9597/");
});
