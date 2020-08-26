import initRun from './init/index'

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
  console.log(' $ npx trgkanki-template [init|update|package]')

  return -1
}

main(process.argv.slice(1))
  .then(errCode => process.exit(errCode))
