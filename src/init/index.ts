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

import { getStdout, runCommand } from '../utils/execCommand'
import dateFormat from 'date-fns/format'
import shelljs from 'shelljs'
import { v4 as uuidV4 } from 'uuid'
import fs from 'fs'
import process from 'process'

function mergeMessage (baseBranch: string) {
  const dateString = dateFormat(new Date(), 'yyyy.MM-dd - %H:%M')
  return `🔀 merge from template/${baseBranch} (${dateString})`
}

export default async function run (projectName: string, baseBranch: string) {
  console.log(`Generating project ${projectName} from template/${baseBranch}`)
  const uuid = uuidV4()
  console.log(` - addon UUID: ${uuid}`)

  fs.mkdirSync(projectName, { recursive: true })
  process.chdir(projectName)

  await runCommand('git init')
  await runCommand('git remote add template https://github.com/trgkanki/addon_template')
  await runCommand('git fetch --all')
  await runCommand('git checkout -b develop')
  await runCommand(`git merge template/${baseBranch} -m "${mergeMessage(baseBranch)}"`)

  fs.writeFileSync('UUID', uuid)
  fs.writeFileSync('BASEBRANCH', baseBranch)

  // Update files accordingly
  shelljs.sed('-i', /"name": "addon_template",/, `"name": "${projectName}",`, 'package.json')
  shelljs.sed('-i', /"name": "addon_template",/, `"name": "${projectName}",`, 'package-lock.json')
  shelljs.sed('-i', /# addon_template v/, `# ${projectName} v`, 'src/__init__.py')

  await getStdout('npm i')
  await getStdout('git add -A')
  await runCommand(`git commit -m "🎉 generated from template/${baseBranch}"`)

  console.log('Project generated from template')
}
