import * as passportJWT from "passport-jwt";
import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient";

const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY || "dwq-legal-2023"
};

export default function passport_verify(passport: any) {
  passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      // Query command finds user by jwt paylod email
      const queryParams: QueryCommandInput = {
        TableName: "users",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": jwt_payload.email,
        },
      };

      const existUser = await ddbDocClient.send(new QueryCommand(queryParams));

      if (existUser.Items && existUser.Items.length > 0) {
        return done(null, existUser.Items[0]);
      } else {
        return done(null, false);
      }
    } catch (error) {
      console.error(error);
      return done(error, false);
    }
  }));

}