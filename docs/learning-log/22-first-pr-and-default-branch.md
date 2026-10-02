# Learning log 22: The first pull request, and making `main` the default

**Date:** 2026-10-02  **Step:** repository housekeeping (no code)  **PR:** [justuset/justus-and-our-opinions#1](https://github.com/justuset/justus-and-our-opinions/pull/1)

## Goal

Open a pull request for everything built so far, and get the repository into the standard shape: a `main` branch that
work merges into, and `main` as the default branch.

## The problem: a PR needs two branches, and there was one

A pull request asks to merge a **head** branch (the work) into a **base** branch (usually `main`). Checking GitHub:

```bash
git remote show origin | grep "HEAD branch"   # HEAD branch: claude/wonderful-knuth-w43l2c
# GitHub's branch list: claude/wonderful-knuth-w43l2c, and nothing else
```

`main` had never existed on GitHub. The very first push ([log 01](01-repo-setup.md)) went to the Claude Code session's
branch instead of `main`, and since it was the repo's only branch, GitHub made it the **default**. All 23 commits had
landed there.

## Choosing where `main` starts

The base decides what the PR contains: everything on the head branch that isn't already on the base. Three options were
put to the owner:

| `main` starts at | The PR would contain |
|------------------|----------------------|
| **`b0fa9f1`, the first commit** (the original README) ← chosen | All 22 later commits: plans, Phase 1, Phase 2 chunk 00, NYT sandbox S1–S2 |
| `dcea8ec` (Phase 2 chunk 00) | Only the blueprint review, S1 and S2 |
| `7beb3f7` (end of Phase 1) | Phase 2 chunk 00 plus the sandbox work |

The first commit matches what the original GitHub quick-setup block intended (`git push -u origin main` right after
the README), and it makes the whole project reviewable in one place.

## What ran

```bash
git push origin b0fa9f1:refs/heads/main
#  * [new branch]      b0fa9f1 -> main
git fetch origin && git rev-list --count origin/main..HEAD    # 22
```

`<commit>:refs/heads/<name>` means "on the remote, create or move the branch `<name>` to point at `<commit>`." It works
without checking anything out locally, and `b0fa9f1` was already on GitHub, so nothing new was uploaded: only a
new label was made.

Then the PR: **base `main` ← head `claude/wonderful-knuth-w43l2c`**, titled "Opinion interactive template: Phase 1,
Phase 2 foundation, NYT sandbox S1–S2". Its description covers what's in it, how it was checked (CI green on the head
commit, plus each chunk's measured checkpoint), and notes for review. There was no PR template in the repo to follow.

## Switching the default branch

The default branch is a **repository setting**, not something `git` can change, and this session's GitHub tools could
create branches and PRs but not edit settings. So the owner did it by hand: **Settings → General → Default branch →
⇄ → `main` → Update**. Then I confirmed it from the clone:

```bash
git remote set-head origin -a       # origin/HEAD set to main
git remote show origin | grep "HEAD branch"   # HEAD branch: main
```

`origin/HEAD` is your clone's *cached* idea of GitHub's default branch. It doesn't update by itself when the setting
changes on GitHub, and `set-head -a` re-asks.

The open PR was unaffected: its base was already `main`.

## Concepts learned

- **A branch is just a movable label on a commit.** Creating `main` at an old commit copied nothing; it named a point in history that was already there.
- **The base branch defines a PR's contents.** Same head, different base, different PR.
- **Git and GitHub split the work.** Git handles commits, branches and pushes. GitHub owns everything around them: default branch, PRs, protection rules, CI. Some of it is only reachable through the website, `gh`, or the API.
- **Push `main` first.** Starting a new repo on a feature branch is what caused this cleanup. The manual walkthrough ([`docs/guides/github-repo-from-scratch.md`](../guides/github-repo-from-scratch.md)) does it in the right order, and its part 9 tells this story as a timeline.

## Next

When PR #1 is reviewed and merged, `main` holds the whole project, and new work follows the everyday loop in the guide
(part 7): a branch per chunk, a PR per branch. The next chunk is
[S3: NYT breakpoints and themes](../plan/nyt-sandbox-alignment.md#s3-nyt-breakpoints-and-themes).
