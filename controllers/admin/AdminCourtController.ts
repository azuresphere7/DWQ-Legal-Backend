import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { CourtInput, CourtSchema } from "../../validations/court.scheme";
import { PutCommand, PutCommandInput, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../../config/ddbDocClient";
import { stateInfo } from "../../utils/config";
import { StateInfoType } from "../../utils/types";
import { ResponseMessageType } from "../../utils/enums";

export default class AdminCourtController {
  /**
   * Create a new court record
   * @param {Request} req
   * @param {Response} res 
   */
  static async create(req: Request, res: Response) {
    const parsedInput: CourtInput = CourtSchema.parse(req.body);

    const queryParams: QueryCommandInput = {
      TableName: "court",
      KeyConditionExpression: "code = :code",
      ExpressionAttributeValues: {
        ":code": parsedInput.code
      }
    };

    const putParams: PutCommandInput = {
      TableName: "court",
      Item: {
        id: uuidv4(),
        ...parsedInput
      }
    };

    // Check if the court code exists
    await ddbDocClient.send(new QueryCommand(queryParams))
      .then(async (existRecord) => {
        if (existRecord.Items && existRecord.Items.length > 0) {
          res.status(200).json({
            success: false,
            message: `Court for ${parsedInput.code} already exists.`
          });
        } else {
          if (stateInfo.findIndex((item: StateInfoType) => item.abbreviation === parsedInput.code) > -1) {
            const data = await ddbDocClient.send(new PutCommand(putParams));
            res.status(200).json({
              success: true,
              message: "Court record has been created!",
              data
            });
          } else {
            res.status(200).json({
              success: false,
              message: "Court code is invalid."
            });
          }
        }
      })
      .catch(error => {
        // Return error response from the server
        res.status(500).json({
          success: false,
          type: "dynamodb: search-jurisdiction",
          message: ResponseMessageType.SERVER_ERROR,
          error
        });
      });
  }
}