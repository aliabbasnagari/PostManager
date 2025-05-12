const { dynamoDB } = require("./aws");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

const connectDB = async () => {
  try {
    const command = new ScanCommand({ TableName: "Users" });
    await dynamoDB.send(command);
    console.log("DynamoDB connected successfully");
  } catch (error) {
    console.error(`Error connecting to DynamoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;