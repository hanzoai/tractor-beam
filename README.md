# tractor-beam
Directory upload using proposed Directory Upload spec as part of the new
FileSystem API.

## Overview
User should be able to drag and drop a folder and upload site which will be
statically hosted by us. We will leverage the new Directory Upload proposal
(part of the new FileSystem API) which is currently only supported in
Firefox Nightly / Edge. Chrome 25+ can be supported with a polyfill.

Spec: https://wicg.github.io/directory-upload/proposal.html / http://w3c.github.io/filesystem-api/
Example: https://wicg.github.io/directory-upload/index.html
