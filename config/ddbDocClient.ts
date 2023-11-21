import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { ddbClient } from "./dbconfig";

const marshallOptions = {
  convertEmptyValues: false, // Whether to automatically convert empty strings, blobs, and sets to `null`
  removeUndefinedValues: true, // Whether to remove undefined values while marshalling
  convertClassInstanceToMap: false, // Whether to convert typeof object to map attribute.
};

const unmarshallOptions = {
  wrapNumbers: false, // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
};

// Create the DynamoDB document client.
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions,
  unmarshallOptions,
});

export { ddbDocClient };
