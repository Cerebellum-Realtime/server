import * as dynamoose from "dynamoose";
import dotenv from "dotenv";

dotenv.config();

console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("DYNAMODB_ENDPOINT:", process.env.DYNAMODB_ENDPOINT);
console.log("NODE_ENV:", process.env.NODE_ENV);

export const setupDatabase = () => {
  if (process.env.NODE_ENV === "development") {
    dynamoose.aws.ddb.local(
      process.env.DYNAMODB_ENDPOINT || "http://localhost:8000"
    );
  } else {
    const ddb = new dynamoose.aws.ddb.DynamoDB();
    dynamoose.aws.ddb.set(ddb);
  }
};
