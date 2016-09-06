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

import { Splits, SplitsJS } from './splits';
import { SplitCombineMock } from "../split-combine/split-combine.mock";
import { SplitCombineJS } from "../split-combine/split-combine";

describe('Splits', () => {
  it('is an immutable class', () => {
    testImmutableClass<SplitsJS>(Splits, [
      [
        SplitCombineMock.LANGUAGE_JS
      ],
      [
        SplitCombineMock.TIME_ONE_HOUR_JS
      ],
      [
        SplitCombineMock.BASIC_TIME_JS,
        SplitCombineMock.BASIC_TIME_JS
      ]
    ]);
  });

  describe('equality-esque methods', () => {
    var splitOn = function(...args: any[]) {
      var lookups: Lookup<SplitCombineJS> = {
        'time/hour' : SplitCombineMock.TIME_ONE_HOUR_JS,
        'time/day' :  SplitCombineMock.TIME_ONE_DAY_JS,
        'time/none' : SplitCombineMock.TIME_NO_BUCKET_JS,
        'language' : SplitCombineMock.LANGUAGE_JS,
        'channel' : SplitCombineMock.CHANNEL_JS
      };
      return Splits.fromJS(args.map(s => lookups[s]));
    };

    var channel = Splits.fromJS([ SplitCombineMock.CHANNEL_JS ]);
    var language = Splits.fromJS([ SplitCombineMock.LANGUAGE_JS ]);

    it('#someSplitsAreDifferent & #allSplitsAreDifferent', () => {

      expect(splitOn('language', 'time/hour').someSplitsAreDifferent(splitOn('language', 'time/hour'))).to.equal(false);
      expect(splitOn('language', 'time/hour').allSplitsAreDifferent(splitOn('language', 'time/hour'))).to.equal(false);

      expect(splitOn('language', 'time/hour').someSplitsAreDifferent(splitOn('time/hour'))).to.equal(true);
      expect(splitOn('time/hour', 'language').allSplitsAreDifferent(splitOn('time/hour'))).to.equal(false);

      expect(splitOn('language').someSplitsAreDifferent(splitOn("channel"))).to.equal(true);
      expect(splitOn('language').allSplitsAreDifferent(splitOn("channel"))).to.equal(true);
    });

    it('#bucketingProfileHasChanged', () => {
      expect(splitOn('language', 'time/hour').bucketingProfileHasChanged(splitOn('language', 'time/hour'))).to.equal(false);
      expect(splitOn('language', 'time/hour').bucketingProfileHasChanged(splitOn('language'))).to.equal(true);

      expect(splitOn('language', 'time/day').bucketingProfileHasChanged(splitOn('language', 'time/hour'))).to.equal(false);
      expect(splitOn('language', 'time/hour').bucketingProfileHasChanged(splitOn('language', 'time/day'))).to.equal(false);
      expect(splitOn('language', 'time/hour').bucketingProfileHasChanged(splitOn('language', 'time/none'))).to.equal(true);
      expect(splitOn('language', 'time/none').bucketingProfileHasChanged(splitOn('language', 'time/hour'))).to.equal(true);

    });

  });
});
