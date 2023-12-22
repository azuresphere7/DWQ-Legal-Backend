import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { PutCommand, PutCommandInput, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../config/ddbDocClient";
import { addNotification, getEndDate, sendEmail } from "../utils/functions";
import { ResponseMessageType } from "../utils/enums";
import { notificationTitle, notificationContent } from "../utils/config";
import { CognitoIdentityProvider, SignUpCommand, SignUpCommandInput } from "@aws-sdk/client-cognito-identity-provider";
import { OrderInput, OrderSchema } from "../validations/order.schema";

// shared variable
const defaultPassword: string = "Dwq123!@#";
const cognitoClient = new CognitoIdentityProvider({ region: process.env.REGION });

export default class OrderController {
  /**
   * Create an order
   * @param {Request} req 
   * @param {Response} res 
   */
  static async createOrder(req: Request, res: Response) {
    const parsedData: OrderInput = OrderSchema.parse(req.body);

    try {
      const jurisdictionQuery: QueryCommandInput = {
        TableName: "jurisdiction",
        KeyConditionExpression: "jCode = :jCode",
        ExpressionAttributeValues: {
          ":jCode": parsedData.state
        }
      };

      const jRecord = await ddbDocClient.send(new QueryCommand(jurisdictionQuery));

      if (jRecord.Items && jRecord.Items.length > 0) {
        if (jRecord.Items[0].isActive) {
          const { plaintiffs, defendants } = parsedData;

          const plaintiffEmailPromises = plaintiffs.map(async (email: string) => {
            const queryParams: QueryCommandInput = {
              TableName: "users",
              KeyConditionExpression: "email = :email",
              ExpressionAttributeValues: {
                ":email": email
              }
            };

            const existRecord = await ddbDocClient.send(new QueryCommand(queryParams));

            // Check if existRecord contains data before sending an email
            if (existRecord.Items && existRecord.Items.length > 0) {
              try {
                await sendEmail(email, notificationTitle.plaintiff1, notificationContent.plaintiff1);
                await addNotification(email, notificationTitle.plaintiff1, notificationContent.plaintiff1);
              } catch (error) {
                // Return error response from the server
                res.status(500).json({
                  success: false,
                  type: "ses: send-notification",
                  message: ResponseMessageType.SERVER_ERROR,
                  error
                });
              }
            } else {
              res.status(200).json({
                success: false,
                message: `${email} does not exist on our database.`
              });
            }
          });

          const defendantEmailPromises = defendants.map(async (email: string) => {
            const queryParams: QueryCommandInput = {
              TableName: "users",
              KeyConditionExpression: "email = :email",
              ExpressionAttributeValues: {
                ":email": email
              }
            };

            const existRecord = await ddbDocClient.send(new QueryCommand(queryParams));

            // Check if existRecord contains data before sending an email
            if (existRecord.Items && existRecord.Items.length > 0 && parsedData.notify) {
              try {
                await sendEmail(email, `${parsedData.email} ${notificationTitle.defendant1}`, notificationContent.defendant1);
                await addNotification(email, `${parsedData.email} ${notificationTitle.defendant1}`, notificationContent.defendant1);
              } catch (error: any) {
                // Return error response from the server
                if (error.name === "MessageRejected") {
                  res.status(200).json({
                    success: false,
                    message: `Cannot send notifications to ${email}`
                  });
                } else {
                  res.status(500).json({
                    success: false,
                    type: "ses: send-notification",
                    message: ResponseMessageType.SERVER_ERROR,
                    error
                  });
                }
              }
            } else {
              const hashedPassword: string = await bcrypt.hash(defaultPassword, 12);

              // Create a new user data
              const putParams: PutCommandInput = {
                TableName: "users",
                Item: {
                  _id: uuidv4(),
                  email,
                  password: hashedPassword,
                  email_verified: false,
                  isFree: "yes",
                  createdAt: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
                }
              };

              // Create a new user if it doesn't exist
              await ddbDocClient.send(new PutCommand(putParams));

              const signupParams: SignUpCommandInput = {
                ClientId: process.env.COGNITO_CLIENT_ID,
                Username: email,
                Password: defaultPassword
              };

              // Sign up user to AWS Cognito
              await cognitoClient.send(new SignUpCommand(signupParams))
                .catch(error => {
                  // Return error response from the server
                  res.status(500).json({
                    success: false,
                    type: "cognito: sign-up",
                    message: ResponseMessageType.SERVER_ERROR,
                    error
                  });
                });
            }
          });

          // Wait for all email promises to complete
          await Promise.all(plaintiffEmailPromises);
          await Promise.all(defendantEmailPromises);

          const orderData: PutCommandInput = {
            TableName: "order",
            Item: {
              number: uuidv4(),
              ...parsedData,
              startedAt: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
              nopEndAt: getEndDate(jRecord.Items[0].nopPeriod),
              opEndAt: getEndDate(jRecord.Items[0].opPeriod),
              updatedAt: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
            }
          };

          // Sign up user to AWS Cognito
          await ddbDocClient.send(new PutCommand(orderData))
            .then(data => {
              res.status(200).json({
                success: true,
                message: "The order has been created successfully!",
                data
              });
            })
            .catch(error => {
              // Return error response from the server
              res.status(500).json({
                success: false,
                type: "dynamodb: create-order",
                message: ResponseMessageType.SERVER_ERROR,
                error
              });
            });
        } else {
          res.status(200).json({
            success: false,
            message: `Jurisdiction - ${jRecord.Items[0].jCode} is not available now.`
          });
        }
      } else {
        res.status(200).json({
          success: false,
          message: `Cannot find the jurisdiction record for ${parsedData.state}.`
        });
      }
    } catch (error) {
      // Return error response from the server
      res.status(500).json({
        success: false,
        type: "dynamodb: verify-jurisdiction",
        message: ResponseMessageType.SERVER_ERROR,
        error
      });
    }
  }
}