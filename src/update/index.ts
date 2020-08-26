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

import { runCommand } from '../utils/execCommand'
import dateFormat from 'date-fns/format'
import fs from 'fs'
import simpleGit from 'simple-git'

function mergeMessage (baseBranch: string) {
  const dateString = dateFormat(new Date(), 'yyyy.MM-dd - %H:%M')
  return `🔀 merge from template/${baseBranch} (${dateString})`
}

export default async function run (baseBranch: string | undefined): Promise<number> {
  const git = simpleGit()

  const status = await git.status()
  if (!status.isClean()) throw new Error('Error: Branch must be clean before merge.')

  try {
    const repoBaseBranch = fs.readFileSync('BASEBRANCH', { encoding: 'utf-8' }).trim()
    if (baseBranch && repoBaseBranch !== baseBranch) throw new Error('basebranch mismatch')
    baseBranch = repoBaseBranch
  } catch {
    if (baseBranch) {
      fs.writeFileSync('BASEBRANCH', baseBranch)
      console.error('Commit BASEBRANCH file and re-execute binary without branch arguments.')
      console.error(' $ ' + process.argv.join(''))
      return 0
    } else {
      console.error('Please specify incoming branch. (BASEBRANCH file not exists)')
      return -2
    }
  }

  await git.fetch('template', baseBranch)
  try {
    await runCommand(`git merge template/${baseBranch} -m "${mergeMessage(baseBranch)}"`)
  } catch {
    console.log('## Resolve conflicts and commit.')
    return -1
  }
  return 0
}
