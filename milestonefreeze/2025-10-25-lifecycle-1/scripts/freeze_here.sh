#!/usr/bin/env bash
set -e
dir="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$dir/../.." && pwd)"
cd "$root"
tag="$(cat "milestonefreeze/2025-10-25-lifecycle-1/TAG.txt")"
branch="$(cat "milestonefreeze/2025-10-25-lifecycle-1/BRANCH.txt")"
git switch -c "$branch" || git switch "$branch"
git push -u origin "$branch"
(git tag -a "$tag" -m "Freeze: $tag" 2>/dev/null || true)
git push origin "refs/tags/$tag"
