import util from 'node:util'
import { exec as childExec } from 'node:child_process'

const exec = util.promisify(childExec)

const build = async () => {
  console.log('building')
  await exec('docker build -t reelist-server .')

  console.log('saving')
  await exec('docker save reelist-server > reelist-server.tar')

  console.log('finished building and saving')
}

export default build
