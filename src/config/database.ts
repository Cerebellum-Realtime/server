import * as dynamoose from "dynamoose";
import dotenv from "dotenv";
dotenv.config();

export const setupDatabase = () => {
  if (process.env.NODE_ENV === "development") {
    dynamoose.aws.ddb.local("http://localhost:8001");
  } else {
    const ddb = new dynamoose.aws.ddb.DynamoDB();
    dynamoose.aws.ddb.set(ddb);
  }
};
