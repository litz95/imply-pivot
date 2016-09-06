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

import { HerculesServer, Router, Response } from 'nike-hercules';

import { PivotRequest } from '../../utils/index';
import { pivotLayout } from '../../views';

var router = HerculesServer.makeRouter();

router.get('/', (req: PivotRequest, res: Response, next: Function) => {
  req.getFullSettings()
    .then((fullSettings) => {
      const { appSettings, timekeeper } = fullSettings;
      var clientSettings = appSettings.toClientSettings();
      res.send(pivotLayout({
        version: req.version,
        title: appSettings.customization.getTitleWithVersion(req.version),
        user: req.user,
        appSettings: clientSettings,
        timekeeper: timekeeper,
        stateful: req.stateful
      }));
    })
    .done();
});

export = router;
