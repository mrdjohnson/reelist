import { spawn} from 'node:child_process'

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

const build = async () => {
  await printSpawnOutput('docker build -t reelist-server .')

  await printSpawnOutput('docker save reelist-server > reelist-server.tar')
}

export default build
