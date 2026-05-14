// Next.js API Route — 奇门遁甲排盘
import { calculateQimen } from '../qimen_engine';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      name: '奇门遁甲排盘 API',
      version: '1.0',
      usage: 'POST /api/qimen { datetime: "YYYY-MM-DD HH:MM", type: "event"|"birth" }'
    });
  }

  if (req.method === 'POST') {
    const { datetime, type } = req.body;
    if (!datetime) {
      return res.status(400).json({ success: false, error: 'datetime is required' });
    }
    try {
      const result = calculateQimen(datetime, type || 'event');
      return res.status(200).json({ success: true, data: result });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
