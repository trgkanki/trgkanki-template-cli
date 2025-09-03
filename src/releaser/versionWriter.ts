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

import fs from 'fs'
import { getRepoName } from '../utils/gitCommand'

export async function updateFilesVersionString (newVersion: string) {
  const repoName = await getRepoName()
  console.log(`Updating to "${repoName} v${newVersion}"`)

  {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    packageJson.version = newVersion
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
  }

  {
    const packageLockJson = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'))
    packageLockJson.version = newVersion
    // for lockfile v2+
    if (packageLockJson.packages && packageLockJson.packages['']) {
      packageLockJson.packages[''].version = newVersion
    }
    fs.writeFileSync('package-lock.json', JSON.stringify(packageLockJson, null, 2))
  }

  {
    const initPy = fs.readFileSync('src/__init__.py', 'utf8')
    const newInitPy = initPy.replace(/^# .+v(\d+)\.(\d+)\.(\d+)[i.](\d+)$/m, `# ${repoName} v${newVersion}`)
    fs.writeFileSync('src/__init__.py', newInitPy)
  }

  fs.writeFileSync('src/VERSION', newVersion)
}
