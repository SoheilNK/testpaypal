# Standard Integration Example

This folder contains example code for a standard PayPal integration using both the JS SDK and node.js to complete transactions with the PayPal REST API.

## Instructions

1. [Create an application](https://developer.paypal.com/dashboard/applications/sandbox/create)
3. Rename `.env.example` to `.env` and update `CLIENT_ID` and `APP_SECRET`
2. Replace `test` in `public/index.html` with your app's client-id
4. Run `npm install`
5. Run `npm start`
6. Open http://localhost:9597/
7. Click "PayPal" and log in with one of your [Sandbox test accounts](https://developer.paypal.com/dashboard/accounts)
-------------------------------------------------------------------------------------------------------------------------
8. Use this account for test:
Sandbox URL
https://sandbox.paypal.com

Email
sb-yy4g226333410@personal.example.com

Password
Na^rt1iv
--------------------------------------------------------------------------------------------------------------------------
9. Use this credit card for test:
Card Type: Visa
Card Number: 4214026728543645
Expiration Date: 11/2028
CVV: 243

First name: John
Last name: Doe

Billing address
country: Canada
Address line 1: 1 Maire-Victorin
City: Toronto
Province: Ontario
Postal code: M5A 1E1
Mobile: +1(613) 502-8806
Email: sb-yy4g226333410@personal.example.com



