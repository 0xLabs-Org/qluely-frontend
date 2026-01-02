import DodoPayments from "dodopayments";

export const dodoClient = new DodoPayments({
  bearerToken: process.env["DODO_PAYMENTS_API_KEY"], // This is the default and can be omitted
  environment: "test_mode", // defaults to 'live_mode'
});
