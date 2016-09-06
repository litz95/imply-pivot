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

import { HerculesServer, Router, Request, Response } from 'nike-hercules';
import { PivotRequest } from '../../utils/index';

var router = HerculesServer.makeRouter();

router.get('/', (req: PivotRequest, res: Response) => {
  req.getFullSettings()
    .then((fullSettings) => {
        var { appSettings } = fullSettings;
        res.send({
          clientSettings: appSettings.toClientSettings()
        });
      },
      (e: Error) => {
        console.log('error:', e.message);
        if (e.hasOwnProperty('stack')) {
          console.log((<any>e).stack);
        }
        res.status(500).send({
          error: 'could not compute',
          message: e.message
        });
      }
    )
    .done();

});

export = router;
