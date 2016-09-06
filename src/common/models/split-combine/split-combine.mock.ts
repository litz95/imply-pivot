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

import { SplitCombine, SplitCombineJS } from "./split-combine";
export class SplitCombineMock {
  public static get TIME_ONE_HOUR_JS(): SplitCombineJS {
    return {
        expression: { op: 'ref', name: 'time' },
        sortAction: {
          action: 'sort',
          direction: 'ascending',
          expression: {
            op: 'ref',
            name: 'time'
          }
        },
        limitAction: {
          action: 'limit',
          limit: 2
        },
      bucketAction: {
        "action": "timeBucket",
        "duration": "PT1H"
      }
    };
  }

  public static get TIME_ONE_DAY_JS(): SplitCombineJS {
    return {
      expression: { op: 'ref', name: 'time' },
      sortAction: {
        action: 'sort',
        direction: 'ascending',
        expression: {
          op: 'ref',
          name: 'time'
        }
      },
      limitAction: {
        action: 'limit',
        limit: 2
      },
      bucketAction: {
        "action": "timeBucket",
        "duration": "P1D"
      }
    };
  }


  public static get TIME_NO_BUCKET_JS() {
    return {
      expression: { op: 'ref', name: 'time' },
      sortAction: {
        action: 'sort',
        direction: 'ascending',
        expression: {
          op: 'ref',
          name: 'time'
        }
      },
      limitAction: {
        action: 'limit',
        limit: 2
      }
    };
  }

  static get LANGUAGE_JS(): SplitCombineJS {
    return {
      expression: { op: 'ref', name: 'language' }
    };
  }

  static get CHANNEL_JS(): SplitCombineJS {
    return {
      expression: { op: 'ref', name: 'channel' }
    };
  }

  static get BASIC_TIME_JS(): SplitCombineJS {
    return {
      expression: { op: 'ref', name: 'time' }
    };
  }

  static language() {
    return SplitCombine.fromJS(SplitCombineMock.LANGUAGE_JS);
  }

  static time() {
    return SplitCombine.fromJS(SplitCombineMock.TIME_ONE_HOUR_JS);
  }
}
