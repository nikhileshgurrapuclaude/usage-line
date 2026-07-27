#!/usr/bin/env node
// Runs on every SessionStart. Keeps ~/.claude/settings.json pointed at THIS
// plugin's statusline.js.
//
// Why this needs to re-check every time (not just write once):
// Claude Code copies plugins into a new cache directory on every update, so
// ${CLAUDE_PLUGIN_ROOT} changes across versions. If we only wrote the path
// once, an update would silently leave settings.json pointing at the old,
// now-stale cached copy of the script. Instead we recognize our own prior
// entry (by filename) and refresh it — while leaving alone anything that
// looks like a developer's own custom status line.

const fs = require("fs");
const os = require("os");
const path = require("path");

const settingsPath = path.join(os.homedir(), ".claude", "settings.json");
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
const statuslineScript = path.join(pluginRoot, "scripts", "statusline.js");
const desiredCommand = `node "${statuslineScript}"`;

// Anything ending in this counts as "ours" regardless of which cached
// version directory it points into.
const OWNED_SUFFIX = path.join("scripts", "statusline.js");

function main() {
  let settings = {};
  let raw = null;

  try {
    raw = fs.readFileSync(settingsPath, "utf8");
  } catch (e) {
    // No settings file yet — fine, we'll create one.
  }

  if (raw) {
    try {
      settings = JSON.parse(raw);
    } catch (e) {
      // Malformed JSON — never touch a file we can't safely parse.
      return;
    }
  }

  const existing = settings.statusLine && settings.statusLine.command;

  // Use includes() rather than endsWith(): the stored command is wrapped in
  // quotes (node "path/to/script.js"), so a plain suffix match against the
  // unquoted OWNED_SUFFIX would never hit.
  const isOurs = !existing || existing.includes(OWNED_SUFFIX);
  const alreadyCurrent = existing === desiredCommand;

  if (!isOurs || alreadyCurrent) {
    // Either a developer's own custom status line (leave it alone), or
    // already pointing at the current version (nothing to do).
    return;
  }

  settings.statusLine = {
    type: "command",
    command: desiredCommand,
  };

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
}

try {
  main();
} catch (e) {
  // Never let setup failures block a session from starting.
}
