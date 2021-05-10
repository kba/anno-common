#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function bootstrap () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?

  check_missing_os_packages || return $?

  echo "D: npm install monorepo @ $PWD:"
  npm install . || return $?
  # symlink_sanity_checks || return $?

  echo "D: lerna bootstrap @ $PWD:"
  npm run sh lerna bootstrap || return $?
}


function vdo () { echo -n "D: $*: "; "$@"; }


function check_missing_os_packages () {
  vdo rapper --version || return 3$(
    echo "E: Please apt-get install raptor2-utils" >&2)
}







bootstrap "$@"; exit $?
