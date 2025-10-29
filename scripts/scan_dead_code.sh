set -e
mkdir -p tilnychat
rg -n --files > tilnychat/ALL_FILES.txt
rg -n --files | rg '^(app|src|components)/.*\.(tsx|ts)$' | rg -v '(_archive|arkiv|node_modules|\.d\.ts$)' > tilnychat/ALL_TS_ALL.txt
rg -n --files | rg '^assets/' | rg -v '\.(md|txt)$' > tilnychat/ALL_ASSETS.txt
rg -n "from ['\"][^'\"]+['\"]|require\(['\"][^'\"]+['\"]\)" app src components | rg -v '(_archive|arkiv|node_modules)' > tilnychat/ALL_IMPORTS.txt
: > tilnychat/SUSPECT_COMPONENTS.txt
rg -n --files | rg '^(app|src|components)/.*\.tsx$' | rg -v '(_archive|arkiv|node_modules)' | while IFS= read -r f; do bn="$(basename "$f" .tsx)"; rg -n "/$bn(\.tsx)?['\"]$|/$bn['\"]$|\b$bn['\"]$" tilnychat/ALL_IMPORTS.txt > /dev/null || echo "$f" >> tilnychat/SUSPECT_COMPONENTS.txt; done
: > tilnychat/SUSPECT_MODULES.txt
while IFS= read -r f; do bn="$(basename "$f")"; name="${bn%.*}"; rg -n "/$name(\.ts|\.tsx)?['\"]$|/$name['\"]$|\b$name['\"]$" tilnychat/ALL_IMPORTS.txt > /dev/null || echo "$f" >> tilnychat/SUSPECT_MODULES.txt; done < tilnychat/ALL_TS_ALL.txt
: > tilnychat/UNUSED_ASSETS.txt
while IFS= read -r a; do bn="$(basename "$a")"; rg -n "$bn" app src components > /dev/null || echo "$a" >> tilnychat/UNUSED_ASSETS.txt; done < tilnychat/ALL_ASSETS.txt
