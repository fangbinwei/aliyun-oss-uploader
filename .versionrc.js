module.exports = {
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'test', section: 'Tests', hidden: true },
    { type: 'ci', hidden: true },
    { type: 'chore', hidden: true },
    { type: 'docs', hidden: true },
    { type: 'style', hidden: true },
    { type: 'refactor', hidden: true },
    { type: 'perf', hidden: true },
    { type: 'ci', hidden: true}
  ],
  releaseCommitMessageFormat: 'chore(release): v{{currentTag}}'
}
