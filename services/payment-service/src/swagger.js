import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Payment Service API",
    description: "API documentation for the Payment Service",
    version: "1.0.0",
  },
  host: `${process.env.HOST || "localhost"}:${process.env.PORT || 3335}`,
  basePath: "/",
  schemes: ["http"],
  definitions: {
    StripeConnectResponse: {
      success: true,
      message: "Stripe onboarding link created successfully.",
      data: {
        accountId: "acct_123456789",
        onboardingUrl: "https://connect.stripe.com/setup/s/acct_123456789",
        status: "pending",
        alreadyConnected: false,
      },
    },
    UnauthorizedResponse: {
      success: false,
      message: "Unauthorized",
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
  "../dist/modules/stripe-connect/stripeConnect.routes.js",
  "../dist/routes/payment.routes.js",
];

swaggerAutogen(outputFile, endpointsFiles, doc);
