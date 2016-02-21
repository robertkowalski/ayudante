const tulips = require('tulips')
const fs = require('fs')
const path = require('path')

exports.patchFile = patchFile
function patchFile (filePath) {
  const remote = 'remote "origin"'

  if (!hasGitConfig(filePath)) {
    const err = new Error(
      'Looks like the project has no .git/config file yet. Is is a git project?',
      'Example: ayudante nodejs'
    )
    err.type = 'EUSAGE'
    throw err
  }

  filePath = path.resolve(filePath, '.git', 'config')
  const file = fs.readFileSync(filePath, 'utf8')

  const parsed = parseGitConfig(file)

  if (hasFetchInSection(parsed, remote)) {
    const er = new Error(
      `[${remote}] is already prepared, use \`git fetch\` to fetch PRs`
    )
    er.type = 'EUSAGE'
    throw er
  }

  const newConfig = maybeAddFetchForPrs(parsed, remote)
  const newFileContent = stringifyGitConfig(newConfig)
  fs.writeFileSync(filePath, newFileContent, 'utf8')
}

exports.hasGitConfig = hasGitConfig
function hasGitConfig (directory) {
  const config = path.resolve(directory, '.git', 'config')
  return fs.existsSync(config)
}

exports.parseGitConfig = parseGitConfig
function parseGitConfig (gitconfig) {
  return tulips.parse(gitconfig)
}

exports.stringifyGitConfig = stringifyGitConfig
function stringifyGitConfig (gitconfig) {
  return tulips.stringify(gitconfig, {whitespace: true})
}

exports.maybeAddFetchForPrs = maybeAddFetchForPrs
function maybeAddFetchForPrs (parsed, section) {
  parsed = JSON.parse(JSON.stringify(parsed))
  return parsed.map((el) => {
    const s = Object.keys(el)[0]

    if (s !== section) return el

    const hasPrRelatedRemote = el[s].some(
      (el) => el.fetch && el.fetch === '+refs/pull/*/head:refs/remotes/origin/pr/*'
    )

    if (hasPrRelatedRemote) return el

    el[s].push({fetch: '+refs/pull/*/head:refs/remotes/origin/pr/*'})

    return el
  })
}

exports.hasFetchInSection = hasFetchInSection
function hasFetchInSection (parsed, section) {
  return parsed.reduce((acc, el) => {
    const s = Object.keys(el)[0]

    if (s !== section) return acc

    const hasPrRelatedRemote = el[s].some(
      (el) => el.fetch && el.fetch === '+refs/pull/*/head:refs/remotes/origin/pr/*'
    )

    acc.push(hasPrRelatedRemote)

    return acc
  }, []).some((e) => e === true)
}
