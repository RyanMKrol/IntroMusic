import util from 'util'
import path from 'path'
import fs from 'fs'

const readFile = util.promisify(fs.readFile)

export async function readJsonFile(relativePath) {
  return readFile(path.resolve() + relativePath, 'utf8').then((data) => {
    return JSON.parse(data)
  })
}
