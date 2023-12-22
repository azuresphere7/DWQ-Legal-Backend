import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";

import { NotificationSchema } from "../validations/notification.schema";
import { ddbDocClient } from "../config/ddbDocClient";
import { DynamoDBError } from "../utils/types";
import { ResponseMessageType } from "../utils/enums";

export default class NotificationController {
  static async create(req: Request, res: Response) {
    const parsedData = NotificationSchema.parse(req.body);

    const putQuery: PutCommandInput = {
      TableName: "notification",
      Item: {
        _id: uuidv4(),
        ...parsedData,
      }
    };

    await ddbDocClient.send(new PutCommand(putQuery))
      .then(() => {
        res.status(200).json({
          success: true,
          message: "Notification list has been created!"
        });
      })
      .catch((error: DynamoDBError) => {
        res.status(500).json({
          success: false,
          message: ResponseMessageType.SERVER_ERROR,
          error
        });
      });
  }
}