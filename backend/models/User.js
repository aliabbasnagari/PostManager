const { dynamoDB } = require('../config/aws');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, email, password }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const params = {
      TableName: 'Users',
      Item: {
        id: Date.now().toString(), // Using timestamp as ID
        username,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      }
    };

    await dynamoDB.put(params).promise();
    return params.Item;
  }

  static async findByEmail(email) {
    const params = {
      TableName: 'Users',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };

    const result = await dynamoDB.query(params).promise();
    return result.Items[0];
  }

  static async findById(id) {
    const params = {
      TableName: 'Users',
      Key: { id }
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item;
  }
}

module.exports = User;
