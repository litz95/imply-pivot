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
import { Request } from 'express';
import { User } from '../../../common/models/index';
import { GetSettingsOptions, FullSettings } from '../settings-manager/settings-manager';

export interface PivotRequest extends Request {
  version: string;
  stateful: boolean;
  user: User;
  getFullSettings(opts?: GetSettingsOptions): Q.Promise<FullSettings>;
}
