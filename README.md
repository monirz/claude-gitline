# claude-gitline

`gitline` is a Claude Code mod that shows your current folder and git branch above the prompt, starship style.

```
cloudrig on  fn-storage-emulator-host [?]
```

Flags: `?` untracked, `!` modified, `+` staged, `»` renamed, `✘` deleted.
The line refreshes after each Claude turn and every 5 seconds.

## Requirements

- Claude Code
- git
- A Nerd Font (or Powerline font) for the branch icon

## Install

```bash
claude plugin marketplace add monirz/claude-gitline
claude plugin install gitline@gitline
```

Start a new `claude` session in any git repo and the line appears above the prompt.

## Update

```bash
claude plugin marketplace update gitline
claude plugin update gitline@gitline
```

Restart Claude Code to apply.

## Uninstall

```bash
claude plugin uninstall gitline@gitline
```

## Colors

The defaults come from the Nord palette. To change them, fork the repo and edit the hex values in `hooks/register.js`:

| Part | Default |
| --- | --- |
| Folder name | `#8FBCBB` |
| Branch | `#B48EAD` |
| Flags | `#BF616A` |

## License

MIT
