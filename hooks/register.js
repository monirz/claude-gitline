// gitline mod: shows "<folder> on  <branch> [flags]" above the prompt.
// Flags (starship style): ? untracked, ! modified, + staged, ✘ deleted, » renamed

const BRANCH_ICON = '\uE0A0' // needs a Nerd Font / Powerline font, same as your prompt

let state = { name: '', branch: '', flags: '' }

// Run a git command and return raw stdout, or '' on any failure
async function git($, dir, args) {
  const cmd = dir ? ['git', '-C', dir, ...args] : ['git', ...args]
  try {
    const r = await $.process.run(cmd)
    return r.exitCode === 0 ? r.stdout : ''
  } catch {
    return ''
  }
}

// Turn `git status --porcelain` output into a string of flag symbols
function flagsOf(porcelain) {
  let untracked = false
  let modified = false
  let staged = false
  let deleted = false
  let renamed = false

  for (const row of porcelain.split('\n')) {
    if (!row) continue
    if (row.startsWith('??')) {
      untracked = true
      continue
    }
    const x = row[0] // index (staged) column
    const y = row[1] // working tree column
    if (x !== ' ') staged = true
    if (y === 'M') modified = true
    if (x === 'D' || y === 'D') deleted = true
    if (x === 'R') renamed = true
  }

  return (
    (untracked ? '?' : '') +
    (modified ? '!' : '') +
    (staged ? '+' : '') +
    (renamed ? '»' : '') +
    (deleted ? '✘' : '')
  )
}

// Work out what to show
async function compute($) {
  let dir = ''
  try {
    dir = await $.session.cwd()
  } catch {
    dir = ''
  }
  const name = String(dir || '').split('/').filter(Boolean).pop() || ''

  let branch = (await git($, dir, ['branch', '--show-current'])).trim()
  if (!branch) branch = (await git($, dir, ['rev-parse', '--short', 'HEAD'])).trim()
  if (!branch) return { name, branch: '', flags: '' } // not a git repo

  const flags = flagsOf(await git($, dir, ['status', '--porcelain']))
  return { name, branch, flags }
}

// Recompute, and redraw only if something changed
async function refresh($) {
  const next = await compute($)
  if (JSON.stringify(next) !== JSON.stringify(state)) {
    state = next
    $.ui.invalidate('ui.render')
  }
}

export function register(on) {
  on('session.start', async ($, e, next) => {
    await refresh($)
    // Also re-check every 5s, to catch changes made in another terminal
    $.clock.every(5000, () => refresh($))
    return next(e)
  })

  // Claude may run git commands, so re-check when a turn ends
  on('turn.complete', async ($, e, next) => {
    await refresh($)
    return next(e)
  })

  // Draw the line in the band above the prompt
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!state.name) return next(e)
    const { Box, Text } = $.ui.resolve(e)

    const parts = [Text({ children: [state.name], color: '#8FBCBB', bold: true })]
    if (state.branch) {
      parts.push(Text({ children: [' on '] }))
      parts.push(Text({ children: [BRANCH_ICON + ' ' + state.branch], color: '#B48EAD', bold: true }))
      if (state.flags) {
        parts.push(Text({ children: [' [' + state.flags + ']'], color: '#BF616A', bold: true }))
      }
    }

    return Box({
      flexDirection: 'column',
      children: [Box({ flexDirection: 'row', children: parts }), await next(e)],
    })
  })
}