import semverCompare from 'semver-compare'
import { getStdout, runCommand } from './utils/execCommand'

export async function shouldUpdateCli (): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const packageJson = require('../package.json')

  // Check if this package is installed via `npm link`
  // if this is local development, skip auto-update check.
  const dependencyJSON = await getStdout('npm ls -g --depth=0 --link=true --json=true')
  const globalLinkedPackages = Object.keys(JSON.parse(dependencyJSON).dependencies || {})
  if (globalLinkedPackages.indexOf(packageJson.name) !== -1) {
    console.debug('This package is installed locally via \'npm link\'. Skipping auto-update check')
    return false
  }

  const cliVersion = packageJson.version
  const latestVersion = (await getStdout(`npm show ${packageJson.name} version`)).trim()

  return (semverCompare(cliVersion, latestVersion) < 0)
}

export async function updateCli (): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const packageJson = require('../package.json')
  await runCommand(`npm i -g ${packageJson.name}`)
}
