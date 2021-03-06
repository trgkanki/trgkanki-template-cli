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

import { getStdout } from './execCommand'
import natCompare from 'natural-compare-lite'

export async function checkCleanRepo (): Promise<void> {
  const gitStatus = await getStdout('git status')
  if (gitStatus.indexOf('nothing to commit, working tree clean') === -1) {
    throw new Error('Repo not clean. Only can distribute on clean repo')
  }
}

export async function getRepoName (): Promise<string> {
  const originUrl = await getStdout('git remote get-url origin')
  const matches = originUrl.match(/.*\/(\w+)(\.git)?/)
  if (!matches) throw new Error('failed to get origin')
  const repoName = matches[1]
  if (!repoName) throw new Error('bad repo name')
  return repoName
}

export async function getLatestReleaseVersion (): Promise<string | undefined> {
  const tags = (await getStdout('git tag')).split('\n')
  let lastTag = ''
  for (const tag of tags) {
    // v20.5.9i105
    if (/^v(\d+)\.(\d+)\.(\d+)i(\d+)$/.test(tag)) {
      if (natCompare(lastTag, tag) < 0) lastTag = tag
    }
  }
  return lastTag || undefined
}
