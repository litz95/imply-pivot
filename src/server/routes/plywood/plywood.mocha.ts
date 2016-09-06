/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Q from 'q-tsc';
import { Response, HerculesServer } from 'nike-hercules';
import { $, ply, r } from 'plywood';

import { PivotRequest } from '../../utils/index';

import { AppSettingsMock } from '../../../common/models/app-settings/app-settings.mock';

import * as plywoodRouter from './plywood';

var server = new HerculesServer();
server.addBodyParser();

var appSettings = AppSettingsMock.wikiOnly();
var executors = AppSettingsMock.executorsWiki();
server.getApp().use((req: PivotRequest, res: Response, next: Function) => {
  req.user = null;
  req.version = '0.9.4';
  req.stateful = false;
  req.getFullSettings = (dataCubeOfInterest?: string) => {
    return Q({
      appSettings,
      timekeeper: null,
      executors
    });
  };
  next();
});

server.getApp().use('/', plywoodRouter);

describe('plywood router', () => {
  it('must have dataCube', (testComplete) => {
    server.getSupertest()
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        version: '0.9.4',
        expression: $('main').toJS()
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(400)
      .expect({
        "error": "must have a dataCube"
      }, testComplete);
  });

  it('does a query (value)', (testComplete) => {
    server.getSupertest()
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        version: '0.9.4',
        expression: $('main').count().toJS(),
        dataCube: 'wiki'
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        result: 10
      }, testComplete);
  });

  it('does a query (dataset)', (testComplete) => {
    server.getSupertest()
      .post('/')
      .set('Content-Type', "application/json")
      .send({
        version: '0.9.4',
        expression: $('main')
          .split('$channel', 'Channel')
          .apply('Count', $('main').count())
          .sort('$Count', 'descending')
          .limit(2)
          .toJS(),
        dataSource: 'wiki' // back compat
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .expect({
        result: [
          { Channel: 'en', Count: 4 },
          { Channel: 'vi', Count: 4 }
        ]
      }, testComplete);
  });

});
