const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getOldestDate(date1, date2) {
  if (!date1) return date2;
  if (!date2) return date1;
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  if (isNaN(d1)) return date2;
  if (isNaN(d2)) return date1;
  return d1 < d2 ? date1 : date2;
}

const activitiesMap = new Map();

try {
  const commits = execSync('git log --pretty=format:"%h" public/htb-activity.json', { encoding: 'utf8' }).trim().split('\n');
  console.log(`Found ${commits.length} commits for htb-activity.json`);

  for (const commit of commits) {
    if (!commit) continue;
    try {
      const content = execSync(`git show ${commit}:public/htb-activity.json`, { encoding: 'utf8' });
      const data = JSON.parse(content);
      if (data.activities && Array.isArray(data.activities)) {
        for (const act of data.activities) {
          const key = `${act.type}:${act.name}`;
          const existing = activitiesMap.get(key);
          if (!existing) {
            activitiesMap.set(key, act);
          } else {
            // Merge: keep oldest date, keep other fields if missing
            const oldestDate = getOldestDate(existing.date, act.date);
            activitiesMap.set(key, {
              ...existing,
              ...act,
              date: oldestDate,
              action: act.action || existing.action,
              points: act.points || existing.points || 0,
              avatar: existing.avatar || act.avatar
            });
          }
        }
      }
    } catch (err) {
      // Ignore parse errors for older commits
    }
  }

  // Load current file to preserve stats
  const currentPath = path.join(process.cwd(), 'public/htb-activity.json');
  let currentStats = null;
  if (fs.existsSync(currentPath)) {
    const current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
    currentStats = current.stats;
  }

  const mergedActivities = Array.from(activitiesMap.values()).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const finalJson = {
    stats: currentStats,
    activities: mergedActivities,
    updated_at: new Date().toISOString()
  };

  fs.writeFileSync(currentPath, JSON.stringify(finalJson, null, 2));
  console.log(`Successfully merged ${mergedActivities.length} total activities from git history!`);
  
  const counts = {
    machine: mergedActivities.filter(a => a.type === 'machine').length,
    challenge: mergedActivities.filter(a => a.type === 'challenge').length,
    sherlock: mergedActivities.filter(a => a.type === 'sherlock').length,
  };
  console.log(`Machines: ${counts.machine}, Challenges: ${counts.challenge}, Sherlocks: ${counts.sherlock}`);

} catch (e) {
  console.error("Error:", e);
}
