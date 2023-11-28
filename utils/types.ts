export interface DynamoDBErrorType {
  name: string;
  $fault: string;
  $metadata: {
    httpStatusCode: number;
    requestId: string;
    attempts: number;
    totalRetryDelay: number;
  },
  __type: string;
}