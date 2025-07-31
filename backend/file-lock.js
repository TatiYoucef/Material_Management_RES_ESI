const fileLocks = {};

async function acquireLock(filePath) {
  if (!fileLocks[filePath]) {
    fileLocks[filePath] = Promise.resolve();
  }
  const currentLock = fileLocks[filePath];
  let releaseLock;
  const newLock = new Promise(resolve => {
    releaseLock = resolve;
  });
  fileLocks[filePath] = currentLock.then(() => newLock);
  return releaseLock;
}

module.exports = { acquireLock };