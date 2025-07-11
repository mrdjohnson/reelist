import util from 'node:util'
import { exec as childExec } from 'node:child_process'
import fs from 'fs/promises'
import _ from 'lodash'

const secretsPath = 'libs/apis/src/lib/secrets'
const environmentsPath = 'apps/server/envs/'

const exec = util.promisify(childExec)

if (process.argv.length === 2) {
  console.error('Error: environment type needed')
  process.exit()
}

const getJson = async filePath => {
  let fileOutput

  try {
    fileOutput = await exec(`cat ${filePath}`)
  } catch (e) {
    return null
  }

  return JSON.parse(fileOutput.stdout)
}

const run = async () => {
  let secrets = await getJson(`${secretsPath}/secrets-index.json`)


  if (secrets == null) {
    console.log('there is not a secrets file, creating one now')
    await exec(`cp ${secretsPath}/local.index.json ${secretsPath}/secrets-index.json`)

    secrets = await getJson(`${secretsPath}/secrets-index.json`)
  }

  const environmentFilePath = `${environmentsPath}/.env.${process.argv[2]}.json`
  const environmentExtras = await getJson(environmentFilePath)

  if (environmentExtras == null) {
    console.error('unable to find the file: ', environmentFilePath)
    process.exit()
  }

  try {
    let content =
      `NEXT_PUBLIC_TMDB_API_KEY=${secrets.TMDB_API_KEY}\n` +
      `NEXT_PUBLIC_SUPABASE_URL=${secrets.SUPABASE_URL}\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=${secrets.SUPABASE_KEY}\n`

    _.each(environmentExtras, (value, key) => {
      content += `${key}=${value}\n`
    })

    await fs.writeFile('apps/server/.env.local', content)
  } catch (err) {
    console.log(err)
  }
  
  console.log(await exec('cat apps/server/.env.local'))
}

run()
