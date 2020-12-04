const { yParser, execa, chalk } = require('@nodecorejs/libs');
const { getRootPackage } = require('@nodecorejs/dot-runtime');
const { join, resolve } = require('path');
const { writeFileSync } = require('fs');
const newGithubReleaseUrl = require('new-github-release-url');
const open = require('open');
const exec = require('./utils/exec');
const isNextVersion = require('./utils/isNextVersion');
const { getChangelog } = require('./utils/changelog');

const cwd = process.cwd();

const args = require("args-parser")(process.argv)

function printErrorAndExit(message) {
  console.error(chalk.red(message));
  process.exit(1);
}

function logStep(name) {
  console.log(`${chalk.gray('>> Release:')} ${chalk.magenta.bold(name)}`);
}


async function checkGitStatus() {
  const gitStatus = execa.sync('git', ['status', '--porcelain']).stdout;
  if (gitStatus.length) {
    printErrorAndExit(`Your git status is not clean. Aborting.`);
  }
}

async function release() {
  const currVersion = getRootPackage().version

  // Check git status
  if (!args.skipGitStatusCheck) {
    checkGitStatus()
  } else {
    logStep('Check git status skipped.');
  }

  // get release notes
  logStep('get release notes');
  const releaseNotes = await getChangelog();
  console.log(releaseNotes(''));

  // Check npm registry
  logStep('check npm registry');
  const userRegistry = execa.sync(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['config', 'get', 'registry']).stdout;
  if (userRegistry.includes('https://registry.yarnpkg.com/')) {
    printErrorAndExit(
      `Release failed, please use ${chalk.blue('npm run release')}.`,
    );
  }
  if (!userRegistry.includes('https://registry.npmjs.org/')) {
    const registry = chalk.blue('https://registry.npmjs.org/');
    printErrorAndExit(`Release failed, npm registry must be ${registry}.`);
  }

  if (!args.publishOnly) {
    // Build
    if (!args.skipBuild) {
      logStep('build');
      await exec(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'build']);
    } else {
      logStep('build is skipped, since args.skipBuild is supplied');
    }

    // Git Tag
    logStep(`git tag v${currVersion}`);
    await exec('git', ['tag', `v${currVersion}`]);

    // Push
    logStep(`git push`);
    await exec('git', ['push', 'origin', 'master', '--tags']);
  }

  try {
    const { stdout } = execa.sync('yarn', ['publish'], {
      cwd: process.cwd(),
    })
    console.log(stdout);
  } catch (error) {
    console.log(`❌ Failed to publish >`, error)
  }

  if (!getRootPackage().originGit) {
    return printErrorAndExit(`originGit is missing on runtime`);
  }

  logStep('create github release');
  const tag = `v${currVersion}`;
  const changelog = releaseNotes(tag);
  console.log(changelog);
  const url = newGithubReleaseUrl({
    repoUrl: getRootPackage().originGit,
    tag,
    body: changelog,
    isPrerelease: args.pre? args.pre : false,
  });
  try {
    await open(url);
  } catch (error) {
    console.log("Try opening url >", url)
  }

  logStep('done');
}

release().catch((err) => {
  console.error(err);
  process.exit(1);
});
