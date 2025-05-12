const { dynamoDB } = require("../config/aws");
const { PutCommand, QueryCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");

class User {
  static async create({ username, email, password }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const params = {
      TableName: "Users",
      Item: {
        id: Date.now().toString(),
        username,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      },
    };

    await dynamoDB.send(new PutCommand(params));
    return params.Item;
  }

  static async findByEmail(email) {
    const params = {
      TableName: "Users",
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    const { Items } = await dynamoDB.send(new QueryCommand(params));
    return Items && Items.length > 0 ? Items[0] : null;
  }

  static async findById(id) {
    const params = {
      TableName: "Users",
      Key: { id },
    };

    const { Item } = await dynamoDB.send(new GetCommand(params));
    return Item || null;
  }
}

module.exports = User;