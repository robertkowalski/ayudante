# ayudante

making you a more productive developer since 2016...

ayudante makes your reviews easier. To use it, just run

```bash
$ ayudante $repository
```

Example for the repository `node`:

```bash
$ ayudante ~/node
```

After you run `git fetch` you can checkout PRs for easy reviews:

```
$ git fetch

# checkout PR number 42: https://github.com/nodejs/node/pull/42
$ git co pr/42
```

Inspired by https://gist.github.com/piscisaureus/3342247 by [Bert Belder / @piscisaureus](https://github.com/piscisaureus/)
