import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Auth Service API",
    description: "API documentation for the Auth Service",
    version: "1.0.0",
  },
  host: `${process.env.HOST || "localhost"}:${process.env.PORT || 3334}`,
  basePath: "/",
  schemes: ["http"],
  definitions: {
    UserRegisterRequest: {
      name: "John Doe",
      email: "john@example.com",
    },
    SellerRegisterRequest: {
      name: "Acme Corp",
      email: "seller@example.com",
    },
    UserVerifyRequest: {
      email: "john@example.com",
      otp: "123456",
      password: "password123",
      name: "John Doe",
    },
    SellerVerifyRequest: {
      email: "seller@example.com",
      otp: "123456",
      password: "password123",
      name: "Acme Corp",
      phone: "+123456789",
      country: "US",
    },
    LoginRequest: {
      email: "john@example.com",
      password: "password123",
    },
    EmailOnlyRequest: {
      email: "john@example.com",
    },
    ResetPasswordRequest: {
      email: "john@example.com",
      token: "reset-token",
      newPassword: "newPassword123",
    },
    CreateShopRequest: {
      name: "My Shop",
      bio: "Independent store",
      address: "123 Main St",
      opening_hours: "9-5",
      category: "fashion",
      website: "https://shop.example.com",
    },
    OtpDispatchResponse: {
      message: "OTP sent to email. Please check your account.",
    },
    AuthSuccessResponse: {
      status: "success",
      message: "Login successful",
      accessToken: "jwt",
      data: {},
    },
    UserLoginResponse: {
      status: "success",
      message: "Login successful",
      accessToken: "jwt",
      data: {
        id: "userId",
        email: "john@example.com",
        name: "John Doe",
        status: "active",
      },
    },
    SellerLoginResponse: {
      status: "success",
      message: "Login successful",
      accessToken: "jwt",
      data: {
        id: "sellerId",
        email: "seller@example.com",
        name: "Acme Corp",
        phone: "+123456789",
        country: "US",
        status: "active",
      },
    },
    UserProfileResponse: {
      status: "success",
      data: {},
    },
    SellerProfileResponse: {
      status: "success",
      data: [],
    },
    ShopResponse: {
      status: "success",
      message: "Shop created successfully",
      data: {},
    },
    MessageOnlyResponse: {
      status: "success",
      message: "Operation completed",
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
  "../dist/modules/user-auth/userAuth.routes.js",
  "../dist/modules/seller-auth/sellerAuth.routes.js",
];

swaggerAutogen(outputFile, endpointsFiles, doc);
