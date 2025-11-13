# Setting Up CI/CD Pipeline for LiterAI

This guide explains how to activate and configure the CI/CD pipeline for automatic testing and merge protection.

## Prerequisites

- GitHub repository with LiterAI code
- GitHub Actions enabled (default for public repos)
- Branch protection rules configured

## Step 1: Enable GitHub Actions

1. Go to your GitHub repository
2. Click **Settings** → **Actions** → **General**
3. Ensure "Allow all actions and reusable workflows" is selected
4. Click **Save**

## Step 2: Configure Branch Protection Rules

### For the `main` branch:

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Fill in the form:
   - **Branch name pattern:** `main`
   - **Require a pull request before merging:** ✅
   - **Require approvals:** ✅ (1 approval)
   - **Require status checks to pass before merging:** ✅
   - **Require branches to be up to date before merging:** ✅

4. Under **Require status checks to pass before merging**, select:
   - `E2E Tests - chromium`
   - `E2E Tests - firefox`
   - `E2E Tests - webkit`
   - `Integration Tests`
   - `Regression Detection`
   - `Performance Checks`

5. Click **Create**

### For the `develop` branch:

Repeat the above steps with:
- **Branch name pattern:** `develop`
- **Require approvals:** ✅ (1 approval) - optional for develop
- Same status checks

## Step 3: Verify Workflows are Running

1. Go to your repository
2. Click **Actions** tab
3. You should see workflows:
   - `E2E Tests & Regression Detection`
   - `Branch Protection & Merge Requirements`

4. Create a test PR to verify workflows trigger:
   ```bash
   git checkout -b test/ci-setup
   echo "# Test PR" >> README.md
   git add README.md
   git commit -m "test: verify CI/CD pipeline"
   git push origin test/ci-setup
   ```

5. Open a PR and watch the workflows run

## Step 4: Configure Environment Variables (if needed)

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add any required secrets:
   - `API_URL` - Backend API URL (if different from default)
   - `BASE_URL` - Frontend URL (if different from localhost:3000)

## Step 5: Monitor Test Results

### View Workflow Runs

1. Go to **Actions** tab
2. Click on a workflow run to see details
3. Click on a job to see logs

### View Test Reports

1. In a workflow run, scroll down to **Artifacts**
2. Download test reports:
   - `playwright-report-chromium`
   - `playwright-report-firefox`
   - `playwright-report-webkit`
   - `coverage-report`

### View PR Status

1. Open a PR
2. Scroll down to see status checks
3. Click **Details** next to a check to see logs

## Step 6: Troubleshooting

### Workflows Not Triggering

**Problem:** Workflows don't run on new commits

**Solution:**
1. Check Actions are enabled (Step 1)
2. Verify workflow files exist in `.github/workflows/`
3. Check branch name matches workflow trigger

### Tests Failing in CI but Passing Locally

**Problem:** Tests pass locally but fail in CI

**Possible causes:**
- Different Node.js version
- Different environment variables
- Timing issues
- Missing dependencies

**Solution:**
1. Check Node.js version in workflow matches local version
2. Add debug output to workflow
3. Run tests with longer timeout
4. Check environment variables are set

### Merge Blocked Even Though Tests Passed

**Problem:** Can't merge PR even though all checks passed

**Possible causes:**
- Branch not up to date
- Requires code review
- Requires status checks

**Solution:**
1. Update branch: `git pull origin main`
2. Request code review from team member
3. Wait for all status checks to complete (green checkmarks)

## Step 7: Customization

### Modify Test Timeout

Edit `.github/workflows/e2e-tests.yml`:
```yaml
timeout-minutes: 30  # Change this value
```

### Add More Browsers

Edit `.github/workflows/e2e-tests.yml`:
```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit, msedge]  # Add msedge
```

### Change Required Status Checks

Edit branch protection rule:
1. Go to **Settings** → **Branches**
2. Click **Edit** on the rule
3. Under "Require status checks to pass", select/deselect checks
4. Click **Save changes**

### Modify Performance Limits

Edit `.github/workflows/branch-protection.yml`:
```yaml
MAX_SIZE_BYTES=$((10 * 1024 * 1024)) # Change 10 to desired size in MB
```

## Step 8: Continuous Monitoring

### Set Up Notifications

1. Go to **Settings** → **Notifications**
2. Enable notifications for:
   - Workflow runs
   - Pull request reviews
   - Status checks

### Create Dashboard

1. Go to **Insights** → **Actions**
2. View workflow run statistics
3. Monitor success rate over time

## Step 9: Team Communication

### Share Workflow Status

1. Add workflow badge to README:
```markdown
[![E2E Tests](https://github.com/YOUR_ORG/literai-frontend/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/YOUR_ORG/literai-frontend/actions)
```

2. Create team guidelines:
   - All PRs must have passing tests
   - No merging without code review
   - Monitor test trends

## Maintenance

### Weekly Tasks

- [ ] Review workflow run statistics
- [ ] Check for flaky tests
- [ ] Update dependencies if needed
- [ ] Review failed test logs

### Monthly Tasks

- [ ] Analyze test coverage trends
- [ ] Update performance benchmarks
- [ ] Review and optimize slow tests
- [ ] Update documentation

### Quarterly Tasks

- [ ] Review and update test strategy
- [ ] Evaluate new testing tools
- [ ] Plan for new test coverage
- [ ] Assess CI/CD performance

## Support & Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright Documentation](https://playwright.dev)
- [LiterAI CI/CD Documentation](./CI_CD_DOCUMENTATION.md)
- [LiterAI Test Strategy](./TEST_STRATEGY.md)

## Next Steps

1. ✅ Enable GitHub Actions
2. ✅ Configure branch protection rules
3. ✅ Verify workflows are running
4. ✅ Monitor test results
5. ✅ Set up team notifications
6. ✅ Create team guidelines
7. ✅ Monitor and maintain pipeline

Once complete, your CI/CD pipeline will automatically:
- Run tests on every commit
- Block merges if tests fail
- Detect regressions
- Ensure code quality
- Prevent performance degradation
