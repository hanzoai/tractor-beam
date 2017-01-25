# tractor-beam

[![Greenkeeper badge](https://badges.greenkeeper.io/hanzo-io/tractor-beam.svg)](https://greenkeeper.io/)
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
