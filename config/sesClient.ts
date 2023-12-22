import { SESClient } from "@aws-sdk/client-ses";

const sesClient: SESClient = new SESClient({
  region: process.env.REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export default sesClient;