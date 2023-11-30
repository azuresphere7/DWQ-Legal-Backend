import { Request, Response } from "express";
import { DeleteCommand, DeleteCommandInput, PutCommand, PutCommandInput, ScanCommand, ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../../config/ddbDocClient";

export default class AdminUserController {
  /**
   * Get users list
   * @param {Request} req
   * @param {Response} res
   */
  static async getList(req: Request, res: Response) {
    const { limit, page } = req.query;

    let lastEvaluatedKey = undefined;
    let currentPage: number = 0;
    const pageSize = limit ? Number(limit) : 5;

    const allRecords = await ddbDocClient.send(new ScanCommand({ TableName: "users", Select: "COUNT" }));

    while (currentPage < Number(page) - 1) {
      const scanParams: ScanCommandInput = {
        TableName: "users",
        Limit: pageSize,
        ExclusiveStartKey: lastEvaluatedKey,
      };

      try {
        const result = await ddbDocClient.send(new ScanCommand(scanParams));
        lastEvaluatedKey = result.LastEvaluatedKey;

        if (!lastEvaluatedKey) break;

        currentPage++;
      } catch (error) {
        res.status(500).json({
          success: false,
          type: "dynamodb: get-user-list",
          error,
        });
      }
    }

    const finalScanParams: ScanCommandInput = {
      TableName: "users",
      Limit: pageSize,
      ExclusiveStartKey: lastEvaluatedKey,
    };

    ddbDocClient.send(new ScanCommand(finalScanParams))
      .then(users => {
        res.status(200).json({
          success: true,
          total: allRecords.Count,
          limit,
          page,
          // eslint-disable-next-line
          users: users.Items?.map(({ password, ...filteredItem }) => filteredItem),
          lastEvaluatedKey: users.LastEvaluatedKey
        });
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          type: "dynamodb: get-user-list",
          error
        });
      });
  }

  /**
   * Update user record
   * @param {Request} req
   * @param {Response} res
   */
  static async updateItem(req: Request, res: Response) {
    const params: PutCommandInput = {
      TableName: "users",
      Item: req.body
    };

    await ddbDocClient.send(new PutCommand(params))
      .then(() => {
        res.status(200).json({
          success: true,
          message: "The user record has been updated."
        });
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          type: "dynamodb: get-user-list",
          error
        });
      });
  }

  /**
   * Delete user record
   * @param {Request} req
   * @param {Response} res
   */
  static async deleteItem(req: Request, res: Response) {
    const { email } = req.query;

    const params: DeleteCommandInput = {
      TableName: "users",
      Key: { email }
    };

    await ddbDocClient.send(new DeleteCommand(params))
      .then(() => {
        res.status(200).json({
          success: true,
          message: "The user record has been deleted."
        });
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          type: "dynamodb: get-user-list",
          error
        });
      });
  }
}