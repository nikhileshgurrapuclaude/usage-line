#!/usr/bin/env node
// Claude Code pipes session JSON to this script on stdin every time the
// status line refreshes (new message, /compact, mode change, etc).
// Runs locally — no API tokens consumed.

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    console.log('');
    return;
  }

  const RESET = '\x1b[0m';
  const GREEN = '\x1b[32m';
  const YELLOW = '\x1b[33m';
  const RED = '\x1b[31m';
  const CYAN = '\x1b[36m';

  const model = data.model?.display_name || '?';
  const pct = Math.floor(data.context_window?.used_percentage ?? 0);
  const cost = data.cost?.total_cost_usd ?? 0;
  const fiveH = data.rate_limits?.five_hour?.used_percentage;
  const week = data.rate_limits?.seven_day?.used_percentage;

  // Context usage progress bar, color-coded
  const barWidth = 10;
  const filled = Math.floor((pct * barWidth) / 100);
  const bar = '▓'.repeat(filled) + '░'.repeat(barWidth - filled);
  const barColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;

  let line = `${CYAN}[${model}]${RESET} ${barColor}${bar}${RESET} ${pct}% ctx | $${cost.toFixed(2)}`;

  const limitParts = [];
  if (fiveH != null) {
    const color = fiveH >= 90 ? RED : fiveH >= 70 ? YELLOW : GREEN;
    limitParts.push(`${color}5h:${Math.round(fiveH)}%${RESET}`);
  }
  if (week != null) {
    const color = week >= 90 ? RED : week >= 70 ? YELLOW : GREEN;
    limitParts.push(`${color}7d:${Math.round(week)}%${RESET}`);
  }
  if (limitParts.length) {
    line += ` | ${limitParts.join(' ')}`;
  }

  console.log(line);
});
