#!/usr/bin/env bash
set -e

PROJECT=~/Escritorio/suarez-ai-audit
cd "$PROJECT"

echo "=== 1/4: Creando backup ==="
cp src/App.tsx src/App.tsx.bak
cp src/components/ConsolidationCenter.tsx src/components/ConsolidationCenter.tsx.bak
cp src/components/EnterpriseRiskSuite.tsx src/components/EnterpriseRiskSuite.tsx.bak
cp src/components/GovernanceSuite.tsx src/components/GovernanceSuite.tsx.bak
cp src/context/AuthContext.tsx src/context/AuthContext.tsx.bak
cp src/services/report.service.ts src/services/report.service.ts.bak
echo "✅ Backups creados (*.bak)"

echo ""
echo "=== 2/4: Extrayendo useAuth a archivo separado (react-refresh) ==="
cat > src/context/useAuth.ts << 'EOF'
import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  return useContext(AuthContext)
}
EOF
echo "✅ Creado src/context/useAuth.ts"

echo ""
echo "=== 3/4: Aplicando parches con sed ==="

# --- App.tsx: setLoading(false) cuando !user ---
# Reemplazar:
#   useEffect(() => {
#     if (!user) {
#       setLoading(false);
#       return;
#     }
#   ...
# por:
#   useEffect(() => {
#     if (!user) {
#       queueMicrotask(() => setLoading(false));
#       return;
#     }
#   ...
python3 - << 'PY'
import re
p = "src/App.tsx"
s = open(p).read()
s = re.sub(
    r'(if \(!user\) \{\s*\n\s*)setLoading\(false\);',
    r'\1queueMicrotask(() => setLoading(false));',
    s
)
open(p, "w").write(s)
print("✅ App.tsx parcheado")
PY

# --- Componentes con void load() / void loadAll() ---
for f in src/components/ConsolidationCenter.tsx src/components/EnterpriseRiskSuite.tsx src/components/GovernanceSuite.tsx; do
python3 - "$f" << 'PY'
import sys, re
p = sys.argv[1]
s = open(p).read()
# Reemplazar:
#   useEffect(() => {
#     if (open) {
#       void load()
#     }
#   }, [open])
# por:
#   useEffect(() => {
#     if (open) {
#       queueMicrotask(() => void load())
#     }
#   }, [open])
s = re.sub(
    r'(if \(open\) \{\s*\n\s*)void (load(?:All)?)\(\)',
    r'\1queueMicrotask(() => void \2())',
    s
)
open(p, "w").write(s)
print(f"✅ {p} parcheado")
PY
done

# --- AuthContext.tsx: setLoading(false) cuando !supabase ---
python3 - << 'PY'
p = "src/context/AuthContext.tsx"
s = open(p).read()
s = re.sub(
    r'(if \(!supabase\) \{ )setLoading\(false\);( return; \})',
    r'\1queueMicrotask(() => setLoading(false));\2',
    s
)
open(p, "w").write(s)
print("✅ AuthContext.tsx parcheado")
PY

# --- report.service.ts: any -> unknown ---
python3 - << 'PY'
p = "src/services/report.service.ts"
s = open(p).read()
# Cambia cualquier ': any' o '<any>' a ': unknown' / '<unknown>'
s2 = re.sub(r':\s*any\b', ': unknown', s)
s2 = re.sub(r'<\s*any\s*>', '<unknown>', s2)
if s2 != s:
    open(p, "w").write(s2)
    print("✅ report.service.ts parcheado")
else:
    print("⚠️  report.service.ts: no se encontró 'any' con el patrón esperado — revísalo a mano")
PY

echo ""
echo "=== 4/4: Verificación final ==="
npm run lint || echo "⚠️ Aún quedan errores — revisa con: npm run lint"
echo ""
echo "🎉 Hecho. Si lint pasa limpio, commitea con:"
echo "   git add -A && git commit -m 'fix: corregir errores de lint (React Hooks + Fast Refresh + any)'"
