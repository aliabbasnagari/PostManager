const { dynamoDB } = require('./aws');

const connectDB = async () => {
  try {
    // Test DynamoDB connection
    await dynamoDB.scan({ TableName: 'Users' }).promise();
    console.log('DynamoDB Connected Successfully');
  } catch (error) {
    console.error(`Error connecting to DynamoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
