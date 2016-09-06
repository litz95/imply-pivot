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
import { testImmutableClass } from 'immutable-class-tester';

import { $, Expression } from 'plywood';
import { SplitCombine, SplitCombineJS } from './split-combine';
import { SplitCombineMock } from "./split-combine.mock";

describe('SplitCombine', () => {
  it('is an immutable class', () => {
    testImmutableClass<SplitCombineJS>(SplitCombine, [
      {
        expression: { op: 'ref', name: 'language' }
      },
      {
        expression: { op: 'ref', name: 'lookup' }
      },
      {
        expression: { op: 'ref', name: 'time' },
        bucketAction: {
          action: 'in',
          expression: {
            'op': 'literal',
            'value': { 'setType': 'STRING', 'elements': ['he'] },
            'type': 'SET'
          }
        },
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
      }
    ]);
  });

  it('equals ignore specific granularity', () => {
    var hour = SplitCombine.fromJS(SplitCombineMock.TIME_ONE_HOUR_JS);
    var day = SplitCombine.fromJS(SplitCombineMock.TIME_ONE_DAY_JS);
    var none = SplitCombine.fromJS(SplitCombineMock.TIME_NO_BUCKET_JS);
    expect(hour.equalsIgnoreSpecificGranularity(day), 'hour and day have same bucketing profile').to.equal(true);
    expect(day.equalsIgnoreSpecificGranularity(hour), 'changing from hour to day does not affect bucketing profile').to.equal(true);
    expect(day.equalsIgnoreSpecificGranularity(none), 'changing from hour to day does not affect bucketing profile').to.equal(false);
    expect(hour.equalsIgnoreSpecificGranularity(none), 'changing from hour to day does not affect bucketing profile').to.equal(false);

  });

});
