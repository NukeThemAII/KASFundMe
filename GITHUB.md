# GitHub Push Runbook

Follow these steps whenever you need to publish local changes from this repository to the `main` branch on GitHub.

## 1. Verify repository status
```bash
cd /root/KASFundMe
git status
```
Ensure only the intended files are modified. Stage updates as needed:
```bash
git add <path/to/file>
```
You can stage everything with `git add .` if you are confident nothing unintended changed.

## 2. Commit the changes
Provide a clear message summarizing the work:
```bash
git commit -m "Your descriptive commit message"
```
If Git reports “nothing to commit,” you probably forgot to stage files.

## 3. Confirm the remote configuration
Double-check that `origin` points at the correct GitHub repository:
```bash
git remote -v
```
If it lists a different URL, fix it:
```bash
git remote set-url origin https://github.com/NukeThemAII/KASFundMe.git
```

## 4. Pull the latest changes
Before pushing, integrate any updates from GitHub:
```bash
git pull --rebase origin main
```
Resolve conflicts if Git pauses; edit files, `git add` the resolutions, then continue with `git rebase --continue`.

## 5. Push to GitHub
```bash
git push origin main
```
If authentication is requested, provide your GitHub PAT (or use a credential helper).

## 6. Verify on GitHub
Visit https://github.com/NukeThemAII/KASFundMe/commits/main and confirm the new commit appears at the top. Refresh if necessary.

## Troubleshooting
- **“Everything up-to-date,” but GitHub lacks changes:** ensure you committed locally (see step 2) and that you pushed to the correct branch (`main`).
- **Authentication errors:** regenerate or re-enter the Personal Access Token, or configure a credential helper (`git config --global credential.helper store`).
- **Merge conflicts during pull:** resolve the conflicted files manually, stage, and continue the rebase.
