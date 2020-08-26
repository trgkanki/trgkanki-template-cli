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

import { getStdout } from '../utils/execCommand'
import { Spinner } from 'cli-spinner'
import dateFormat from 'date-fns/format'
import shelljs from 'shelljs'
import { v4 as uuidV4 } from 'uuid'
import fs from 'fs'

function mergeMessage (baseBranch: string) {
  const dateString = dateFormat(new Date(), 'yyyy.MM-dd - HH:mm')
  return `🔀 merge from template/${baseBranch} (${dateString})`
}

export default async function run (projectName: string, baseBranch: string): Promise<number> {
  console.log(`Generating project ${projectName} from template/${baseBranch}`)
  const uuid = uuidV4()
  console.log(` - addon UUID: ${uuid}`)

  if (fs.existsSync(projectName)) {
    console.log(' - Project directory already exists. Exiting.')
    return -1
  }

  fs.mkdirSync(projectName, { recursive: true })
  process.chdir(projectName)

  const spinner = new Spinner('Generating project... %s')
  spinner.setSpinnerString(18)
  spinner.start()

  try {
    spinner.setSpinnerTitle('Fetching template content')
    await getStdout('git init')
    await getStdout('git remote add template https://github.com/trgkanki/addon_template')
    await getStdout(`git fetch template ${baseBranch}`)
    await getStdout('git checkout -b develop')
    await getStdout(`git merge template/${baseBranch} -m "${mergeMessage(baseBranch)}"`)

    spinner.setSpinnerTitle('Installing npm libraries')
    await getStdout('npm i')

    spinner.setSpinnerTitle('Configuring addon settings')
    fs.writeFileSync('UUID', uuid)
    fs.writeFileSync('BASEBRANCH', baseBranch)

    // Update files accordingly
    shelljs.sed('-i', /"name": "addon_template",/, `"name": "${projectName}",`, 'package.json')
    shelljs.sed('-i', /"name": "addon_template",/, `"name": "${projectName}",`, 'package-lock.json')
    shelljs.sed('-i', /# addon_template v/, `# ${projectName} v`, 'src/__init__.py')

    await getStdout('git add -A')
    await getStdout(`git commit -m "🎉 generated from template/${baseBranch}"`)
    spinner.stop()

    console.log('🎉 Project generated from template!')
    return 0
  } finally {
    spinner.stop()
  }
}
