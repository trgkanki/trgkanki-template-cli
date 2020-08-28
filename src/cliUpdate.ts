import semverCompare from 'semver-compare'
import { getStdout, runCommand } from './utils/execCommand'

export async function shouldUpdateCli (): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const packageJson = require('../package.json')
  const cliVersion = packageJson.version
  const latestVersion = (await getStdout(`npm show ${packageJson.name} version`)).trim()

  return (semverCompare(cliVersion, latestVersion) < 0)
}

export async function updateCli (): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const packageJson = require('../package.json')
  await runCommand(`npm i -g ${packageJson.name}`)
}
