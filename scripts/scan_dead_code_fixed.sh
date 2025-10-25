set -e
mkdir -p tilnychat

rg -n --files | rg '^(src|components)/.*\.(tsx|ts)$' | rg -v '(_archive|arkiv|node_modules|\.d\.ts$)' > tilnychat/CANDIDATES.txt
rg -n "from ['\"][^'\"]+['\"]|require\(['\"][^'\"]+['\"]\)" app src components | rg -v '(_archive|arkiv|node_modules)' > tilnychat/ALL_IMPORTS_FIXED.txt

: > tilnychat/SUSPECTS_FIXED.txt
while IFS= read -r f; do
  ext="${f##*.}"
  base="$(basename "$f" ".$ext")"
  pat="/$base(\.$ext)?['\"]$|/$base['\"]$|\\b$base['\"]$"
  rg -n "$pat" tilnychat/ALL_IMPORTS_FIXED.txt > /dev/null || echo "$f" >> tilnychat/SUSPECTS_FIXED.txt
done < tilnychat/CANDIDATES.txt
