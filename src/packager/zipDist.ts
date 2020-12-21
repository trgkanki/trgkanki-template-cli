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

import NodeZip from 'node-zip'
import walk from 'walkdir'
import fs from 'fs'
import path from 'path'

const ignoreList = [
  '__pycache__',
  'meta.json',
  'tests'
]

export function zipDist (packageName: string, outputPath: string) {
  const zip = new NodeZip()
  const paths = walk.sync('src')

  let hasManifest = false
  for (const fPath of paths) {
    let ignore = false
    for (const pattern of ignoreList) {
      if (fPath.indexOf(pattern) !== -1) {
        ignore = true
        break
      }
    }
    if (ignore) continue
    if (!fs.statSync(fPath).isFile()) continue

    if (fPath.indexOf('manifest.json') !== -1) {
      hasManifest = true
    }

    const relPath = path.relative('src/', fPath).replace(/\\/g, '/')
    console.log(' Adding to archive: ' + relPath)

    const data = fs.readFileSync(fPath)
    zip.file(relPath, data)
  }

  // Append manifest.json if not exists.
  if (!hasManifest) {
    zip.file('manifest.json', JSON.stringify({
      package: packageName,
      name: packageName
    }))
  }

  const data = zip.generate({ base64: false, compression: 'DEFLATE' })
  fs.writeFileSync(outputPath, data, 'binary')
}
