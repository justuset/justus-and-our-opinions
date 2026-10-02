# Setting up a GitHub repo from scratch, by hand

A complete walkthrough for doing yourself what this project's setup did: from an empty computer to a GitHub repository
with a `main` branch, a feature-branch-and-pull-request workflow, CI, and protected `main`. Every step says **what to
type or click**, **what you should see**, and **why**.

Throughout, the example is this repo, `justuset/justus-and-our-opinions`. Swap in your own username and repo name.
Part 9 shows how this repo's real history differed from the textbook path, and how it was fixed.

**Contents**

1. [Install the tools](#1-install-the-tools)
2. [Tell Git who you are](#2-tell-git-who-you-are)
3. [Let your computer sign in to GitHub](#3-let-your-computer-sign-in-to-github)
4. [Create the repository on GitHub](#4-create-the-repository-on-github)
5. [Create the project folder and make the first commit](#5-create-the-project-folder-and-make-the-first-commit)
6. [Push `main` to GitHub](#6-push-main-to-github)
7. [The everyday loop: branch → commit → push → pull request → merge](#7-the-everyday-loop)
8. [Repository settings worth making once](#8-repository-settings-worth-making-once)
9. [How this repo actually got here](#9-how-this-repo-actually-got-here)
10. [Getting this project running on your machine](#10-getting-this-project-running-on-your-machine)
11. [Cheat sheet](#11-cheat-sheet)

---

## 1. Install the tools

You need three things: **Git** (version control), **Node.js 22 or newer** (runs the project's tooling) with **npm 11**
(installs packages), and a code editor.

| Tool | macOS | Windows | Linux (Debian/Ubuntu) |
|------|-------|---------|------------------------|
| Git | `xcode-select --install`, or `brew install git` with [Homebrew](https://brew.sh) | [git-scm.com/download/win](https://git-scm.com/download/win). Keep the defaults, which include **Git Credential Manager** | `sudo apt install git` |
| Node 22 | [nvm](https://github.com/nvm-sh/nvm): `nvm install 22` | [nvm-windows](https://github.com/coreybutler/nvm-windows), or the installer from [nodejs.org](https://nodejs.org) | nvm, as on macOS |
| Editor | [VS Code](https://code.visualstudio.com) (any editor works) | same | same |

**Check them** in a terminal (Terminal on macOS, PowerShell or Git Bash on Windows):

```bash
git --version     # git version 2.43.0 or newer
node -v           # v22.x.x
npm -v            # 10.x.x: Node 22 ships npm 10
```

**Upgrade npm to 11.** This project needs it: npm 10 crashes while installing the test tool, vitest 4.1 (learning log 18).

```bash
npm install --global npm@11.21.0
npm -v            # 11.21.0
```

> **Why a version manager (nvm)?** Different projects need different Node versions. The repo has a `.nvmrc` file
> containing `22`, so inside it `nvm use` switches to the right version automatically.

---

## 2. Tell Git who you are

Every commit records an author name and email. Set them **once per computer**:

```bash
git config --global user.name "Justus Riley"
git config --global user.email "ID+justuset@users.noreply.github.com"
git config --global init.defaultBranch main
```

| Setting | Why |
|---------|-----|
| `user.name` | Shown as the commit author |
| `user.email` | Links commits to your GitHub account. Use GitHub's **private noreply address** so your real email isn't published in every commit. Find it at GitHub → your avatar → **Settings → Emails**: tick **Keep my email addresses private**, and copy the `…@users.noreply.github.com` address shown there |
| `init.defaultBranch main` | Makes `git init` start on a branch called `main`, so you never need `git branch -M main` |

Check with `git config --global --list`.

---

## 3. Let your computer sign in to GitHub

GitHub no longer accepts your account password for `git push`. Pick **one** of these. Option A is the easiest.

### Option A: the GitHub CLI (recommended)

```bash
# macOS: brew install gh   ·   Windows: winget install --id GitHub.cli   ·   Linux: see cli.github.com
gh auth login
```

Answer the prompts:
- **GitHub.com**;
- **HTTPS**;
- **Yes** to "authenticate Git with your GitHub credentials";
- **Login with a web browser**.

Copy the one-time code it shows, approve it in the browser, and you're done. `gh` stores a token and tells Git to use it.

### Option B: Git Credential Manager

It's already installed with Git for Windows; on macOS, `brew install --cask git-credential-manager`. The first time you
push, a browser window asks you to sign in, and the credential is remembered.

### Option C: an SSH key

```bash
ssh-keygen -t ed25519 -C "you@example.com"   # press Enter to accept the file location, then choose a passphrase
cat ~/.ssh/id_ed25519.pub                    # copy this whole line (the PUBLIC key, ending .pub)
```

On GitHub: avatar → **Settings → SSH and GPG keys → New SSH key**. Paste it, give it a title like "MacBook", and save.
Then test it:

```bash
ssh -T git@github.com
# Hi justuset! You've successfully authenticated, but GitHub does not provide shell access.
```

With SSH, repo URLs look like `git@github.com:justuset/justus-and-our-opinions.git` instead of `https://…`.

> **Never share or commit** the private key (`id_ed25519`, without `.pub`), and never paste a token into a file in a repo.

---

## 4. Create the repository on GitHub

1. On [github.com](https://github.com), click **+** (top right) → **New repository**.
2. **Owner:** your account. **Repository name:** `justus-and-our-opinions`. **Description:** optional.
3. **Public** or **Private.** Private is fine for learning, and you can change it later in Settings.
4. **Leave every "initialize" option off: no README, no .gitignore, no license.** You'll create those locally, and
   an empty repo means your first push won't conflict with files GitHub made.
5. Click **Create repository**.

GitHub then shows a **Quick setup** page with the repo's URL and a block of commands. That's the block this project
started from (learning log 01). Part 5 runs the same steps, explained.

---

## 5. Create the project folder and make the first commit

```bash
mkdir justus-and-our-opinions
cd justus-and-our-opinions
git init                                   # Initialized empty Git repository in …/.git/  (on branch main)
echo "# justus-and-our-opinions" > README.md
git status                                 # README.md listed in red under "Untracked files"
git add README.md                          # stage it
git status                                 # now green, under "Changes to be committed"
git commit -m "first commit"
git log --oneline                          # b0fa9f1 first commit   (your hash will differ)
```

What happened:
- **`git init`** created the hidden `.git/` folder. That folder *is* the repository: every commit lives in it.
- **`add`** put the file in the **staging area**, the "next commit" tray.
- **`commit`** saved the tray as a permanent snapshot with a hash (`b0fa9f1…`) that fingerprints its content and history.

**Add a `.gitignore` early**, before you install anything, so generated folders never get committed. This project's
version:

```gitignore
node_modules/
build/
dist/
.svelte-kit/
.react-router/
test-results/
playwright-report/
coverage/
.env
.env.*
!.env.example
.DS_Store
```

```bash
git add .gitignore
git commit -m "chore: ignore dependencies, build output and local env files"
```

---

## 6. Push `main` to GitHub

```bash
git remote add origin https://github.com/justuset/justus-and-our-opinions.git   # or the git@github.com:… URL for SSH
git remote -v                       # origin  https://github.com/… (fetch) / (push)
git push -u origin main
```

What you should see at the end:

```
To https://github.com/justuset/justus-and-our-opinions.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

- **`origin`** is just a nickname for the GitHub URL.
- **`-u`** (upstream) links your local `main` to `origin/main`, so from now on a plain `git push` / `git pull` knows where to go.

**Verify:** refresh the repo page on GitHub. You should see your README, and the branch picker should say `main`.
From the terminal, `git ls-remote --heads origin` asks GitHub directly which branches exist.

---

## 7. The everyday loop

Nobody commits straight to `main` on a real team. Each piece of work gets its own **branch**. You push the branch and
open a **pull request** (PR). CI checks it, someone reviews it, and it's **merged** into `main`. This project's chunks
each map to one PR.

```bash
# 1. Start from an up-to-date main
git switch main
git pull

# 2. Make a branch named after the work
git switch -c feat/s3-breakpoints

# 3. Work, then commit in small, meaningful steps
git status
git add docs/plan/nyt-sandbox-alignment.md projects/interactive/src/app.css
git commit -m "feat(story): NYT breakpoints at 740 and 1150"

# 4. Push the branch (first time with -u)
git push -u origin feat/s3-breakpoints
```

The push prints a link: **"Create a pull request for 'feat/s3-breakpoints' on GitHub by visiting: …"**.

5. **Open the PR.** Open that link, or go to the repo → **Pull requests → New pull request**, set **base: `main`** and
   **compare: your branch**, then click **Create pull request**. Write what changed, why, and how you checked it.
   `gh pr create --base main --fill` does the same from the terminal.
6. **Wait for the checks.** The PR page shows the **CI** checks running (part 8). Fix anything red by committing and
   pushing to the same branch; the PR updates itself.
7. **Merge.** Click **Merge pull request**. Squash and merge gives one tidy commit per PR on `main`; a merge commit keeps every commit. Then click **Delete branch**.
8. **Bring your machine up to date:**

```bash
git switch main
git pull                       # main now includes the merged work
git branch -d feat/s3-breakpoints
```

**Commit messages** follow [Conventional Commits](https://www.conventionalcommits.org), as `CLAUDE.md` asks:
`type(scope): summary`. Use `feat` for new behavior, `fix` for bugs, `docs` for documentation and `chore` for tooling.
Examples from this repo: `feat(story): NYT sandbox S2, the platform shell` and `docs(plan): verify build against the NYT sandbox blueprint`.

---

## 8. Repository settings worth making once

All of these are on the repo page → **Settings**.

| Setting | Where | What to choose | Why |
|---------|-------|----------------|-----|
| **Default branch** | **General → Default branch** → the ⇄ button | `main` | The branch people see first, and the base new PRs target. (This repo needed the fix, see part 9.) |
| **Merge options** | **General → Pull Requests** | Allow squash merging; tick **Automatically delete head branches** | Tidy history; no pile of stale branches |
| **Protect `main`** | **Rules → Rulesets → New ruleset → New branch ruleset**. Target: **default branch** | Turn on **Restrict deletions**, **Block force pushes**, **Require a pull request before merging** and **Require status checks to pass** (add the CI jobs once they've run at least once) | Nothing reaches `main` without a PR and green CI, not even by accident |
| **Actions** | **Actions → General** | Leave "Allow all actions" for a personal repo | Lets the CI workflow run |

**CI** is a file in the repo, not a setting. This project's is [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).
On every push and PR, GitHub Actions runs `npm ci` → lint → type-check → tests → build, and shows a ✅ or ❌ on the
commit and the PR. Adding one to a new repo:

```bash
mkdir -p .github/workflows
# write ci.yml (copy this repo's as a starting point)
git add .github/workflows/ci.yml
git commit -m "ci: lint, check, test and build on every push"
git push
```

Watch it run under the repo's **Actions** tab.

---

## 9. How this repo actually got here

The textbook path above creates `main` first. This project's real history took a detour, which is worth understanding
because it's a common situation.

| When | What happened | Why |
|------|---------------|-----|
| 2026-10-01 | The repo was created empty on GitHub, and the work started in a **Claude Code cloud session**, which had already cloned it | The session's rules: work and push only on its own branch, `claude/wonderful-knuth-w43l2c` |
| 2026-10-01 | `first commit` (`b0fa9f1`, the README) was pushed to **that branch, not `main`** (learning log 01) | The quick-setup block's `git push -u origin main` was swapped for the session branch |
| | Since it was the repo's **only** branch, GitHub made it the **default branch** | GitHub's default is simply the first branch pushed to an empty repo |
| 2026-10-01 → 02 | All 23 commits (Phase 1, Phase 2 chunk 00, NYT sandbox S1–S2) landed on that branch | |
| 2026-10-02 | A PR was wanted, but a PR needs **two** branches, and there was only one. So `main` was created **at the first commit** | `git push origin b0fa9f1:refs/heads/main`: "make a branch called `main` on GitHub pointing at commit `b0fa9f1`" |
| 2026-10-02 | [PR #1](https://github.com/justuset/justus-and-our-opinions/pull/1): `claude/wonderful-knuth-w43l2c` → `main`, carrying 22 commits | Everything after the first commit becomes reviewable |
| 2026-10-02 | Default branch switched to `main` in **Settings → General** | Settings can't be changed through `git`, only on GitHub (or with `gh`/the API) |

Two commands from this episode worth knowing:

```bash
git push origin <commit>:refs/heads/<new-branch>   # create a branch on GitHub at any commit, without checking it out
git remote set-head origin -a                      # refresh your clone's idea of GitHub's default branch
git remote show origin | grep "HEAD branch"        # HEAD branch: main
```

The lesson: if you start from GitHub's quick-setup block, push `main` **first**, then branch. It saves this cleanup.

---

## 10. Getting this project running on your machine

```bash
git clone https://github.com/justuset/justus-and-our-opinions.git
cd justus-and-our-opinions
nvm use                                  # reads .nvmrc → Node 22
npm install --global npm@11.21.0         # once per machine (part 1)
```

Until PR #1 is merged, the work lives on its branch:

```bash
git switch claude/wonderful-knuth-w43l2c
```

**The Phase 2 workspace** (the React story app and the SvelteKit graphics desk) installs from the root:

```bash
npm install                              # one install for apps/* and packages/*
npm run dev                              # story app → http://localhost:5173, graphics desk → http://localhost:5174
npm run lint && npm run check && npm test && npm run build    # what CI runs
```

**The Birdkit-style story project** has its own install:

```bash
cd projects/interactive
npm install
npm run dev                              # http://localhost:5173 (stop the workspace dev server first: same port)
npm run build                            # ends with "verified 23 media URLs"
npm run preview                          # the built page, as a reader gets it
npx playwright install chromium          # once, for:
npm run parity                           # project vs. prototype, within 1px
```

**The Phase 1 prototype** needs only a local web server (Lottie files can't load from `file://`):

```bash
python3 -m http.server -d prototype 8000     # then open http://localhost:8000
```

---

## 11. Cheat sheet

| I want to… | Command |
|------------|---------|
| See what's changed | `git status` · `git diff` (unstaged) · `git diff --staged` (staged) |
| Stage everything / one file | `git add -A` · `git add path/to/file` |
| Commit | `git commit -m "type(scope): summary"` |
| See history | `git log --oneline --graph --all` |
| Make and switch to a branch | `git switch -c feat/name` |
| Switch branches | `git switch main` |
| Get the latest from GitHub | `git pull` |
| Push (first time / after) | `git push -u origin feat/name` · `git push` |
| See branches here / on GitHub | `git branch -a` · `git ls-remote --heads origin` |
| Unstage a file (keep the changes) | `git restore --staged path` |
| Throw away uncommitted changes to a file | `git restore path` ⚠ can't be undone |
| Undo the last commit, keep the changes | `git reset --soft HEAD~1` (only if not pushed yet) |
| Bring `main`'s new work into your branch | `git switch feat/name && git merge main` |
| Open a PR from the terminal | `gh pr create --base main --fill` |

**Golden rules:**
- Check `git status` before and after everything.
- Never force-push (`--force`) to a branch someone else uses, and never to `main`.
- Commit small and often, with messages that say *why*.
- Secrets (`.env`, keys, tokens) never go in a commit. `.gitignore` them before they exist.
