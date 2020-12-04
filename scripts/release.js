const { yParser, execa, chalk } = require('@nodecorejs/libs');
const { getRootPackage } = require('@nodecorejs/dot-runtime');
const { join, resolve } = require('path');
const { writeFileSync } = require('fs');
const newGithubReleaseUrl = require('new-github-release-url');
const open = require('open');
const exec = require('./utils/exec');
const {getChangelog} = require('./utils/changelog');
const getChanges = require('./utils/changes');
const versionParsed = require('./utils/parsedVersion')

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

function parsedVersionToString(parsed) {
  return `${parsed.major}.${parsed.minor}.${parsed.patch}`
}

async function release() {
  let publishVersion = versionParsed();
  let rootPkg = require('../package')
  let currVersion = parsedVersionToString(publishVersion)


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
      await exec(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'build'])
      const changes = await getChanges()
      publishVersion.patch = Number(publishVersion.patch) + changes
    } else {
      logStep('build is skipped, since args.skipBuild is supplied');
    }

    logStep('sync version to root package.json')

    if (args.minor) {
      publishVersion.patch = 0
      publishVersion.minor = Number(publishVersion.minor) + 1
    }

    if (args.major) {
      publishVersion.patch = 0
      publishVersion.minor = 0
      publishVersion.major = Number(publishVersion.major) + 1
    }

    rootPkg.version = parsedVersionToString(publishVersion)
    currVersion = parsedVersionToString(publishVersion)

    writeFileSync(
      join(__dirname, '..', 'package.json'),
      JSON.stringify(rootPkg, null, 2) + '\n',
      'utf-8',
    );

    // Commit
    const commitMessage = `release: v${currVersion}`;
    logStep(`git commit with ${chalk.blue(commitMessage)}`);
    await exec('git', ['commit', '--all', '--message', commitMessage]);

    // Git Tag
    logStep(`git tag v${currVersion}`);
    await exec('git', ['tag', `v${currVersion}`]);

    // Push
    logStep(`git push`);
    await exec('git', ['push', 'origin', 'master', '--tags']);
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
