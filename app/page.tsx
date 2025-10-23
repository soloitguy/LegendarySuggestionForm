"use client"
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { ENCHANTS } from '@/data/enchants'
import { SHORTCODES } from '@/data/shortcodes'

type EnchantPick = { name: string; percent: number }

export default function Page() {
  const [itemName, setItemName] = useState('')
  const [shortcode, setShortcode] = useState(SHORTCODES[0]?.code || '')
  const [enchants, setEnchants] = useState<EnchantPick[]>([{ name: '', percent: 0 }])
  const [skinUrl, setSkinUrl] = useState('')
  const [skinImage, setSkinImage] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [list, setList] = useState<any[]>([])

  const enchOptions = useMemo(() => ENCHANTS.map(e => e.name), [])

  async function refreshList() {
    const res = await fetch('/api/suggestions', { cache: 'no-store' })
    const data = await res.json()
    setList(data)
  }

  useEffect(() => { refreshList() }, [])

  async function lookupSkin() {
    setSkinImage(undefined)
    if (!skinUrl) return
    try {
      const res = await fetch(`/api/skin-preview?url=${encodeURIComponent(skinUrl)}`)
      if (!res.ok) return
      const { image } = await res.json()
      setSkinImage(image)
    } catch {}
  }

  function setEnchant(index: number, patch: Partial<EnchantPick>) {
    setEnchants(prev => prev.map((e, i) => i === index ? { ...e, ...patch } : e))
  }

  function addEnchant() {
    setEnchants(prev => prev.length >= 3 ? prev : [...prev, { name: '', percent: 0 }])
  }

  function removeEnchant(i: number) { setEnchants(prev => prev.filter((_, idx) => idx !== i)) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validate required fields
    if (!skinUrl.trim()) {
      alert('Steam Workshop link is required')
      return
    }
    
    setSaving(true)
    try {
      const body = {
        itemName: itemName.trim(),
        itemShortcode: shortcode,
        enchants: enchants.filter(e => e.name),
        skinUrl: skinUrl.trim(),
        skinImage
      }
      const res = await fetch('/api/suggestions', { method: 'POST', body: JSON.stringify(body) })
      if (res.ok) {
        setItemName('')
        setEnchants([{ name: '', percent: 0 }])
        setSkinUrl('')
        setSkinImage(undefined)
        await refreshList()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <form onSubmit={submit} className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div className="field">
            <label>Item Name</label>
            <input value={itemName} onChange={e=>setItemName(e.target.value)} placeholder="e.g. Toxic AK of the Dead" required />
          </div>

          <div className="field">
            <label>Item ShortCode</label>
            <select value={shortcode} onChange={e=>setShortcode(e.target.value)}>
              {SHORTCODES.map(s => (
                <option key={s.code} value={s.code}>{s.label} — {s.code}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Enchantments (up to 3)</label>
            <div style={{ display: 'grid', gap: 8 }}>
              {enchants.map((en, idx) => (
                <div key={idx} className="ench-row">
                  <select
                    value={en.name}
                    onChange={e=>setEnchant(idx, { name: e.target.value })}
                  >
                    <option value="">Select enchant…</option>
                    {enchOptions.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <input type="number" min={0} max={100} value={en.percent}
                         onChange={e=>setEnchant(idx, { percent: Number(e.target.value) })}
                         placeholder="Percent" />
                  <button type="button" className="btn" onClick={()=>removeEnchant(idx)} aria-label="Remove enchant">✕</button>
                </div>
              ))}
              <div>
                <button type="button" className="btn" onClick={addEnchant} disabled={enchants.length>=3}>+ Add Enchant</button>
                <span className="small" style={{ marginLeft: 8 }}>
                  Pick unique enchants. Values are 0–100%.
                </span>
              </div>
            </div>
          </div>

          <div className="row" style={{ justifyContent: 'flex-start', gap: 12 }}>
            <button className="btn" disabled={saving}>
              {saving ? 'Submitting…' : 'Submit Suggestion'}
            </button>
            <span className="small">Stored locally in memory (no Discord yet).</span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div className="field">
            <label>Link to Skin (Steam Workshop) *</label>
            <input value={skinUrl} onChange={e=>setSkinUrl(e.target.value)} onBlur={lookupSkin}
                   placeholder="https://steamcommunity.com/sharedfiles/filedetails/?id=…" required />
            <span className="small">We try to pull the preview image via OpenGraph.</span>
          </div>
          <div className="preview">
            {skinImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={skinImage} alt="Skin preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="small">Skin preview</span>
            )}
          </div>
        </div>
      </form>

      <div className="list">
        {list.map(item => (
          <div key={item.id} className="card" style={{ padding: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700 }}>{item.itemName} <span className="pill">{item.itemShortcode}</span></div>
              <div className="small">{new Date(item.createdAt).toLocaleString()}</div>
            </div>
            {item.skinImage && (
              <div className="row" style={{ marginTop: 8, gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.skinImage} alt="Skin" width={72} height={72} style={{ borderRadius: 8, border: '1px solid #26302b' }} />
                <a href={item.skinUrl} target="_blank" rel="noreferrer" className="small">Skin Link</a>
              </div>
            )}
            <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {item.enchants?.map((e: EnchantPick, i: number) => (
                <span key={i} className="pill">{e.name} {e.percent}%</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

