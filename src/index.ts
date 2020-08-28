import initRun from './init'
import updateRun from './update'
import packagerRun from './packager'
import releaserRun from './releaser'
import linkRun from './link'
import { updateCli, shouldUpdateCli } from './cliUpdate'
import { spawn } from 'child_process'

/**
 * Run a new instance of cli.
 *
 * Note that parent cannot exit here due to stdio being piped into parent.
 * Somehow stdio: 'inherit' with detached: true doesn't work in windows.
 * https://github.com/nodejs/node/issues/3596#issuecomment-250890218
 */
async function createNewProcess () : Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(process.argv[0], process.argv.slice(1), { stdio: 'inherit' }) // Listen for any response:
    child.on('exit', (code) => {
      resolve(code || -1)
    })
  })
}

async function main (argv: string[]): Promise<number> {
  if (await shouldUpdateCli()) {
    console.log('[CLI update] Update needed: Updating cli...')
    await updateCli()
    return createNewProcess()
  }

  if (argv[1] === 'init') {
    const projectName = argv[2]
    const baseBranch = argv[3]
    if (!projectName || !baseBranch) {
      console.log(' $ npx trgkanki-template-cli init [project name] [base branch]')
      return -1
    }
    return initRun(projectName, baseBranch)
  }

  if (argv[1] === 'update') {
    const baseBranch: string | undefined = argv[2]
    return updateRun(baseBranch)
  }

  if (argv[1] === 'package') {
    const outputPath = await packagerRun()
    console.log(`Built to ${outputPath}`)
    return 0
  }

  if (argv[1] === 'release') {
    return releaserRun()
  }

  if (argv[1] === 'link') {
    return linkRun(argv[2])
  }

  console.log(' $ npx trgkanki-template-cli [init|update|package]')

  return -1
}

main(process.argv.slice(1))
  .then(errCode => process.exit(errCode))
