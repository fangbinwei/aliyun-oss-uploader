import path from 'path'

export function isSubDirectory(parent: string, dir: string): boolean {
  const relative = path.relative(parent, dir)
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
