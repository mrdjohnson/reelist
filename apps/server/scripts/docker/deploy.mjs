import util from 'node:util'
import { exec as childExec } from 'node:child_process'
import build from './build.mjs'

const exec = util.promisify(childExec)

const run = async () => {
  await build()

  console.log('sending to the server')
  await exec('scp -P 48199  reelist-server.tar  djohnson@reelist.app:~/app/')

  console.log('finished')
}

run()
