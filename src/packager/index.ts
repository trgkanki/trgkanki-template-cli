// Copyright (C) 2020 Hyun Woo Park
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import utcVersion from 'utc-version'
import tmp from 'tmp'
import fs from 'fs'
import gitBranchIs from 'git-branch-is'

import { checkCleanRepo, getRepoName } from '../utils/gitCommand'
import { zipDist } from './zipDist'
import { getStdout } from '../utils/execCommand'
import { updateFilesVersionString } from './versionWriter'
import { updateChangelog, inputChangelog } from './changelog'

export default async function run (): Promise<number> {
  if (!await gitBranchIs('develop')) {
    throw new Error('You can issue a release only from the develop branch')
  }

  await checkCleanRepo()

  const repoName = await getRepoName()
  const version = utcVersion({ apple: true })

  const changelogMessage = await inputChangelog()
  if (!changelogMessage) {
    console.error('Empty changelog message')
    return -1
  }
  console.log(changelogMessage)
  await updateChangelog(version, changelogMessage)

  // Update __init__.py + VERSION
  await updateFilesVersionString(version)

  // Dist zip
  fs.mkdirSync('dist', { recursive: true })
  await zipDist(`dist/${repoName}_v${version}.ankiaddon`)
  await zipDist(`dist_${repoName}.ankiaddon`)

  // Commit
  await getStdout('git add -A')
  const commitMessageFname = tmp.tmpNameSync()
  fs.writeFileSync(commitMessageFname, `:bookmark: v${version}\n\n${changelogMessage}`)
  try {
    await getStdout(`git commit -F "${commitMessageFname}"`)
  } finally {
    fs.unlinkSync(commitMessageFname)
  }

  // Add tag
  await getStdout(`git tag v${version}`)
  await getStdout('git push --tags')

  // Merge to master
  await getStdout('git checkout master')
  await getStdout('git merge develop')
  await getStdout('git checkout develop')

  console.log('Dist + commit done!')
  return 0
}
