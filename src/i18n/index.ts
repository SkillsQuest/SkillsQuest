import { pack, type Dict, type T } from './core.ts'
import { en } from './en.ts'
import { zh } from './zh.ts'

export {
  LANGS,
  LANG_LABEL,
  LANG_TAG,
  defineDict,
  format,
  isLang,
  pack,
  parseAcceptLanguage,
  pickLang,
  translator,
  type Dict,
  type Lang,
  type T,
  type Vars,
} from './core.ts'

export type AppKey = keyof typeof zh
export type AppT = T<AppKey>

export type CommonKey = AppKey

const enDict: Dict<AppKey> = en

export const appT = pack<AppKey>({ zh, en: enDict })
