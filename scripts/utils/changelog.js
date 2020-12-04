const { htmlEscape } = require('escape-goat');
const { getRootPackage } = require('@nodecorejs/dot-runtime');
const git = require('./git');

module.exports = async () => {
  const repoUrl = getRootPackage().originGit;
  if (!repoUrl) {
    throw new Error(`Development git not found at runtime`);
  }
  const latest = await git.latestTagOrFirstCommit();
  const log = await git.commitLogFromRevision(latest);

  if (!log) {
    throw new Error(`Get changelog failed, no new commits was found.`);
  }

  return log.split('\n').length
};