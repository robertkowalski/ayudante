const tap = require('tap')
const test = require('tap').test
const lib = require('../')

const path = require('path')
const fs = require('fs')

const rimraf = require('rimraf')
const mkdirp = require('mkdirp')

const fakedir = path.resolve(__dirname, 'tmp')
const tmpGitDir = path.resolve(fakedir, '.git')
const tmpfile = path.resolve(__dirname, 'tmp', '.git', 'config')

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

tap.beforeEach((done) => {
  rimraf.sync(fakedir)
  mkdirp.sync(tmpGitDir)

  fs.writeFileSync(tmpfile, configMissingAdditionalFetch, 'utf8')
  done()
})

test('adds additional fetch', (t) => {
  lib.patchFile(fakedir)
  const res = fs.readFileSync(tmpfile, 'utf8')
  t.equal(res, configWithAdditionalFetch)
  t.end()
})

test('throws if fetch already exists', (t) => {
  lib.patchFile(fakedir)
  const err = new Error(
    '[remote "origin"] is already prepared, use `git fetch` to fetch PRs'
  )
  err.type = 'EUSAGE'

  t.throws(
    () => {
      lib.patchFile(fakedir)
    },
    err
  )
  t.end()
})

test('throws if no gitconfig found', (t) => {
  rimraf.sync(fakedir)

  const err = new Error(
    'Looks like the project has no .git/config file yet. Is is a git project?'
  )
  err.type = 'EUSAGE'

  t.throws(
    () => {
      lib.patchFile('doesnotexist')
    },
    err
  )
  t.end()
})

tap.afterEach((done) => {
  rimraf.sync(fakedir)
  done()
})
