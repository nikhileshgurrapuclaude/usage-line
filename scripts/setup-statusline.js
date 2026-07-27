#!/usr/bin/env node
// Runs on every SessionStart. Writes a statusLine entry into the user's
// ~/.claude/settings.json only if one isn't already configured — so it
// never clobbers a developer's own custom status line, and only ever
// writes once per machine.

const fs = require('fs');
const os = require('os');
const path = require('path');

const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
const statuslineScript = path.join(pluginRoot, 'scripts', 'statusline.js');

function main() {
  let settings = {};
  let raw = null;

  try {
    raw = fs.readFileSync(settingsPath, 'utf8');
  } catch (e) {
    // No settings file yet — that's fine, we'll create one.
  }

  if (raw) {
    try {
      settings = JSON.parse(raw);
    } catch (e) {
      // Existing file is malformed JSON — don't touch it, bail out silently.
      // We never want a hook to corrupt a developer's settings.
      return;
    }
  }

  // Already configured (by us or by the developer) — leave it alone.
  if (settings.statusLine && settings.statusLine.command) {
    return;
  }

  settings.statusLine = {
    type: 'command',
    command: `node "${statuslineScript}"`
  };

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

try {
  main();
} catch (e) {
  // Never let setup failures block a session from starting.
}
