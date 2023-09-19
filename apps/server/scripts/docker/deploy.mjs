import { spawn } from 'node:child_process'
import build from './build.mjs'

const printSpawnOutput = (commandString) => {
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

// expected to be called through `nx run server:deploy-prod` (might need to be run from in apps/server)
const run = async () => {
  await build()
  
  // // remove the old docker image and create a new one
  await printSpawnOutput('rm reelist-server.tar')
  await printSpawnOutput('docker save --output reelist-server.tar reelist-server')

  // send the new docker image to the server
  await printSpawnOutput('scp -P 48199 reelist-server.tar djohnson@reelist.app:~/app/')
  

  await printSpawnOutput('scp -P 48199 reelist-server.tar djohnson@reelist.app:~/app/')
}

run()
