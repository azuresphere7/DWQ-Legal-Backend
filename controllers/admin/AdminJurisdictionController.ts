import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { JurisdictionInput, JurisdictionSchema } from "../../validations/jurisdiction.scheme";
import { PutCommand, PutCommandInput, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../../config/ddbDocClient";
import { stateInfo } from "../../utils/config";
import { StateInfoType } from "../../utils/types";
import { ResponseMessageType } from "../../utils/enums";

export default class AdminJurisdictionController {
  /**
   * Create a new jurisdiction record
   * @param {Request} req
   * @param {Response} res 
   */
  static async create(req: Request, res: Response) {
    const parsedInput: JurisdictionInput = JurisdictionSchema.parse(req.body);

    const queryParams: QueryCommandInput = {
      TableName: "jurisdiction",
      KeyConditionExpression: "jCode = :jCode",
      ExpressionAttributeValues: {
        ":jCode": parsedInput.jCode
      }
    };

    const putParams: PutCommandInput = {
      TableName: "jurisdiction",
      Item: {
        id: uuidv4(),
        ...parsedInput
      }
    };

    // Check if the jurisdiction code exists
    await ddbDocClient.send(new QueryCommand(queryParams))
      .then(async (existRecord) => {
        if (existRecord.Items && existRecord.Items.length > 0) {
          res.status(200).json({
            success: false,
            message: `Jurisdiction for ${parsedInput.jCode} already exists.`
          });
        } else {
          if (stateInfo.findIndex((item: StateInfoType) => item.abbreviation === parsedInput.jCode) > -1) {
            const data = await ddbDocClient.send(new PutCommand(putParams));
            res.status(200).json({
              success: true,
              message: "Jurisdiction has been created!",
              data
            });
          } else {
            res.status(200).json({
              success: false,
              message: "Jurisdiction code is invalid."
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