import util from 'node:util'
import { exec as childExec } from 'node:child_process'
import build from './build.mjs'

const exec = util.promisify(childExec)

const printExec = async script => {
  const { stdout, stderr } = await exec(script)

  stdout && console.log(stdout)
  stderr && console.error(stderr)
}

const run = async () => {
  await build()

  console.log('removing current server')
  await exec('docker rm -f reelist-server')

  console.log('running')
  await exec('docker run -d -p 3000:3000 --name reelist-server reelist-server')

  console.log('finished')

  await printExec('docker ps')
}

run()
