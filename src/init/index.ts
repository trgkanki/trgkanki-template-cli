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
import { v4 as uuidV4 } from 'uuid'
import fs from 'fs'

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
    await getStdout(`git merge template/${baseBranch}`)

    spinner.setSpinnerTitle('Installing npm libraries')
    await getStdout('npm i')

    spinner.setSpinnerTitle('Configuring addon settings')
    fs.writeFileSync('src/UUID', uuid)
    fs.writeFileSync('BASEBRANCH', baseBranch)

    // Update files accordingly
    {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      packageJson.name = projectName
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
    }
    {
      const packageLockJson = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'))
      packageLockJson.name = projectName
      // for lockfile v2+
      if (packageLockJson.packages && packageLockJson.packages['']) {
        packageLockJson.packages[''].name = projectName
      }
      fs.writeFileSync('package-lock.json', JSON.stringify(packageLockJson, null, 2))
    }
    {
      const initPy = fs.readFileSync('src/__init__.py', 'utf8')
      const newInitPy = initPy.replace(/# addon_template v/, `# ${projectName} v`)
      fs.writeFileSync('src/__init__.py', newInitPy)
    }

    await getStdout('git add -A')
    await getStdout(`git commit -m "feat: new addon generated from template/${baseBranch}"`)
    spinner.stop()

    console.log('🎉 Project generated from template!')
    return 0
  } finally {
    spinner.stop()
  }
}
