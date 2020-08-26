import initRun from './init'
import updateRun from './update'

async function main (argv: string[]): Promise<number> {
  if (argv[1] === 'init') {
    const projectName = argv[2]
    const baseBranch = argv[3]
    if (!projectName || !baseBranch) {
      console.log(' $ npx trgkanki-template init [project name] [base branch]')
      return -1
    }
    return initRun(projectName, baseBranch)
  }

  if (argv[1] === 'update') {
    const baseBranch: string | undefined = argv[2]
    return updateRun(baseBranch)
  }
  console.log(' $ npx trgkanki-template [init|update|package]')

  return -1
}

main(process.argv.slice(1))
  .then(errCode => process.exit(errCode))
