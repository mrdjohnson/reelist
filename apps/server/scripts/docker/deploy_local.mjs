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

  // create a backup of the current image
  await printSpawnOutput('docker tag reelist-server:latest reelist-server:previous')

  // load in the new image from the saved file
  await printSpawnOutput('docker load --input reelist-server.tar')

  // stop the current container 
  await printSpawnOutput('docker rm -f reelist-server')

  // start the next container
  await printSpawnOutput('docker run -d -p 3000:3000 --name reelist-server reelist-server')

  // --- Outputs ----

  // there should be two images, latest and previous, and latest should be under 1 min old
  await printSpawnOutput('docker image ls -f reference=reelist-server')

  // there should be a container running, and it should be under 1 min old
  await printSpawnOutput('docker ps -a -f ancestor=reelist-server')
}

run()
