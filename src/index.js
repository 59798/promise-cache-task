// Dependencies
import Bluebird from 'bluebird';

import { Router as expressRouter } from 'express';
import fsOrigin from 'fs';
import marked from 'marked';

// Module enhancement
const fs = Bluebird.promisifyAll(fsOrigin);
const markedAsync = Bluebird.promisify(marked);

// Public
export default (cwd) => {
  const router = expressRouter();

  router.use((req, res, next) => {
    let filePath = req.url.slice(1);
    if (filePath === '' || filePath.match(/\/$/)) {
      filePath += 'index';
    }
    const fileName = `${cwd}/${filePath}.md`;
    const cacheName = `${cwd}/${filePath}.html`;

    const notFound = fs.existsSync(fileName) === false;
    const useCache = fs.existsSync(cacheName);
    if (notFound) {
      return next();
    }
    if (useCache) {
      return res.sendFile(cacheName);
    }

    console.log('以降の処理は重いので１度だけ実行したい');

    return fs.readFileAsync(fileName)
    .then((data) => markedAsync(data.toString()))
    .then((cache) => {
      const trimedCache = cache.trim();// 末尾"\n"の削除

      return fs.writeFileAsync(cacheName, trimedCache)
      .then(() => {
        res.set('content-type', 'text/html');
        res.end(trimedCache);
      });
    });
  });

  return router;
};
