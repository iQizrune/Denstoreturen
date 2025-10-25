#!/usr/bin/env bash
set -e
dir="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$dir/../.." && pwd)"
cd "$root"
tag="$(cat "milestonefreeze/2025-10-25-lifecycle-1/TAG.txt")"
git fetch --all --tags
git reset --hard "$tag"
git clean -fdx
