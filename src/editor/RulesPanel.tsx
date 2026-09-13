import { useState } from 'react'
import { Button, Disclosure } from '@heroui/react'
import {
  MEDAL_SHAPES,
  MEDAL_TIERS,
  RES_ICONS,
  RES_ICON_NAMES,
  newNodeId,
  renameRes,
} from '../lib/index.ts'
import type { Award, SkillTreeDoc } from '../skilltree/index.ts'
import { ICON, Ico } from '../tree-view/index.ts'
import { Confirm, Seg, Step } from '../components/ui'
import type { AppKey } from '../i18n/index.ts'
import { useApp, useT, type AppT } from '../host/store.ts'
import { AttrTable } from './AttrTable'
import { CondBuilder } from './CondBuilder'
import { IconPickerButton, IconRow } from './IconPicker'
import { Field, PanelHead, Section, SwitchRow } from './panel'

const NAME_MAX = { res: { zh: 3, en: 8 }, award: { zh: 4, en: 12 } }

const DESC_MAX = { zh: 50, en: 90 }

const AWARD_MAX = { basic: 6, total: 15 }

const resNames = (t: AppT): Record<string, string> =>
  Object.fromEntries(Object.entries(RES_ICON_NAMES).map(([icon, key]) => [icon, t(key)]))

export function RulesPanel({
  doc,
  onChange,
  onClose,
}: {
  doc: SkillTreeDoc
  onChange: (p: Partial<SkillTreeDoc>) => void
  onClose: () => void
}) {
  const t = useT()
  const lang = useApp((s) => s.settings.lang)
  const [askDaily, setAskDaily] = useState<number | null>(null)
  const res = doc.res ?? { name: t('res.fallbackName'), icon: 'star' }
  const rules = doc.rules ?? {}
  const awards = doc.awards ?? []
  const accent = doc.meta.accent ?? 'var(--accent)'
  const set = (p: Partial<SkillTreeDoc>) => onChange(p)
  const patchAward = (i: number, a: Partial<Award>) =>
    set({ awards: awards.map((x, j) => (i === j ? { ...x, ...a } : x)) })

  const pickResIcon = (icon: string) => {
    const name = renameRes(res.name, icon, resNames(t))
    set({ res: { ...res, icon, ...(name === undefined ? {} : { name }) } })
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <PanelHead title={t('editor.rules')} onClose={onClose} />

      <Section title={t('editor.field.res')} hint={t('editor.res.hint')}>
        <div className="flex flex-col gap-2">
          <input
            value={res.name}
            aria-label={t('editor.resName')}
            onChange={(e) =>
              set({ res: { ...res, name: e.target.value.slice(0, NAME_MAX.res[lang]) } })
            }
            className="w-24 rounded-xl bg-surface px-2 py-1.5 text-sm outline-none"
          />
          <IconRow icons={RES_ICONS} value={res.icon} accent={accent} onPick={pickResIcon} />
        </div>
      </Section>

      <Section title={t('editor.field.rules')}>
        <SwitchRow
          label={t('editor.rule.strict')}
          hint={t('editor.rule.strictHint')}
          on={!!rules.strict}
          onChange={(strict) => set({ rules: { ...rules, strict } })}
        />
        <div className="flex items-start gap-3 py-1.5">
          <div className="min-w-0 flex-1">
            <div className="text-sm">{t('editor.rule.daily')}</div>
            <div className="mt-0.5 text-xs leading-relaxed text-muted">
              {rules.daily ? t('editor.rule.dailyHint') : t('editor.rule.dailyOff')}
            </div>
          </div>
          <Step
            value={rules.daily ?? 0}
            onChange={(daily) => {
              if (daily > 0 && !rules.daily) setAskDaily(daily)
              else set({ rules: { ...rules, daily } })
            }}
            max={12}
          />
        </div>
        <SwitchRow
          label={t('editor.rule.checkin')}
          hint={t('editor.rule.checkinHint')}
          on={!!rules.checkin}
          onChange={(checkin) => {
            const next = { ...rules }
            if (checkin) next.checkin = true
            else delete next.checkin
            set({ rules: next })
          }}
        />
      </Section>

      {askDaily !== null && (
        <Confirm
          title={t('editor.rule.dailyAsk')}
          hint={t('editor.rule.dailyAskHint')}
          onOk={() => set({ rules: { ...rules, daily: askDaily } })}
          onClose={() => setAskDaily(null)}
        />
      )}

      <Section title={t('editor.field.awards')} hint={t('editor.award.hint')}>
        <div className="space-y-2">
          {awards.length === 0 && <div className="text-xs text-muted">{t('editor.award.empty')}</div>}
          {awards.map((a, i) => (
            <div key={a.id} className="flex items-center gap-1.5 rounded-xl bg-surface p-2">
              <IconPickerButton
                icon={a.icon ?? 'medal'}
                accent={accent}
                label={t('editor.award.icon')}
                onPick={(icon) => patchAward(i, { icon })}
                trigger={
                  <button
                    aria-label={t('editor.award.icon')}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary"
                    style={{ color: accent }}
                  >
                    <Ico name={a.icon ?? 'medal'} size={ICON.row} />
                  </button>
                }
              />
              <input
                value={a.name}
                aria-label={t('editor.awardName')}
                onChange={(e) =>
                  patchAward(i, { name: e.target.value.slice(0, NAME_MAX.award[lang]) })
                }
                className="min-w-0 flex-1 rounded-lg bg-surface-secondary px-2 py-1.5 text-sm outline-none"
              />
              <input
                type="number"
                min={1}
                value={a.need}
                aria-label={t('editor.award.needLabel')}
                onChange={(e) => patchAward(i, { need: Math.max(1, Number(e.target.value) || 1) })}
                className="w-16 rounded-lg bg-surface-secondary px-2 py-1.5 text-sm outline-none"
              />
              <button
                onClick={() => set({ awards: awards.filter((_, j) => j !== i) })}
                aria-label={t('action.delete')}
                className="tap px-1 text-muted"
              >
                <Ico name="trash" size={ICON.row} />
              </button>
            </div>
          ))}
          {awards.length < AWARD_MAX.basic && (
            <Button size="sm" variant="ghost" onPress={() => set(addAward(awards, t))}>
              <span className="flex items-center gap-1">
                <Ico name="plus" size={ICON.chip} />
                {t('editor.award.add')}
              </span>
            </Button>
          )}
        </div>
      </Section>

      <Disclosure className="rounded-2xl bg-surface-secondary/50">
        <Disclosure.Heading>
          <Disclosure.Trigger className="tap flex w-full items-center gap-2 p-3 text-left">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{t('editor.advanced')}</span>
              <span className="mt-0.5 block text-xs text-muted">{t('editor.advanced.hint')}</span>
            </span>
            <Disclosure.Indicator>
              <Ico name="down" size={ICON.row} />
            </Disclosure.Indicator>
          </Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body className="space-y-4 px-3 pb-3">
            <Field title={t('editor.field.attrs')}>
              <div className="mb-2 text-xs leading-relaxed text-muted">{t('editor.attrs.hint')}</div>
              <AttrTable doc={doc} onChange={set} />
            </Field>

            {awards.length > 0 && (
              <Field title={t('editor.field.awards')}>
                <div className="space-y-2">
                  {awards.map((a, i) => (
                    <div key={a.id} className="rounded-xl bg-surface p-2">
                      <div className="mb-1.5 flex items-center gap-1.5 text-xs">
                        <Ico name={a.icon ?? 'medal'} size={ICON.chip} style={{ color: accent }} />
                        <span className="min-w-0 flex-1 truncate">{a.name}</span>
                        <span className="shrink-0 text-muted">
                          {t('editor.award.need', { n: a.need })}
                        </span>
                      </div>
                      <textarea
                        value={a.desc ?? ''}
                        rows={2}
                        aria-label={t('editor.award.desc')}
                        placeholder={t('editor.award.desc')}
                        onChange={(e) =>
                          patchAward(i, { desc: e.target.value.slice(0, DESC_MAX[lang]) || undefined })
                        }
                        className="w-full resize-none rounded-lg bg-surface-secondary px-2 py-1.5 text-sm outline-none"
                      />
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Field title={t('editor.award.shape')}>
                          <Seg
                            items={SHAPE_ITEMS(t)}
                            value={a.shape ?? 'hex'}
                            accent={accent}
                            onPick={(shape) => patchAward(i, { shape })}
                          />
                        </Field>
                        <Field title={t('editor.award.tier')}>
                          <Seg
                            items={TIER_ITEMS(t)}
                            value={a.tier ?? 'auto'}
                            accent={accent}
                            onPick={(tier) =>
                              patchAward(i, { tier: tier === 'auto' ? undefined : tier })
                            }
                          />
                        </Field>
                      </div>
                      <div className="mt-1.5">
                        {a.when === undefined ? (
                          <button
                            className="tap text-xs text-muted"
                            onClick={() => patchAward(i, { when: { all: [] }, gem: undefined })}
                          >
                            ＋ {t('editor.award.addCond')}
                          </button>
                        ) : (
                          <CondBuilder
                            doc={doc}
                            when={a.when}
                            label={t('editor.award.cond')}
                            onChange={(when) => patchAward(i, { when, gem: when ? undefined : a.gem })}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {awards.length < AWARD_MAX.total && (
                  <Button size="sm" variant="ghost" className="mt-2" onPress={() => set(addAward(awards, t))}>
                    <span className="flex items-center gap-1">
                      <Ico name="plus" size={ICON.chip} />
                      {t('editor.award.add')}
                    </span>
                  </Button>
                )}
                <div className="mt-1.5 text-xs leading-relaxed text-muted">
                  {t('editor.award.descHint')}
                </div>
              </Field>
            )}
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  )
}

function addAward(awards: readonly Award[], t: AppT): Partial<SkillTreeDoc> {
  return {
    awards: [
      ...awards,
      {
        id: newNodeId('aw'),
        name: t('editor.awardDefault'),
        icon: 'medal',
        need: (awards.at(-1)?.need ?? 0) + 4,
        gem: 5,
      },
    ],
  }
}

const SHAPE_ITEMS = (t: AppT) =>
  MEDAL_SHAPES.map((s) => [s, t(`award.shape.${s}` as AppKey)] as const)
const TIER_ITEMS = (t: AppT) => [
  ['auto', t('editor.award.tierAuto')] as const,
  ...MEDAL_TIERS.map((x) => [x, t(`award.tier.${x}` as AppKey)] as const),
]
