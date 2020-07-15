import DynamoDBWrapper from 'noodle-dynamo'
import { readJsonFile } from './../Utils/ReadJsonFile.js'
import { DYNAMO_CREDENTIALS_FILE_LOCATION } from './../Utils/Constants.js'

let dynamoDb = null

async function fetchDynamoClient() {
  if (dynamoDb === null) {
    const dynamoCredentials = await readJsonFile(
      DYNAMO_CREDENTIALS_FILE_LOCATION
    )
    dynamoDb = new DynamoDBWrapper(dynamoCredentials, 'us-east-2')
  }

  return dynamoDb
}

export async function storeIntroMusic(userId, musicLink) {
  const client = await fetchDynamoClient()
  const table = 'IntroMusic'
  const item = {
    userId: userId,
    link: musicLink
  }

  await client.writeTable(table, item)
}

export async function removeIntroMusic(userId) {
  const client = await fetchDynamoClient()

  const table = 'IntroMusic'
  const deleteParams = {
    userId: userId
  }

  await client.deleteItemFromTable(table, deleteParams)
}

export async function fetchIntroMusic(userId) {
  const client = await fetchDynamoClient()

  const table = 'IntroMusic'
  const expression = 'userId = :userId'
  const expressionData = {
    ':userId': userId
  }

  return await client.readTable(table, expression, expressionData)
}
