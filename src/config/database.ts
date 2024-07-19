import * as dynamoose from "dynamoose";
import dotenv from "dotenv";

dotenv.config();

console.log("process env: ", process.env);
export const setupDatabase = () => {
  if (process.env.NODE_ENV === "development") {
    dynamoose.aws.ddb.local("http://127.0.0.1:8000");
  } else {
    const ddb = new dynamoose.aws.ddb.DynamoDB();
    dynamoose.aws.ddb.set(ddb);
  }
};
