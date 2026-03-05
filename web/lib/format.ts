import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { enUS } from "date-fns/locale"
import { ja } from "date-fns/locale"
import type { Locale } from "date-fns"

const locales: Record<string, Locale> = {
  zh: zhCN,
  en: enUS,
  ja: ja,
}

export function formatTime(dateStr: string, lang: string = "zh"): string {
  const locale = locales[lang] || zhCN
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale })
}

export function formatCount(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}
