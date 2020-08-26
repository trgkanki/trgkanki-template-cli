import process from 'process'
import initRun from './init/index'

async function main (argv: string[]): Promise<number> {
  if (argv[1] === 'init') {
    const projectName = argv[2]
    const baseBranch = argv[3]
    if (!projectName || !baseBranch) {
      console.log(' $ npx trgkanki-template init [project name] [base branch]')
      console.log('   - base branch may be one of "base", "jsinterop", "vuedlg"')
      return -1
    }
    await initRun(projectName, baseBranch)
    return 0
  }
  console.log(' $ npx trgkanki-template [init|update|package]')

  return -1
}

main(process.argv.slice(1))
  .then(errCode => process.exit(errCode))
