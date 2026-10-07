#!/usr/bin/env bash
# Build the checkout's main out of tree and point STATE/current at it, then
# restart the server. Run by meta-notes-ui-update.service (deploy/nuc.md).
# Fails closed: on any error `current` and the running server are untouched.
set -euo pipefail

CHECKOUT=${CHECKOUT:-/srv/shared/work/meta-notes-ui-work/meta-notes-ui}
STATE=${STATE:-$HOME/.local/share/meta-notes-ui}
RESTART_CMD=${RESTART_CMD:-systemctl --user restart meta-notes-ui}
INSTALL_CMD=${INSTALL_CMD:-npm ci}
BUILD_CMD=${BUILD_CMD:-npm run build}
KEEP=3

builds=$STATE/builds
mkdir -p "$builds"

# main can move during a build. The path unit's start then merges into this
# running job and is dropped, so after each restart re-read main and build
# again until it is stable.
while :; do
  sha=$(git -C "$CHECKOUT" rev-parse --verify main)

  if [ -f "$STATE/current/.built-sha" ] && [ "$(cat "$STATE/current/.built-sha")" = "$sha" ]; then
    echo "up to date at $sha"
    break
  fi

  tmp=$builds/.$sha.tmp
  rm -rf "$tmp"
  trap 'rm -rf "$tmp"' EXIT
  mkdir -p "$tmp"
  git -C "$CHECKOUT" archive "$sha" | tar -x -C "$tmp"
  (cd "$tmp" && $INSTALL_CMD && $BUILD_CMD)
  echo "$sha" > "$tmp/.built-sha"

  rm -rf "$builds/$sha"
  mv "$tmp" "$builds/$sha"
  ln -sfn "$builds/$sha" "$STATE/.current.new"
  mv -T "$STATE/.current.new" "$STATE/current"
  echo "built $sha"

  # Keep the newest KEEP builds (and never the current one).
  cur=$(readlink "$STATE/current")
  i=0
  for d in $(ls -1dt "$builds"/*/ 2>/dev/null); do
    d=${d%/}
    i=$((i + 1))
    if [ "$i" -gt "$KEEP" ] && [ "$d" != "$cur" ]; then rm -rf "$d"; fi
  done

  bash -c "$RESTART_CMD"

  now=$(git -C "$CHECKOUT" rev-parse --verify main)
  if [ "$now" = "$sha" ]; then
    break
  fi
  echo "main moved from $sha to $now during the build; building again"
done
