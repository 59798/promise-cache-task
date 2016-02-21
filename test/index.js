// Dependencies
import middleware from '../src';

import express from 'express';
import caravan from 'caravan';
import assert from 'power-assert';
import del from 'del';

// Environment
const cwd = `${__dirname}/fixtures/public`;
const port = process.env.PORT || 59798;

// Specs
describe('markedown compile server', () => {
  let server;
  before((done) => {
    const app = express();
    app.use('/articles', middleware(cwd));

    server = app.listen(port, done);
  });
  after((done) => (
    server.close(() => {
      del(`${cwd}/**/*.html`).then(() => done());
    })
  ));

  it('markdownをhtmlとしてコンパイル返す。htmlはキャッシュとして保存し、以降はコンパイルしない', () => {
    const concurrency = 100;
    const urls = [];
    for (let i = 0; i < concurrency; i++) {
      urls.push(`http://localhost:${port}/articles`);
    }

    return caravan(urls, { concurrency })
    .progress((progress) => {
      assert.equal(progress.value, '<p><strong>要反省である</strong></p>');
    })
    .then((responses) => {
      assert.equal(responses.length, concurrency);
    });
  });
});
