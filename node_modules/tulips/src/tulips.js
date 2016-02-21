'use strict'

exports.parse = exports.decode = offeringTable

// tuples for the tuple gods!
exports.offeringTable = offeringTable

exports.stringify = exports.encode = encode

const safe = require('ini').safe
const unsafe = require('ini').unsafe
exports.safe = safe
exports.unsafe = unsafe

const eol = require('os').EOL

function getKey (o) {
  return Object.keys(o)[0]
}

function encode (arr, opt) {
  const children = []
  let out = ''

  if (typeof opt === 'string') {
    opt = {
      section: opt,
      whitespace: false
    }
  } else {
    opt = opt || {}
    opt.whitespace = opt.whitespace === true
  }

  const separator = opt.whitespace ? ' = ' : '='

  arr.forEach(el => {

    const k = getKey(el)
    const val = el[k]

    if (Array.isArray(val)) {
      if (typeof val[0] === 'object') {
        // we found a tuple, tuples for the tuple gods!
        children.push({[k]: val})
      } else {
        // array notation
        val.forEach(item => {
          out += safe(k + '[]') + separator + safe(item) + '\n'
        })
      }
    } else {
      out += safe(k) + separator + safe(val) + eol
    }
  })

  if (opt.section && out.length) {
    out = '[' + safe(opt.section) + ']' + eol + out
  }

  children.forEach(el => {
    const k = getKey(el)

    const nk = dotSplit(k).join('\\.')
    const section = (opt.section ? opt.section + '.' : '') + nk

    const child = encode(el[k], {
      section: section,
      whitespace: opt.whitespace
    })
    if (out.length && child.length) {
      out += eol
    }

    out += child
  })

  return out
}

function offeringTable (str) {
  let out = []
  let p = out
  let section = null
  //          section     |key      = value
  const re = /^\[([^\]]*)\]$|^([^=]+)(=(.*))?$/i
  const lines = str.split(/[\r\n]+/g)

  lines.forEach(function (line, _, __) {
    if (!line || line.match(/^\s*[;#]/)) return
    const match = line.match(re)
    if (!match) return
    if (match[1] !== undefined) {
      section = unsafe(match[1])
      p = []
      out.push({[section]: p})
      return
    }
    let key = unsafe(match[2])
    let value = match[3] ? unsafe((match[4] || '')) : true
    switch (value) {
      case 'true':
      case 'false':
      case 'null': value = JSON.parse(value)
    }
    // Convert keys with '[]' suffix to an array
    if (key.length > 2 && key.slice(-2) === '[]') {
      key = key.substring(0, key.length - 2)

      const hasTuple = p.some(el => {
        return getKey(el) === key
      })

      if (!hasTuple) {
        p.push({[key]: [value]})
        return
      } else {
        p.forEach((el, i) => {
          if (getKey(el) === key) {
            const a = el[key]
            a.push(value)
            p[i][key] = a
          }
        })

        return
      }
    }

    // safeguard against resetting a previously defined
    // array by accidentally forgetting the brackets
    const e = p[p.length - 1]
    if (e && Array.isArray(e[key])) {
      e[key].push(value)
      return
    }

    p.push({[key]: value})
  })

  return out
}

function dotSplit (str) {
  return str.replace(/\1/g, '\u0002LITERAL\\1LITERAL\u0002')
    .replace(/\\\./g, '\u0001')
    .split(/\./).map(function (part) {
    return part.replace(/\1/g, '\\.')
      .replace(/\2LITERAL\\1LITERAL\2/g, '\u0001')
  })
}
