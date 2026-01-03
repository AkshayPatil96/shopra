import ejs from "ejs";
import fs from "fs";
import nodeMailer, { Transporter } from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
}

export interface ISendMail {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

export const sendMail = async ({
  email,
  subject,
  template,
  data,
}: ISendMail): Promise<void> => {
  const config = {
    SMTP_HOST: getEnv("SMTP_HOST"),
    SMTP_PORT: Number(getEnv("SMTP_PORT")),
    SMTP_SERVICE: getEnv("SMTP_SERVICE"),
    SMTP_MAIL: getEnv("SMTP_MAIL"),
    SMTP_PASSWORD: getEnv("SMTP_PASSWORD"),
  }
  const transporter: Transporter = nodeMailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    service: config.SMTP_SERVICE,
    auth: {
      user: config.SMTP_MAIL,
      pass: config.SMTP_PASSWORD,
    },
  });

  // Resolve template directory for ESM builds
  const __filename = fileURLToPath(import.meta.url);
  const __dirname_resolved = path.dirname(__filename); // .../dist/providers
  const viewsInDist = path.join(__dirname_resolved, "../views"); // .../dist/views
  // Fallback to package source views for local/dev if dist assets were not copied
  const viewsInSrc = path.join(__dirname_resolved, "../../src/views"); // .../src/views
  const viewsDir = fs.existsSync(viewsInDist)
    ? viewsInDist
    : fs.existsSync(viewsInSrc)
      ? viewsInSrc
      : viewsInDist;

  const mailOptions = {
    from: `'E-Com' <${config.SMTP_MAIL}>`,
    to: email,
    subject,
    html: await ejs.renderFile(path.join(viewsDir, template), data),
  };

  await transporter
    .sendMail(mailOptions)
    .then((info) => {
      console.log("Message sent: %s", info.messageId);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
};
