const test = require('tap').test
const lib = require('../')
const path = require('path')

test('hasGitConfig', (tap) => {
  tap.test('returns true for gitconfig file in project', (t) => {
    const hasGitconfig = lib.hasGitConfig('.')
    t.ok(hasGitconfig, 'ayudante has a gitconfig')
    t.end()
  })

  tap.test('returns false for no gitconfig file in project', (t) => {
    const hasGitconfig = lib.hasGitConfig(path.join(__dirname, 'doesnotexist'))
    t.notOk(hasGitconfig, 'ayudante has a gitconfig')
    t.end()
  })

  tap.end()
})

const configWithAdditionalFetch = `[remote "origin"]
fetch = +refs/heads/*:refs/remotes/origin/*
url = git@github.com:joyent/node.git
fetch = +refs/pull/*/head:refs/remotes/origin/pr/*

[remote "robert"]
url = git@github.com:robertkowalski/couchdb.git
fetch = +refs/heads/*:refs/remotes/robert/*

[branch "book-couch-not-optimized"]
remote = robert
merge = refs/heads/book-couch-not-optimized
rebase = true
`

const configMissingAdditionalFetch = `[remote "origin"]
fetch = +refs/heads/*:refs/remotes/origin/*
url = git@github.com:joyent/node.git

[remote "robert"]
url = git@github.com:robertkowalski/couchdb.git
fetch = +refs/heads/*:refs/remotes/robert/*

[branch "book-couch-not-optimized"]
remote = robert
merge = refs/heads/book-couch-not-optimized
rebase = true
`

test('maybeAddFetchForPrs', (tap) => {
  tap.test('leaves configs alone which already have it', (t) => {
    const parsed = lib.parseGitConfig(configWithAdditionalFetch)
    const newConfig = lib.maybeAddFetchForPrs(parsed)

    t.deepEqual(newConfig, parsed)
    t.end()
  })

  tap.test('adds the fetch for [remote "origin"] if missing', (t) => {
    const parsed = lib.parseGitConfig(configMissingAdditionalFetch)
    const newConfig = lib.maybeAddFetchForPrs(parsed, 'remote "origin"')

    const expected = lib.parseGitConfig(configWithAdditionalFetch)

    t.deepEqual(expected, newConfig)
    t.end()
  })

  tap.end()
})

test('parseGitConfig', (tap) => {
  tap.test('can handle multiple keys', (t) => {
    const parsed = lib.parseGitConfig(configWithAdditionalFetch)
    const res = lib.stringifyGitConfig(parsed)

    t.equal(res, configWithAdditionalFetch)
    t.end()
  })

  tap.end()
})

test('hasFetchInSection', (tap) => {
  tap.test('tests if a the section already has the fetch, line present', (t) => {
    const parsed = lib.parseGitConfig(configWithAdditionalFetch)
    const isPresent = lib.hasFetchInSection(parsed, 'remote "origin"')

    t.equal(true, isPresent)
    t.end()
  })

  tap.test('tests if a the section already has the fetch, line present', (t) => {
    const parsed = lib.parseGitConfig(configMissingAdditionalFetch)
    const isPresent = lib.hasFetchInSection(parsed, 'remote "origin"')

    t.equal(false, isPresent)
    t.end()
  })

  tap.end()
})

