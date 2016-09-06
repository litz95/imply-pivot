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

import { expect } from 'chai';
import * as Q from 'q-tsc';
import { Response, HerculesServer } from 'nike-hercules';

import { PivotRequest } from '../../utils/index';

import { AppSettingsMock } from '../../../common/models/app-settings/app-settings.mock';

import * as pivotRouter from './pivot';

var server = new HerculesServer();

var appSettings = AppSettingsMock.wikiOnly();
var executors = AppSettingsMock.executorsWiki();
server.getApp().use((req: PivotRequest, res: Response, next: Function) => {
  req.user = null;
  req.version = '0.9.4';
  req.getFullSettings = (dataCubeOfInterest?: string) => {
    return Q({
      appSettings,
      timekeeper: null,
      executors
    });
  };
  next();
});

server.getApp().use('/', pivotRouter);

describe('pivot router', () => {
  it('does a query (value)', (testComplete) => {
    server.getSupertest()
      .get('/')
      .expect(200)
      .end((err: any, res: any) => {
        if (err) testComplete(err);
        expect(res.text).to.contain('<!DOCTYPE html>');
        expect(res.text).to.contain('<meta name="description" content="Data Explorer">');
        testComplete();
      });
  });

});
