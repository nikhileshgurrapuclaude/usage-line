# usage-line

Always-on Claude Code status line: model, context-window %, session cost, and
5h/7d rate-limit usage — color-coded, updates automatically after every
message. No `/usage` needed, no manual `settings.json` editing.

Runs entirely locally — it does not consume API tokens.

## How it works

A `SessionStart` hook runs once when Claude Code starts and writes a
`statusLine` entry into `~/.claude/settings.json` **only if one isn't already
configured** — so it never overwrites a developer's own custom status line,
and only ever touches the file once per machine.

## Option A — zero-setup for your team (recommended)

Check this plugin directly into your repo as a **project-scope
skills-directory plugin**. Every developer who clones the repo and accepts
the workspace trust prompt gets it automatically — no `/plugin install`, no
marketplace, nothing to run.

```bash
# From your repo root:
mkdir -p .claude/skills
cp -r usage-line .claude/skills/usage-line
git add .claude/skills/usage-line
git commit -m "Add always-on usage status line for the team"
```

That's it. The next time anyone opens the project in Claude Code and trusts
the workspace, the status line appears — permanently, across all their
projects even (since it writes to their user-level settings).

## Option B — distribute via your existing marketplace

Since you've already got `nikhilesh-plugins` set up:

1. Add this folder as a new plugin in that same marketplace repo (alongside
   `autonod`), and add an entry for it in your `marketplace.json`.
2. Developers run, once:
   ```
   /plugin install usage-line@nikhilesh-plugins
   ```

Either way, after the first session start you'll see something like:

```
[Sonnet] ▓▓▓▓░░░░░░ 42% ctx | $1.23 | 5h:55% 7d:81%
```

## Customizing

Edit `scripts/statusline.js` — it's a plain Node script reading the session
JSON Claude Code pipes to it on stdin (model, context_window, cost,
rate_limits, etc). No dependencies beyond Node itself, which every Claude
Code install already requires.

## Uninstalling

Remove the `statusLine` key from `~/.claude/settings.json`, or run
`claude plugin disable usage-line@skills-dir` (Option A) /
`claude plugin uninstall usage-line@nikhilesh-plugins` (Option B).
