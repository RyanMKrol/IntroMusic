import util from 'util'
import path from 'path'
import fs from 'fs'

const readFile = util.promisify(fs.readFile)

export async function getClientToken() {
  console.log(path.resolve())
  return readFile(
    path.resolve() + '/credentials/discordToken.json',
    'utf8'
  ).then((data) => {
    return JSON.parse(data).token
  })
}
