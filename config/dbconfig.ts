import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import * as dotenv from "dotenv";

dotenv.config();

// Create Amazon DynamoDB service client object
const ddbClient: DynamoDBClient = new DynamoDBClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export { ddbClient };