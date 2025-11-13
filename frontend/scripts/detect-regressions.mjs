#!/usr/bin/env node

/**
 * Regression Detection Script
 * Compares test results between commits to detect regressions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

interface RegressionReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  regressions: string[];
  improvements: string[];
  newFailures: TestResult[];
  newPasses: TestResult[];
}

/**
 * Parse Playwright JSON report
 */
function parsePlaywrightReport(reportPath: string): TestResult[] {
  try {
    if (!fs.existsSync(reportPath)) {
      console.warn(`Report not found: ${reportPath}`);
      return [];
    }

    const content = fs.readFileSync(reportPath, 'utf-8');
    const report = JSON.parse(content);

    const results: TestResult[] = [];

    if (report.suites) {
      report.suites.forEach((suite: any) => {
        suite.tests?.forEach((test: any) => {
          results.push({
            name: test.title,
            status: test.status as 'passed' | 'failed' | 'skipped',
            duration: test.duration || 0,
            error: test.error?.message,
          });
        });
      });
    }

    return results;
  } catch (error) {
    console.error(`Error parsing report: ${reportPath}`, error);
    return [];
  }
}

/**
 * Compare test results between two runs
 */
function compareResults(
  previousResults: TestResult[],
  currentResults: TestResult[]
): RegressionReport {
  const previousMap = new Map(previousResults.map((r) => [r.name, r]));
  const currentMap = new Map(currentResults.map((r) => [r.name, r]));

  const regressions: string[] = [];
  const improvements: string[] = [];
  const newFailures: TestResult[] = [];
  const newPasses: TestResult[] = [];

  // Check for regressions (tests that were passing but are now failing)
  previousMap.forEach((prev, testName) => {
    const current = currentMap.get(testName);
    if (current) {
      if (prev.status === 'passed' && current.status === 'failed') {
        regressions.push(`❌ ${testName} - was passing, now failing`);
        newFailures.push(current);
      } else if (prev.status === 'failed' && current.status === 'passed') {
        improvements.push(`✅ ${testName} - was failing, now passing`);
        newPasses.push(current);
      }
    }
  });

  // Check for new tests
  currentMap.forEach((current, testName) => {
    if (!previousMap.has(testName)) {
      if (current.status === 'failed') {
        regressions.push(`🆕 ${testName} - new test, failing`);
        newFailures.push(current);
      }
    }
  });

  const report: RegressionReport = {
    timestamp: new Date().toISOString(),
    totalTests: currentResults.length,
    passedTests: currentResults.filter((r) => r.status === 'passed').length,
    failedTests: currentResults.filter((r) => r.status === 'failed').length,
    skippedTests: currentResults.filter((r) => r.status === 'skipped').length,
    regressions,
    improvements,
    newFailures,
    newPasses,
  };

  return report;
}

/**
 * Generate regression report
 */
function generateReport(report: RegressionReport): string {
  let output = `\n${'='.repeat(80)}\n`;
  output += `REGRESSION DETECTION REPORT\n`;
  output += `Generated: ${report.timestamp}\n`;
  output += `${'='.repeat(80)}\n\n`;

  output += `📊 TEST SUMMARY\n`;
  output += `${'─'.repeat(80)}\n`;
  output += `Total Tests:   ${report.totalTests}\n`;
  output += `✅ Passed:     ${report.passedTests} (${((report.passedTests / report.totalTests) * 100).toFixed(1)}%)\n`;
  output += `❌ Failed:     ${report.failedTests} (${((report.failedTests / report.totalTests) * 100).toFixed(1)}%)\n`;
  output += `⏭️  Skipped:    ${report.skippedTests}\n\n`;

  if (report.regressions.length > 0) {
    output += `🚨 REGRESSIONS DETECTED (${report.regressions.length})\n`;
    output += `${'─'.repeat(80)}\n`;
    report.regressions.forEach((regression) => {
      output += `${regression}\n`;
    });
    output += '\n';
  }

  if (report.improvements.length > 0) {
    output += `🎉 IMPROVEMENTS (${report.improvements.length})\n`;
    output += `${'─'.repeat(80)}\n`;
    report.improvements.forEach((improvement) => {
      output += `${improvement}\n`;
    });
    output += '\n';
  }

  if (report.newFailures.length > 0) {
    output += `📋 NEW FAILURES\n`;
    output += `${'─'.repeat(80)}\n`;
    report.newFailures.forEach((failure) => {
      output += `• ${failure.name}\n`;
      if (failure.error) {
        output += `  Error: ${failure.error}\n`;
      }
    });
    output += '\n';
  }

  output += `${'='.repeat(80)}\n`;

  return output;
}

/**
 * Save regression report
 */
function saveReport(report: RegressionReport, outputPath: string): void {
  const reportContent = {
    ...report,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(outputPath, JSON.stringify(reportContent, null, 2));
  console.log(`Report saved to: ${outputPath}`);
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Starting regression detection...\n');

  // Get current test results
  const reportPath = path.join(projectRoot, 'playwright-report', 'index.json');
  const currentResults = parsePlaywrightReport(reportPath);

  if (currentResults.length === 0) {
    console.warn('⚠️  No test results found. Skipping regression detection.');
    process.exit(0);
  }

  // For now, we'll just generate a report of current results
  // In a real CI/CD pipeline, you would compare with previous results
  const report: RegressionReport = {
    timestamp: new Date().toISOString(),
    totalTests: currentResults.length,
    passedTests: currentResults.filter((r) => r.status === 'passed').length,
    failedTests: currentResults.filter((r) => r.status === 'failed').length,
    skippedTests: currentResults.filter((r) => r.status === 'skipped').length,
    regressions: [],
    improvements: [],
    newFailures: currentResults.filter((r) => r.status === 'failed'),
    newPasses: currentResults.filter((r) => r.status === 'passed'),
  };

  // Generate and display report
  const reportText = generateReport(report);
  console.log(reportText);

  // Save report
  const outputPath = path.join(projectRoot, 'regression-report.json');
  saveReport(report, outputPath);

  // Exit with error if there are failures
  if (report.failedTests > 0) {
    console.error(`\n❌ ${report.failedTests} test(s) failed!`);
    process.exit(1);
  }

  console.log('\n✅ All tests passed!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error running regression detection:', error);
  process.exit(1);
});
