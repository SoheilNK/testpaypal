import express from "express";
import fetch from "node-fetch";
import path from "path";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";

const __dirname = path.resolve();

let orderMap = new Map(); // create a new map object to store givID and orderID

const app = express();
// Call midlewares
// app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

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

// const send2giv = async (givID, result) => {
//   console.log("givID send2giv: ", givID);
//   console.log("result send2giv: ", result);

//   // /api/Order/payment/{orderNumber}
//   const url = `https://mvpapi.giv2pay.com/api/Order/payment/${givID}`;
//   const headers = {
//     "Content-Type": "application/json",
//   };
//   const response = await fetch(url, {
//     headers,
//     method: "POST",
//     body: JSON.stringify(result),
//   })
//     .then((response) => {
//       // Handle the response
//       if (response.ok) {
//         console.log("Data sent successfully!");
//       } else {
//         console.log("Error:", response.statusText);
//       }
//     })
//     .catch((error) => {
//       console.log("Error:", error);
//     });
//   return;
// };

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
  // send2giv(orderMap.get(orderID), data);
  //delete orderID from orderMap
  orderMap.delete(orderID);

  return data;
};

// Define your secret key
const secretKey = "your-secret-key";

// JWT verification middleware
function verifyToken(req, res, next) {
  // Get token from query string
  const token = req.query.userToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token" });
    }

    // Attach the decoded payload to the request object
    req.user = decoded;

    // Proceed to the next middleware or route
    next();
  });
}

app.get("/", verifyToken, (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});


// app.get("/", (req, res) => {
//   res.sendFile(`${__dirname}/index.html`);
// });

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
//endpoint for generating a jwt token localy

app.get("/jwt", async (req, res) => {
  // Generate a JWT
  const secretKey = "your-secret-key";
  const payload = { userId: 123, username: "john.doe" };
  const token = jwt.sign(payload, secretKey);
  res.status(200).send(token);
});

app.listen(9597, () => {
  console.log("listening on http://localhost:9597/");
});
