import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { PutCommand, PutCommandInput, QueryCommand, QueryCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import {
  CognitoIdentityProvider,
  ConfirmForgotPasswordCommand,
  ConfirmForgotPasswordCommandInput,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandInput,
  ForgotPasswordCommand,
  ForgotPasswordCommandInput,
  SignUpCommand,
  SignUpCommandInput
} from "@aws-sdk/client-cognito-identity-provider";

import { LoginUserInput, LoginUserSchema, RegisterUserInput, RegisterUserSchema } from "../validations/user.schema";
import { ddbDocClient } from "../config/ddbDocClient";
import { DynamoDBErrorType } from "../utils/types";
import { CognitoErrorType } from "../utils/enums";

// shared variable
const cognitoClient = new CognitoIdentityProvider({ region: process.env.REGION });

export default class UserController {
  /**
   * Handle user register
   * @param {Request} req
   * @param {Response} res 
   */
  static async register(req: Request, res: Response) {
    const parsedData: RegisterUserInput = RegisterUserSchema.parse(req.body);
    // eslint-disable-next-line
    const { confirm, ...filteredInput } = parsedData;
    const hashedPassword: string = await bcrypt.hash(filteredInput.password, 12);

    // Query command finds user by email
    const queryParams: QueryCommandInput = {
      TableName: "users",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": filteredInput.email,
      },
    };

    // Create a new user data
    const putParams: PutCommandInput = {
      TableName: "users",
      Item: {
        _id: uuidv4(),
        ...filteredInput,
        password: hashedPassword,
        email_verified: false,
        createdAt: Date.now()
      }
    };

    await ddbDocClient.send(new QueryCommand(queryParams))
      .then(async existUser => {
        // If the user email exists in the database
        if (existUser.Items && existUser.Items.length > 0) {
          res.status(200).json({
            success: false,
            message: "User email already exists.",
          });
        } else {
          // Create a new user if it doesn't exist
          const data = await ddbDocClient.send(new PutCommand(putParams));

          const signupParams: SignUpCommandInput = {
            ClientId: process.env.COGNITO_CLIENT_ID,
            Username: filteredInput.email,
            Password: filteredInput.password,
            UserAttributes: [
              { Name: "name", Value: `${filteredInput.firstName} ${filteredInput.middleName} ${filteredInput.lastName}` },
              { Name: "address", Value: `${filteredInput.address1} ${filteredInput.address2} ${filteredInput.city} ${filteredInput.state}` }
            ],
          };

          // Sign up user to AWS Cognito
          await cognitoClient.send(new SignUpCommand(signupParams))
            .then(() => {
              const payload = {
                firstName: filteredInput.firmName,
                lastName: filteredInput.lastName,
                email: filteredInput.email
              };

              // Generate a token by payload
              jwt.sign(payload, process.env.JWT_SECRET_KEY!, { expiresIn: Number(process.env.JWT_EXPIRE_TIME) }, (err, token) => {
                res.status(201).json({
                  success: true,
                  message: "Successfully registered!",
                  token,
                  result: data,
                });
              });
            })
            .catch(error => {
              // Return error response from the server
              res.status(500).json({
                success: false,
                type: "cognito: sign-up",
                message: "Internal Server Error",
                error
              });
            });
        }
      })
      .catch(error => {
        // Return error response from the server
        res.status(500).json({
          success: false,
          type: "dynamodb: search-record",
          message: "Internal Server Error",
          error
        });
      });
  }

  /**
   * Handle user login
   * @param {Request} req 
   * @param {Response} res 
   */
  static async login(req: Request, res: Response) {
    const parsedData: LoginUserInput = LoginUserSchema.parse(req.body);

    // Query command finds user by email
    const queryParams: QueryCommandInput = {
      TableName: "users",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": parsedData.email,
      },
    };

    try {
      const existUser = await ddbDocClient.send(new QueryCommand(queryParams));

      // If the user email exists in the database
      if (existUser.Items && existUser.Items.length > 0) {
        const user = existUser.Items[0];

        if (!await bcrypt.compare(parsedData.password, user.password)) {
          res.status(200).json({
            success: false,
            message: "Password is incorrect."
          });
        } else {
          bcrypt.compare(parsedData.password, user.password)
            .then(async (isMatch: boolean) => {
              if (isMatch) {
                const payload = {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email
                };

                jwt.sign(payload, process.env.JWT_SECRET_KEY!, { expiresIn: Number(process.env.JWT_EXPIRE_TIME) }, (err, token) => {
                  res.status(200).json({
                    success: true,
                    message: "Welcome back!",
                    token
                  });
                });
              } else {
                res.status(401).json({
                  success: false,
                  message: "Password is incorrect."
                });
              }
            });
        }
      } else {
        res.status(200).json({
          success: false,
          message: "Email is invalid.",
        });
      }
    }
    catch (error: any) {
      // Return error response from the server
      res.status(500).json({
        success: false,
        type: "dynamodb: search-record",
        message: "Internal Server Error",
        error
      });
    }
  }

  /**
   * Check email verification status
   * @param {Request} req
   * @param {Response} res
   */
  static async checkVerificationStatus(req: Request, res: Response) {
    const { email } = req.query;

    // Query command finds user by email
    const queryParams: QueryCommandInput = {
      TableName: "users",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    try {
      const existUser = await ddbDocClient.send(new QueryCommand(queryParams));

      if (existUser.Items && existUser.Items.length > 0) {
        const user = existUser.Items[0];

        if (user.email_verified) {
          res.status(200).json({
            success: true,
            isVerified: true,
            message: "User email is verified."
          });
        } else {
          res.status(200).json({
            success: true,
            isVerified: false,
            message: "User email is not verified."
          });
        }
      } else {
        res.status(200).json({
          success: false,
          message: "Email is invalid.",
        });
      }
    }
    catch (error: any) {
      // Return error rsponse from the server
      res.status(500).json({
        success: false,
        type: "dynamodb: search-record",
        message: "Internal Server Error",
        error
      });
    }
  }

  /**
   * Confirm user email by code 
   * @param {Request} req
   * @param {Response} res
   */
  static async verifyEmail(req: Request, res: Response) {
    const { email, code } = req.body;

    // cognito email confirmation params
    const confirmEmailParams: ConfirmSignUpCommandInput = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code
    };

    const updateParams: UpdateCommandInput = {
      TableName: "users",
      Key: { email },
      UpdateExpression: "set email_verified = :verified",
      ExpressionAttributeValues: {
        ":verified": true
      },
      ReturnValues: "UPDATED_NEW"
    };

    cognitoClient.send(new ConfirmSignUpCommand(confirmEmailParams))
      .then(async () => {
        await ddbDocClient.send(new UpdateCommand(updateParams));

        res.status(200).json({
          success: true,
          message: "Verification successful!"
        });
      })
      .catch((error: DynamoDBErrorType) => {
        if (error.__type === CognitoErrorType.INVALID_CODE) {
          res.status(200).json({
            success: false,
            message: "Confirmation code is incorrect."
          });
        } else if (error.__type === CognitoErrorType.EXPIRED_CODE) {
          res.status(200).json({
            success: false,
            message: "Confirmation code is expired."
          });
        } else {
          // Return error response from the server
          res.status(500).json({
            success: false,
            type: "cognito: email-confirmation",
            message: "Internal Server Error",
            error
          });
        }
      });
  }

  /**
   * Resend confirmation code
   * @param {Request} req
   * @param {Response} res
   */
  static async resendCode(req: Request, res: Response) {
    const { email } = req.body;
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email
    };

    cognitoClient.resendConfirmationCode(params)
      .then(() => {
        res.status(200).json({
          success: true,
          message: "Verification code resent."
        });
      })
      .catch((error: CognitoErrorType) => {
        // Return error response from the server
        res.status(500).json({
          success: false,
          type: "cognito: resend-code",
          message: "Internal Server Error",
          error
        });
      });
  }

  /**
   * Request password reset by email
   * @param {Request} req
   * @param {Response} res
   */
  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    const forgotParams: ForgotPasswordCommandInput = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email
    };

    await cognitoClient.send(new ForgotPasswordCommand(forgotParams))
      .then(() => {
        res.status(200).json({
          success: true,
          message: "The confirmation code was sent to your email."
        });
      })
      .catch((error: DynamoDBErrorType) => {
        // Return error response from the server
        res.status(500).json({
          success: false,
          type: "cognito: forgot-password",
          message: "Internal Server Error",
          error
        });
      });
  }

  /**
   * Reset password by email verification code
   * @param {Request} req
   * @param {Response} res
   */
  static async resetPassword(req: Request, res: Response) {
    const { email, code, newPassword } = req.body;

    const confirmParams: ConfirmForgotPasswordCommandInput = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword
    };

    await cognitoClient.send(new ConfirmForgotPasswordCommand(confirmParams))
      .then(async () => {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const updateParams: UpdateCommandInput = {
          TableName: "users",
          Key: { email },
          UpdateExpression: "set password = :new_password",
          ExpressionAttributeValues: {
            ":new_password": hashedPassword
          },
          ReturnValues: "UPDATED_NEW"
        };

        await ddbDocClient.send(new UpdateCommand(updateParams));

        res.status(200).json({
          success: true,
          message: "Password has been reset successfully!"
        });
      })
      .catch((error: DynamoDBErrorType) => {
        // Return error response from the server
        if (error.__type === CognitoErrorType.INVALID_PASSWORD) {
          res.status(400).json({
            success: false,
            message: "Password in invalid."
          });
        } else {
          res.status(500).json({
            success: false,
            type: "cognito: reset-password",
            message: "Internal Server Error",
            error
          });
        }
      });
  }

  /**
   * Decode JWT
   * @param {Request} req
   * @param {Response} res
   */
  static async accessToken(req: Request, res: Response) {
    res.status(200).json(_.omit(req.user, ["password"]));
  }
}