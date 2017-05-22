# tractor-beam

[![npm][npm-img]][npm-url]
[![build][build-img]][build-url]
[![dependencies][dependencies-img]][dependencies-url]
[![downloads][downloads-img]][downloads-url]
[![license][license-img]][license-url]
[![chat][chat-img]][chat-url]

> Future-proof file upload

Directory upload using proposed Directory Upload spec as part of the new
FileSystem API.

## Overview
User should be able to drag and drop a folder and upload site which will be
statically hosted by us. We will leverage the new Directory Upload proposal
(part of the new FileSystem API) which is currently only supported in
Firefox Nightly / Edge. Chrome 25+ can be supported with a polyfill.

Spec: https://wicg.github.io/directory-upload/proposal.html / http://w3c.github.io/filesystem-api/
Example: https://wicg.github.io/directory-upload/index.html

## Flow
Create TractorBeam instance with options
Options should include a parameter called `postPath`. `postPath` should
either be a function that takes a file returns a `string` or a simply `string`

## Install
```bash
$ npm install tractor-beam --save
```

## License
[BSD][license-url]

[build-img]:        https://img.shields.io/travis/hanzo-io/tractor-beam.svg
[build-url]:        https://travis-ci.org/hanzo-io/tractor-beam
[chat-img]:         https://badges.gitter.im/join-chat.svg
[chat-url]:         https://gitter.im/hanzo-io/chat
[coverage-img]:     https://coveralls.io/repos/hanzo-io/tractor-beam/badge.svg?branch=master&service=github
[coverage-url]:     https://coveralls.io/github/hanzo-io/tractor-beam?branch=master
[dependencies-img]: https://david-dm.org/hanzo-io/tractor-beam.svg
[dependencies-url]: https://david-dm.org/hanzo-io/tractor-beam
[downloads-img]:    https://img.shields.io/npm/dm/tractor-beam.svg
[downloads-url]:    http://badge.fury.io/js/tractor-beam
[license-img]:      https://img.shields.io/npm/l/tractor-beam.svg
[license-url]:      https://github.com/hanzo-io/tractor-beam/blob/master/LICENSE
[npm-img]:          https://img.shields.io/npm/v/tractor-beam.svg
[npm-url]:          https://www.npmjs.com/package/tractor-beam
