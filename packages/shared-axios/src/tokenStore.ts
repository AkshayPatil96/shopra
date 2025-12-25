let accessTokenUser: string | null = null;
let accessTokenSeller: string | null = null;

export const setAccessToken = (type: "user" | "seller", token: string | null) => {
  if (type === "user") accessTokenUser = token;
  else accessTokenSeller = token;
};

export const getAccessToken = (type: "user" | "seller") => {
  return type === "user" ? accessTokenUser : accessTokenSeller;
};