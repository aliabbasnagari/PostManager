const { dynamoDB } = require('../config/aws');

class Post {
  static async create({ userId, content, image }) {
    const params = {
      TableName: 'Posts',
      Item: {
        id: Date.now().toString(),
        userId,
        content,
        image,
        createdAt: new Date().toISOString()
      }
    };

    await dynamoDB.put(params).promise();
    return params.Item;
  }

  static async findAll() {
    const params = {
      TableName: 'Posts'
    };

    const result = await dynamoDB.scan(params).promise();
    return result.Items;
  }

  static async findById(id) {
    const params = {
      TableName: 'Posts',
      Key: { id }
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item;
  }

  static async findByUserId(userId) {
    const params = {
      TableName: 'Posts',
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };

    const result = await dynamoDB.query(params).promise();
    return result.Items;
  }

  static async delete(id) {
    const params = {
      TableName: 'Posts',
      Key: { id }
    };

    await dynamoDB.delete(params).promise();
  }
}

module.exports = Post;
