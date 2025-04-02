import crypto from "crypto";

export const generateLiqPayData = (params, privateKey) => {
  const jsonString = JSON.stringify(params);
  const data = Buffer.from(jsonString).toString("base64");
  const signature = crypto.createHash("sha1").update(privateKey + data + privateKey).digest("base64");
  return { data, signature };
};