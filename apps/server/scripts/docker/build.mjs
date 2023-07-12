import util from 'node:util'
import { spawn, exec as childExec } from 'node:child_process'

const preExec = util.promisify(childExec)

const exec = async commandString => {
  console.log('------- Starting : ', commandString)

  await preExec(commandString)

  console.log(`------- finished \n\n`)
}

const printSpawnOutput = commandString => {
  const [command, ...options] = commandString.split(' ')
  const commandSpawn = spawn(command, options)

  console.log('------- Starting : ', commandString)

  return new Promise(resolve => {
    commandSpawn.stdout.on('data', data => {
      console.log(data.toString())
    })

    commandSpawn.stderr.on('data', error =>{
      console.error(error.toString())
    })

    commandSpawn.on('error', error => {
      console.error(error.toString())
    })

    commandSpawn.on('close', code => {
      console.log(`------- finished with code:${code} \n\n`)
      resolve()
    })
  })
}

const build = async () => {
  await printSpawnOutput('pwd')

  await printSpawnOutput('docker build -t reelist-server .')

  await printSpawnOutput('rm reelist-server.tar')

  await exec('docker save reelist-server > reelist-server.tar')
}

export default build
