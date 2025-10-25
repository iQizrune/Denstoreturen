set -e
mkdir -p tilnychat
rg -n --files | rg '^(src|components)/.*\.(tsx|ts)$' | rg -v '(_archive|arkiv|node_modules|\.d\.ts$)' > tilnychat/STRICT_TS.txt
rg -n "from ['\"][^'\"]+['\"]|require\(['\"][^'\"]+['\"]\)" src components | rg -v '(_archive|arkiv|node_modules)' > tilnychat/STRICT_IMPORTS.txt

: > tilnychat/STRICT_SUSPECTS.txt
while IFS= read -r f; do
  ext="${f##*.}"; base="$(basename "$f" ".$ext")"
  pat="/$base(\.$ext)?['\"]$|/$base['\"]$|\b$base['\"]$"
  rg -n "$pat" tilnychat/STRICT_IMPORTS.txt > /dev/null || echo "$f" >> tilnychat/STRICT_SUSPECTS.txt
done < tilnychat/STRICT_TS.txt
