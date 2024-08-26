require("dotenv").config();
const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

// Encrypting text
function encrypt(text) {
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  // console.log(text, "text");
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  // console.log("here", iv.toString("hex"), encrypted.toString("hex"));
  return { iv: iv.toString("hex"), encrypted_data: encrypted.toString("hex") };
}

// Decrypting text
function decrypt(encrypted) {
  let iv = Buffer.from(encrypted.iv, "hex");
  let encryptedText = Buffer.from(encrypted.encrypted_data, "hex");
  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = {
  encrypt,
  decrypt,
};
