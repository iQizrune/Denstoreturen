import * as Banks from './index'

function listOf(x:any): any[] {
  if (!x) return []
  if (Array.isArray(x)) return x
  if (Array.isArray(x.items)) return x.items
  if (Array.isArray(x.questions)) return x.questions
  if (Array.isArray(x.data)) return x.data
  if (Array.isArray(x.list)) return x.list
  return []
}

function toManaged(q:any, idx:number) {
  const opts = Array.isArray(q?.options) ? q.options : []
  const correctId = String(q?.correctId ?? (opts.find((o:any)=>o?.correct)?.id ?? ''))
  const image = q?.image ?? (q?.flagUrl ? { uri: String(q.flagUrl) } : undefined)
  return {
    id: String(q?.id ?? 'q-'+idx),
    text: String(q?.text ?? q?.question ?? q?.title ?? q?.prompt ?? ''),
    options: opts.map((o:any)=>({ id: String(o?.id ?? o?.value ?? o?.key), label: String(o?.label ?? o?.text ?? o?.name ?? o?.id), correct: !!o?.correct })),
    correctId,
    kind: String(q?.kind ?? 'text'),
    image,
    flagEmoji: q?.flagEmoji ?? undefined,
    meta: q?.meta ?? undefined
  }
}

export function buildMainManagedSequence(): any[] {
  const EZ = listOf((Banks as any).easyBank)
  const MD = listOf((Banks as any).mediumBank)
  const HD = listOf((Banks as any).hardBank)
  const chosen:any[] = [...EZ, ...MD, ...HD].filter(Boolean)
  return chosen.map(toManaged)
}
