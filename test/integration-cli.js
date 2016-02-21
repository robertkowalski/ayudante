const tap = require('tap')
const test = require('tap').test

const path = require('path')
const fs = require('fs')
const spawnSync = require('child_process').spawnSync

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

test('runs the cli', (t) => {
  spawnSync(path.resolve(__dirname, '..', 'bin/ayudante'), [fakedir])
  const res = fs.readFileSync(tmpfile, 'utf8')
  t.equal(res, configWithAdditionalFetch)
  t.end()
})

test('errors if file already patched', (t) => {
  spawnSync(path.resolve(__dirname, '..', 'bin/ayudante'), [fakedir])
  const out = spawnSync(path.resolve(__dirname, '..', 'bin/ayudante'), [fakedir])
  t.ok(/\[remote "origin"\] is already prepared/.test(out.stderr.toString()), 'contains [remote "origin"] is already prepared')
  t.end()
})

tap.afterEach((done) => {
  rimraf.sync(fakedir)
  done()
})
