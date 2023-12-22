import { ATNTCallType } from "./enums";

export interface StateInfoType {
  name: string;
  abbreviation: string;
}

export interface DynamoDBError {
  name: string;
  $fault: string;
  $metadata: {
    httpStatusCode: number;
    requestId: string;
    attempts: number;
    totalRetryDelay: number;
  },
  __type: string;
  message: string;
}

export interface SESError {
  name: string;
  $fault: string;
  $metadata: {
    httpStatusCode: number;
    requestId: string;
    attempts: number;
    totalRetryDelay: number;
  },
  Error: {
    Type: string;
    Code: string;
    Message: string;
    message: string;
  },
  RequestId: string;
  xmlns: string;
}

export interface ATNTRecord {
  item: string;
  connDate: Date;
  seizure: number;
  elasped: number;
  originatingPhone: string;
  terminatingPhone: string;
  dialed?: string;
  forwarded?: string;
  translated?: string;
  IMEI: string;
  IMSI: string;
  type: ATNTCallType
  feature: string;
  make?: string;
  model?: string;
  location: string;
}