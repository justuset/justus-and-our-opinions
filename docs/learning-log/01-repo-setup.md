# Learning log 01: Setting up the repo, the first commit and the README

**Date:** 2026-10-01 (updated 2026-10-02)
**Goal:** Get an empty GitHub repository ready to hold the project, with one committed file (`README.md`).

> **Want to do this yourself?** The full manual walkthrough, from installing Git to protected `main` with CI, is
> [`docs/guides/github-repo-from-scratch.md`](../guides/github-repo-from-scratch.md). This entry is the record of what
> happened in *this* repo.
>
> **Update 2026-10-02:** `main` now exists. It was created at this entry's first commit (`b0fa9f1`) so the work could
> be opened as [PR #1](https://github.com/justuset/justus-and-our-opinions/pull/1), and it's now the repo's default
> branch. See §4 and [learning log 22](22-first-pr-and-default-branch.md).

This entry records what was planned, what actually ran, and why the two differ. Read it alongside
[Git's own glossary](https://git-scm.com/docs/gitglossary) if any term is new.

---

## 1. The commands GitHub suggests for a new, empty repo

When you create a repository on GitHub with no files, it shows this "quick setup" block:

```bash
echo "# justus-and-our-opinions" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/justuset/justus-and-our-opinions.git
git push -u origin main
```

What each line does:

| # | Command | What it does | Concept to learn |
|---|---------|--------------|------------------|
| 1 | `echo "# justus-and-our-opinions" >> README.md` | Writes one Markdown heading into `README.md`. `>>` **appends** and creates the file if it doesn't exist. `>` would **overwrite** it instead. | Shell redirection |
| 2 | `git init` | Creates a hidden `.git/` folder, which turns the current folder into a repository. | Repository, working tree |
| 3 | `git add README.md` | Copies the file's current contents into the **staging area** (also called the index). | Working tree → staging area |
| 4 | `git commit -m "first commit"` | Saves everything staged as a permanent snapshot with a message, an author and a timestamp. | Commit, SHA hash |
| 5 | `git branch -M main` | Renames the current branch to `main`. `-M` forces the rename even if `main` already exists. | Branches are movable labels |
| 6 | `git remote add origin <url>` | Saves the GitHub URL under the nickname `origin`. | Remotes |
| 7 | `git push -u origin main` | Uploads the commits to GitHub. `-u` sets up **upstream tracking**, so later a plain `git push` or `git pull` knows where to go. | Upstream / tracking branch |

## 2. What was different in this environment

The work runs in a cloud Claude Code session. The repo had **already been cloned** into
`/home/user/justus-and-our-opinions`, so before running anything I checked its state:

```bash
git status --short   # nothing to show
git branch -a        # no branches listed yet
git remote -v        # origin already points at github.com/justuset/justus-and-our-opinions
ls -la               # only the .git folder
# → fatal: your current branch 'claude/wonderful-knuth-w43l2c' does not have any commits yet
```

That told me three things:

1. **`git init` was not needed.** `.git/` already existed. Running it again would have been harmless (it only
   "reinitializes"), but it would have done nothing.
2. **`git remote add origin` would have failed** with `error: remote origin already exists`.
3. **The session works on a feature branch, `claude/wonderful-knuth-w43l2c`, not on `main`.** The session's
   rules say to commit and push only to that branch. So `git branch -M main` and `git push -u origin main` were
   swapped for a push to the feature branch.

## 3. What actually ran

```bash
cd /home/user/justus-and-our-opinions
echo "# justus-and-our-opinions" >> README.md
git add README.md
git commit -m "first commit"            # plus two attribution "trailer" lines, see §5
git push -u origin claude/wonderful-knuth-w43l2c
```

Output of the push:

```
fatal: expected 'acknowledgments', received 'packfile'
warning: push negotiation failed; proceeding anyway with push
To https://github.com/justuset/justus-and-our-opinions
 * [new branch]      claude/wonderful-knuth-w43l2c -> claude/wonderful-knuth-w43l2c
branch 'claude/wonderful-knuth-w43l2c' set up to track 'origin/claude/wonderful-knuth-w43l2c'.
```

**About that scary-looking `fatal:` line.** Before uploading, Git tries an optional "push negotiation" step to
work out which objects the server already has. Here it failed: the session's network proxy answered in a
format Git didn't expect. Git then said "proceeding anyway" and sent everything. The next two lines confirm
the push worked: a `[new branch]` was created and tracking was set up. **Read the whole output before
deciding something failed.**

## 4. How we verified it

```bash
git log --oneline                  # b0fa9f1 first commit
git status -sb                     # ## claude/wonderful-knuth-w43l2c...origin/claude/wonderful-knuth-w43l2c
git ls-remote --heads origin       # b0fa9f1…  refs/heads/claude/wonderful-knuth-w43l2c
```

- `git status -sb` printing `branch...origin/branch` with no `[ahead 1]` means the local and remote branches match.
- `git ls-remote` asks GitHub directly. On 2026-10-01 it listed **only** the feature branch: **there was no `main`
  branch on GitHub.** And because that branch was the only one, GitHub made it the repo's **default** branch.
- **What happened next (2026-10-02):** to open a pull request, `main` was pushed on purpose at this first commit
  (`git push origin b0fa9f1:refs/heads/main`), and the default branch was switched to `main` in Settings.
  [Learning log 22](22-first-pr-and-default-branch.md) has the details.

## 5. Anatomy of the first commit

```
commit b0fa9f1f3393a7e8985bbdf8c7447d3fb110dc66
Author: Claude <noreply@anthropic.com>
Date:   Thu Oct 1 15:35:23 2026 +0000

    first commit

    Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
    Claude-Session: https://claude.ai/code/session_0181Vd8M1EifY3LjM43b1aXJ
```

- **The hash** (`b0fa9f1…`) is a fingerprint of the contents, the parent commit, the author and the message.
  If any of those change, you get a different hash. That's why "rewriting history" is a big deal.
- **Author** is the `user.name` and `user.email` from `git config`. In this cloud session it's set to Claude. On
  your own machine, set yours once with `git config --global user.name "…"` and `git config --global user.email "…"`.
- **Trailers** are the `Key: value` lines at the end of the message. GitHub reads `Co-Authored-By` and shows
  both authors on the commit.

## 6. What to try on your own machine

```bash
git clone https://github.com/justuset/justus-and-our-opinions.git
cd justus-and-our-opinions
git switch claude/wonderful-knuth-w43l2c   # check out the work branch
git log --oneline --graph --all            # see every branch and commit as a graph
```

## 7. Takeaways

- Check the state first (`git status`, `git remote -v`, `git branch -a`) before pasting setup commands.
- Staging (`add`) and committing (`commit`) are two separate steps, so you choose exactly what goes into each snapshot.
- `-u` on the first push saves typing for the rest of the project.
- A `fatal:` line in the middle of the output doesn't always mean failure. Look at the end of the output.
- Feature branches plus pull requests are how work reaches `main`. The plan in `docs/plan/` follows that pattern.
- **Push `main` first.** If the first push goes to a feature branch, that branch becomes the default and there's no
  `main` to open a PR against. This repo had to fix exactly that later (log 22).
