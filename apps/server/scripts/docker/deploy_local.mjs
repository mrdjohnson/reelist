import { spawn } from 'node:child_process'
import build from './build.mjs'

const printSpawnOutput = commandString => {
  const [command, ...options] = commandString.split(' ')
  const commandSpawn = spawn(command, options)

  console.log('------- Starting : ', commandString)

  return new Promise(resolve => {
    commandSpawn.stdout.on('data', data => {
      console.log(data.toString())
    })

    commandSpawn.stderr.on('data', error => {
      console.error(error.message)
    })

    commandSpawn.on('error', error => {
      console.error(error.message)
    })

    commandSpawn.on('close', code => {
      console.log(`------- finished with code:${code} \n\n`)
      resolve()
    })
  })
}

const run = async () => {
  await build()
  
  await printSpawnOutput('docker load --input reelist-server.tar')

  await printSpawnOutput('docker rm -f reelist-server')

  await printSpawnOutput('docker run -d -p 3000:3000 --name reelist-server reelist-server')

  await printSpawnOutput('docker ps')
}

run()
