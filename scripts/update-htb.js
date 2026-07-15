import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const S3 = 'https://htb-mp-prod-public-storage.s3.eu-central-1.amazonaws.com';

const HTB_TOKEN = process.env.HTB_TOKEN;
const HTB_USER_ID = process.env.HTB_USER_ID;

if (!HTB_TOKEN || !HTB_USER_ID) {
  console.error('CRITICAL: Missing HTB_TOKEN or HTB_USER_ID environment variables.');
  process.exit(1);
}

// Retries with exponential backoff for rate limits and network issues
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 429) {
        const retryAfter = res.headers.get('retry-after') || 2;
        console.warn(`[HTTP 429] Rate limited. Retrying after ${retryAfter}s... (${url})`);
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        continue;
      }
      console.warn(`[HTTP ${res.status}] on ${url}`);
      return null;
    } catch (e) {
      console.warn(`[Network Error] ${e.message} on ${url}. Retrying...`);
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

function htbGet(apiPath) {
  const url = `https://labs.hackthebox.com${apiPath}`;
  return fetchWithRetry(url, {
    headers: {
      'Authorization': `Bearer ${HTB_TOKEN}`,
      'User-Agent': 'Portfolio',
      'Accept': 'application/json',
    }
  });
}

function resolveAvatar(raw) {
  if (!raw) return null;
  if (typeof raw === 'string' && raw.trim().startsWith('<')) return null;
  if (raw.includes('svg+xml') || raw.toLowerCase().endsWith('.svg')) return null;

  if (raw.includes('labs.hackthebox.com/avatars/')) {
    const filename = raw.split('/avatars/').pop().replace('_thumb', '');
    return filename ? `${S3}/avatars/${filename}` : null;
  }
  if (raw.startsWith('http')) return raw.includes('.svg') ? null : raw;

  if (raw.startsWith('/avatars/')) {
    const filename = raw.split('/avatars/').pop().replace('_thumb', '');
    return filename ? `${S3}/avatars/${filename}` : null;
  }

  if (raw.startsWith('/storage/avatars/'))
    return `${S3}/avatars/${raw.slice('/storage/avatars/'.length)}`;
  if (raw.startsWith('/storage/challenges/'))
    return `${S3}/challenges/${raw.slice('/storage/challenges/'.length)}`;
  if (raw.startsWith('/storage/sherlocks/'))
    return `${S3}/challenges/${raw.slice('/storage/sherlocks/'.length)}`;

  const url = `https://labs.hackthebox.com${raw}`;
  return url.toLowerCase().includes('.svg') ? null : url;
}

function findDate(item) {
  if (!item) return null;
  const fields = ['date', 'created_at', 'solved_at', 'time', 'timestamp', 'owned_at', 'date_solved', 'own_date', 'completed_at', 'own_time'];
  for (const f of fields) {
    if (item[f]) return new Date(item[f]).toISOString();
  }
  return null;
}

async function fetchMachineData(name) {
  const search = await htbGet(`/api/v4/machine/search?value=${encodeURIComponent(name)}`);
  const list = search?.data || [];
  const match = list.find(m => m.name && m.name.toLowerCase() === name.toLowerCase());
  
  if (match) {
    const url = resolveAvatar(match.avatar || match.avatar_thumb || null);
    const diff = match.difficultyText || match.difficulty_text || match.difficulty || null;
    if (url || diff) return { avatar: url, difficulty: diff };
  }
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const profile = await htbGet(`/api/v4/machine/profile/${encodeURIComponent(slug)}`);
  const info = profile?.info || profile?.data || profile;
  
  if (info && typeof info === 'object') {
    const url = resolveAvatar(info.avatar || info.avatar_thumb || null);
    const diff = info.difficultyText || info.difficulty_text || info.difficulty || null;
    return { avatar: url, difficulty: diff };
  }
  return { avatar: null, difficulty: null };
}

async function fetchSherlockAvatar(name) {
  const data = await htbGet(`/api/v4/sherlocks?search=${encodeURIComponent(name)}`);
  const list = data?.data || [];
  const match = list.find(m => m.name && m.name.toLowerCase() === name.toLowerCase());
  return resolveAvatar(match?.avatar || match?.avatar_thumb || null);
}

async function fetchChallengeAvatar(name) {
  const data = await htbGet(`/api/v4/challenge/list`);
  const list = data?.challenges || data?.data || [];
  const match = list.find(m => m.name && m.name.toLowerCase() === name.toLowerCase());
  return resolveAvatar(match?.avatar || match?.avatar_thumb || null);
}

// Concurrency helper
async function mapConcurrent(items, fn, limit) {
  const results = [];
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

async function main() {
  const OUTPUT_FILE = path.join(process.cwd(), 'public', 'htb-activity.json');
  
  let existingActivitiesMap = new Map();
  if (existsSync(OUTPUT_FILE)) {
    try {
      const old = JSON.parse(await fs.readFile(OUTPUT_FILE, 'utf8'));
      if (Array.isArray(old.activities)) {
        for (const a of old.activities) {
          existingActivitiesMap.set(`${a.type}:${a.name}`, a);
        }
      }
    } catch (e) {
      console.log('Failed to parse existing htb-activity.json', e.message);
    }
  }

  const activitiesMap = new Map(existingActivitiesMap);

  console.log('Fetching Activity Feed...');
  const rawActivity = await htbGet(`/api/v5/user/profile/activity/${HTB_USER_ID}`);
  if (!rawActivity) {
    console.error('Failed to fetch Activity API');
  } else {
    const activityItems = rawActivity.profile?.activity || rawActivity.data?.activity || rawActivity.activity || rawActivity.data || [];
    
    const ACTION_LABEL = {
      'root': 'Owned Root', 'user': 'Owned User', 'solve': 'Solved',
      'challenge': 'Solved', 'sherlock': 'Solved', 'Owned Root': 'Owned Root',
      'Owned User': 'Owned User', 'Solved': 'Solved',
    };
    const ACTION_RANK = { 'Owned Root': 3, 'root': 3, 'Solved': 2, 'solve': 2, 'challenge': 2, 'sherlock': 2, 'Owned User': 1, 'user': 1 };

    const best = new Map();
    for (const item of activityItems) {
      let objType = item.object_type || item.type_name || item.type || 'machine';
      if (objType === 'root' || objType === 'user') objType = 'machine';
      const key = `${objType}:${item.name}`;
      const rank = ACTION_RANK[item.type] ?? 0;
      if (!best.has(key) || rank > best.get(key).rank) {
        best.set(key, { rank, item, objType });
      }
    }

    for (const [key, { item, objType }] of best.entries()) {
      const existing = activitiesMap.get(key) || {};
      const apiDate = findDate(item);
      // Skip relative dates from activity feed if we have a real date
      const isRelativeDate = typeof item.date === 'string' && item.date.includes('ago');
      const finalDate = (isRelativeDate ? existing.date : apiDate) ?? existing.date ?? new Date().toISOString();
      
      activitiesMap.set(key, {
        name: item.name,
        type: objType,
        action: ACTION_LABEL[item.type] ?? item.type ?? existing.action ?? 'Completed',
        difficulty: item.difficulty ?? existing.difficulty ?? null,
        category: item.challenge_category ?? item.category ?? existing.category ?? null,
        date: finalDate,
        points: item.points ?? existing.points ?? 0,
        avatar: resolveAvatar(item.machine_avatar || item.sherlock_avatar || item.avatar || item.challenge_avatar || existing.avatar || null),
      });
    }
  }

  console.log('Fetching Machines...');
  const machinePaths = [
    `/api/v5/user/profile/machine/owns/${HTB_USER_ID}`,
    `/api/v4/user/profile/machine/owns/${HTB_USER_ID}`,
    `/api/v4/user/profile/${HTB_USER_ID}/machine/owns`
  ];
  let rawMachines = null;
  for (const p of machinePaths) {
    rawMachines = await htbGet(p);
    if (rawMachines && (rawMachines.profile || rawMachines.data || rawMachines.machine_owns)) break;
  }
  
  if (rawMachines) {
    const solved = rawMachines?.profile?.machine_owns || rawMachines?.data || rawMachines?.machine_owns || [];
    for (const m of solved) {
      const key = `machine:${m.name}`;
      const existing = activitiesMap.get(key) || {};
      const apiDate = findDate(m);
      activitiesMap.set(key, {
        name: m.name,
        type: 'machine',
        action: 'Owned Root', // Par défaut
        difficulty: m.difficulty ?? existing.difficulty ?? null,
        category: m.os ?? existing.category ?? null,
        date: apiDate ?? existing.date ?? new Date().toISOString(),
        points: m.points ?? existing.points ?? 0,
        avatar: resolveAvatar(m.avatar || m.avatar_thumb || existing.avatar || null),
      });
    }
  }

  console.log('Fetching Challenges...');
  let rawChallenges = await htbGet(`/api/v5/user/profile/challenges/solved/${HTB_USER_ID}`);
  if (!rawChallenges) rawChallenges = await htbGet(`/api/v5/user/profile/${HTB_USER_ID}/challenges/solved`);
  
  if (rawChallenges) {
    const solved = rawChallenges?.profile?.challenge_owns || rawChallenges?.data || rawChallenges?.challenges || [];
    for (const ch of solved) {
      const key = `challenge:${ch.name}`;
      const existing = activitiesMap.get(key) || {};
      const apiDate = findDate(ch);
      activitiesMap.set(key, {
        name: ch.name,
        type: 'challenge',
        action: 'Solved',
        difficulty: ch.difficulty ?? existing.difficulty ?? null,
        category: ch.category_name ?? ch.category ?? existing.category ?? null,
        date: apiDate ?? existing.date ?? new Date().toISOString(),
        points: ch.points ?? existing.points ?? 0,
        avatar: resolveAvatar(ch.avatar || ch.avatar_thumb || existing.avatar || null),
      });
    }
  }

  console.log('Fetching Sherlocks...');
  const sherlockPaths = [
    `/api/v5/user/profile/sherlocks/solved/${HTB_USER_ID}`,
    `/api/v5/user/profile/${HTB_USER_ID}/sherlocks/solved`,
    `/api/v5/user/profile/${HTB_USER_ID}/sherlocks`,
    `/api/v4/user/profile/${HTB_USER_ID}/sherlocks/solved`,
    `/api/v4/profile/${HTB_USER_ID}/sherlocks/solved`
  ];
  let rawSherlocks = null;
  for (const spath of sherlockPaths) {
    rawSherlocks = await htbGet(spath);
    if (rawSherlocks && (rawSherlocks.profile || rawSherlocks.data || rawSherlocks.sherlocks)) break;
  }

  if (rawSherlocks) {
    const solved = rawSherlocks?.profile?.sherlock_owns || rawSherlocks?.data || rawSherlocks?.sherlocks || [];
    for (const sh of solved) {
      const key = `sherlock:${sh.name}`;
      const existing = activitiesMap.get(key) || {};
      const apiDate = findDate(sh);
      activitiesMap.set(key, {
        name: sh.name,
        type: 'sherlock',
        action: 'Solved',
        difficulty: sh.difficulty ?? existing.difficulty ?? null,
        category: sh.category_name ?? sh.category ?? existing.category ?? null,
        date: apiDate ?? existing.date ?? new Date().toISOString(),
        points: sh.points ?? existing.points ?? 0,
        avatar: resolveAvatar(sh.avatar || sh.avatar_thumb || sh.image || existing.avatar || null),
      });
    }
  }

  const activities = Array.from(activitiesMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).reverse();

  console.log('Enriching missing avatars...');
  const missing = activities.filter(a => 
    !a.avatar || a.avatar.includes('labs.hackthebox.com') || (a.type === 'machine' && !a.difficulty)
  );
  
  console.log(`Need to enrich ${missing.length} items`);
  
  await mapConcurrent(missing, async (act) => {
    try {
      if (act.type === 'machine') {
        const data = await fetchMachineData(act.name);
        act.avatar = data.avatar || act.avatar;
        if (data.difficulty && !act.difficulty) act.difficulty = data.difficulty;
      } else if (act.type === 'sherlock') {
        act.avatar = await fetchSherlockAvatar(act.name) || act.avatar;
      } else if (act.type === 'challenge') {
        act.avatar = await fetchChallengeAvatar(act.name) || act.avatar;
      }
      console.log(`Enriched ${act.name} (${act.type}): ${act.avatar ? 'OK' : 'MISSING'}`);
    } catch (e) {
      console.warn(`Failed to enrich ${act.name}: ${e.message}`);
    }
  }, 3); // 3 concurrent requests maximum

  console.log('Fetching Profile Stats...');
  let stats = null;
  const rawProfile = await htbGet(`/api/v4/user/profile/basic/${HTB_USER_ID}`);
  if (rawProfile) {
    const p = rawProfile.profile ?? rawProfile.data ?? rawProfile ?? {};
    stats = {
      name: p.name ?? null,
      rank: p.ranking ?? null,
      rank_text: p.rank ?? null,
      points: p.points ?? 0,
      root_owns: p.root_owns ?? 0,
      user_owns: p.user_owns ?? 0,
      challenge_owns: p.challenge_owns ?? 0,
      sherlock_owns: p.sheriff_owns ?? p.sherlock_owns ?? 0,
      respects: p.respects ?? 0,
      avatar: resolveAvatar(p.avatar),
    };
  }

  const result = { stats, activities, updated_at: new Date().toISOString() };
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`Saved ${activities.length} activities | stats: ${!!stats}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
