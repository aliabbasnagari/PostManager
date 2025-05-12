const { dynamoDB } = require("../config/aws");
const { PutCommand, ScanCommand, GetCommand, QueryCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

class Post {
  static async create({ userId, content, image }) {
    const params = {
      TableName: "Posts",
      Item: {
        id: Date.now().toString(),
        userId,
        content,
        image,
        createdAt: new Date().toISOString(),
      },
    };

    await dynamoDB.send(new PutCommand(params));
    return params.Item;
  }

  static async findAll() {
    const params = {
      TableName: "Posts",
    };

    const { Items } = await dynamoDB.send(new ScanCommand(params));
    return Items || [];
  }

  static async findById(id) {
    const params = {
      TableName: "Posts",
      Key: { id },
    };

    const { Item } = await dynamoDB.send(new GetCommand(params));
    return Item || null;
  }

  static async findByUserId(userId) {
    const params = {
      TableName: "Posts",
      IndexName: "UserIdIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    const { Items } = await dynamoDB.send(new QueryCommand(params));
    return Items || [];
  }

  static async delete(id) {
    const params = {
      TableName: "Posts",
      Key: { id },
    };

    await dynamoDB.send(new DeleteCommand(params));
  }
}

module.exports = Post;