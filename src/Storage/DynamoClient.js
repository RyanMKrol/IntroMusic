import AWS from 'aws-sdk'

class DynamoDBWrapper {
  constructor(dynamoCredentials, region) {
    validateCredentials(dynamoCredentials)

    AWS.config.update(dynamoCredentials)
    AWS.config.update({
      region,
    })
  }

  async readTable(table, expression, expressionValues) {
    const docClient = new AWS.DynamoDB.DocumentClient()

    const params = {
      TableName: table,
      KeyConditionExpression: expression,
      ExpressionAttributeValues: expressionValues,
    }

    return new Promise((resolve, reject) => {
      docClient.query(params, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  async writeTable(table, item) {
    const docClient = new AWS.DynamoDB.DocumentClient()

    const params = {
      TableName: table,
      Item: item,
    }

    return new Promise((resolve, reject) => {
      docClient.put(params, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}

function validateCredentials(credentials) {
  if (!credentials.accessKeyId) {
    throw new Error('Could not find `accessKeyId` in credentials')
  }

  if (!credentials.secretAccessKey) {
    throw new Error('Could not find `secretAccessKey` in credentials')
  }
}

export default DynamoDBWrapper
