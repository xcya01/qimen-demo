import { useState, useEffect } from 'react'
import Head from 'next/head'
import '../styles/globals.css'

const JIXI_COLORS: Record<string, string> = {
  '吉': 'jx-ji',
  '凶': 'jx-xiong',
  '中': 'jx-zhong',
}

interface Palace {
  '宫': number
  '方位': string
  '方向': string
  '地支': string
  '天盘': string
  '地盘': string
  '神': string
  '星': string
  '星吉凶': string
  '星五行': string
  '门': string
  '门吉凶': string
  '门五行': string
  '五行': string
  '空亡': string
  '先天数': string
  '后天数': string
  '尾数': string
}

interface QimenResult {
  '四柱': { '年': string; '月': string; '日': string; '时': string }
  '局': { 'type': string; 'number': number; 'ju': number; 'yuan': string }
  '值符': { '星': string; '宫': number }
  '值使': { '门': string; '宫': number }
  '空亡': { '支1': string; '支2': string }
  '驿马': { '支': string; '宫': number }
  '宫位': Palace[]
  'datetime': string
}

const PALACE_NAMES: Record<number, string> = {
  1: '坎一宫', 2: '坤二宫', 3: '震三宫', 4: '巽四宫',
  5: '中五宫', 6: '乾六宫', 7: '兑七宫', 8: '艮八宫', 9: '离九宫'
}

export default function Home() {
  const [datetime, setDatetime] = useState(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })
  const [plateType, setPlateType] = useState('event')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QimenResult | null>(null)
  const [error, setError] = useState('')

  const calc = async () => {
    if (!datetime) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/qimen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datetime, type: plateType }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || '计算失败')
      }
    } catch (e: any) {
      setError(e.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  const palaces = result?.宫位 ?? []

  return (
    <>
      <Head>
        <title>奇门遁甲在线排盘 | AI 作品集</title>
        <meta name="description" content="奇门遁甲在线排盘 — 输入时间即可在线体验 AI 智能排盘" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>☰</text></svg>" />
      </Head>

      <div className="header">
        <h1><span>奇门遁甲</span>智能排盘</h1>
        <p>基于古代三式之一 · 在线体验 AI 快速起局</p>
      </div>

      <main className="main">
        {/* Form */}
        <div className="form-card">
          <div className="form-title">输入信息</div>
          <div className="form-row">
            <div className="form-group">
              <label>日期时间</label>
              <input
                type="datetime-local"
                value={datetime}
                onChange={e => setDatetime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>盘类型</label>
              <select value={plateType} onChange={e => setPlateType(e.target.value)}>
                <option value="event">事件奇门</option>
                <option value="birth">先天奇门</option>
              </select>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={calc} disabled={loading}>
              {loading && <span className="loading" />}
              {loading ? '排盘中...' : '起盘'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="form-card" style={{ color: '#dc2626', textAlign: 'center', padding: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="result-card">
            <div className="result-header">
              <h2>奇门遁甲 · {result.局.type}{result.局.number}局</h2>
              <div className="datetime">{result.datetime} · {result.plate_type === 'event' ? '事件奇门' : '先天奇门'}</div>
            </div>

            <div className="result-meta">
              <div className="meta-item">
                <div className="meta-label">四柱</div>
                <div className="meta-value">{result.四柱.年}</div>
                <div className="meta-value accent">{result.四柱.月} {result.四柱.日} {result.四柱.时}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">元</div>
                <div className="meta-value">{result.局.yuan}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">值符</div>
                <div className="meta-value">{result.值符.星}</div>
                <div className="meta-value accent">落{result.值符.宫}宫</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">值使</div>
                <div className="meta-value">{result.值使.门}</div>
                <div className="meta-value accent">落{result.值使.宫}宫</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">空亡</div>
                <div className="meta-value">{result.空亡.支1} {result.空亡.支2}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">驿马</div>
                <div className="meta-value">{result.驿马.支}</div>
                <div className="meta-value accent">{result.驿马.宫}宫</div>
              </div>
            </div>

            {/* 9 Palace Grid */}
            <div className="palace-grid">
              {/* Row 1: 4(巽) 5(中) 9(离) */}
              <PalaceCell palace={palaces.find(p => p['宫'] === 4)} />
              <CenterCell />
              <PalaceCell palace={palaces.find(p => p['宫'] === 9)} />

              {/* Row 2: 3(震) 6(乾) */}
              <PalaceCell palace={palaces.find(p => p['宫'] === 3)} />
              <PalaceCell palace={palaces.find(p => p['宫'] === 6)} />
              <PalaceCell palace={palaces.find(p => p['宫'] === 7)} />

              {/* Row 3: 8(艮) 2(坤) 1(坎) */}
              <PalaceCell palace={palaces.find(p => p['宫'] === 8)} />
              <PalaceCell palace={palaces.find(p => p['宫'] === 2)} />
              <PalaceCell palace={palaces.find(p => p['宫'] === 1)} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="result-card">
            <div className="empty-state">
              <div className="icon">☰</div>
              <p>输入日期时间，点击「起盘」即可生成奇门遁甲盘</p>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Powered by <a href="https://github.com/xcya01/qimen-demo" target="_blank" rel="noopener">Qimen Engine</a> · <a href="https://xcya01.github.io" target="_blank" rel="noopener">AI 作品集</a></p>
      </footer>
    </>
  )
}

function PalaceCell({ palace }: { palace?: Palace }) {
  if (!palace) return <div className="palace-cell" />
  const isKong = palace['空亡'] === '空亡'
  const starJx = JIXI_COLORS[palace['星吉凶']] || 'jx-zhong'
  const gateJx = JIXI_COLORS[palace['门吉凶']] || 'jx-zhong'

  return (
    <div className={`palace-cell${isKong ? ' kong-wang' : ''}`}>
      {isKong && <span className="kong-mark">空亡</span>}
      <div className="palace-num">{palace['宫']}宫</div>
      <div className="palace-name">{palace['方位']}</div>
      <div className="palace-dir">{palace['方向']} {palace['五行']}</div>
      <div className="tg-dz">
        天盘 <strong>{palace['天盘']}</strong> <span>地盘{palace['地盘']}</span>
      </div>
      <div className="tg-dz" style={{ fontSize: '0.8rem' }}>
        地支 <strong>{palace['地支']}</strong>
      </div>
      <div className="deity">神: {palace['神']}</div>
      <div className="star">
        星: <strong>{palace['星']}</strong>
        <span className={`jx ${starJx}`}>{palace['星吉凶']}</span>
      </div>
      <div className="gate">
        门: <strong>{palace['门']}</strong>
        <span className={`jx ${gateJx}`}>{palace['门吉凶']}</span>
      </div>
      <div className="nums">
        先:{palace['先天数']} 后:{palace['后天数']} 尾:{palace['尾数']}
      </div>
    </div>
  )
}

function CenterCell() {
  return (
    <div className="palace-cell center-cell">
      <div className="palace-num">中宫</div>
      <div className="center-info">
        <div className="title">寄坤二宫</div>
        <div className="desc">
          中宫无门，寄于坤二宫<br />
          禽星落此，辅四周
        </div>
      </div>
    </div>
  )
}
