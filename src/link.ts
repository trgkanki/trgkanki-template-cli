import fs from 'fs'
import path from 'path'
import symlinkDir from 'symlink-dir'

export default async function run (ankiDataDir: string | undefined): Promise<number> {
  ankiDataDir = ankiDataDir ||
    process.env.ANKI_BASE ||
    defaultDataDir()
  if (!fs.existsSync(path.join(ankiDataDir, 'prefs21.db'))) {
    throw Error('Not a valid anki data directory!')
  }
  const projectName: string = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf-8' })).name
  const src = 'src'
  const dst = path.join(ankiDataDir, 'addons21', projectName)
  console.log(`Linking ${src} to ${dst}`)
  await symlinkDir(src, dst)
  return 0
}

function defaultDataDir (): string {
  const homeDir = process.env.HOME || ''
  const appDataDir = process.env.APPDATA || ''
  let dataDir: string

  switch (process.platform) {
    case 'win32':
      return path.join(appDataDir, 'Anki2')
    case 'darwin':
      return path.join(homeDir, 'Library/Application Support/Anki2')
    default:
      dataDir = process.env.XDG_DATA_HOME || path.join(homeDir, '.local/share')
      return path.join(dataDir, 'Anki2')
  }
}
