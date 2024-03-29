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
import path from 'path'
import { zipDist } from './zipDist'

export default async function run (options?: { release: boolean }): Promise<string> {
  const outputPath = 'build.ankiaddon'
  const addonBuildDirName = path.basename(process.cwd())
  fs.mkdirSync('dist', { recursive: true })

  const packageName = options && options.release ? addonBuildDirName : `${addonBuildDirName} (test version)`
  await zipDist(packageName, outputPath)
  return outputPath
}
