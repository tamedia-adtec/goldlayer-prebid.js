import * as utils from '../src/utils.js';
import {BANNER, NATIVE, VIDEO} from '../src/mediaTypes.js';
import { config } from '../src/config.js';
import { registerBidder } from '../src/adapters/bidderFactory.js';

/* Constants */
const BIDDER_CODE = 'goldlayer';
const GVLID = 580;
const URL = 'https://goldlayer-api.prod.gbads.net/bid/prebidjs';

/* Custom business logic */

export const spec = {
  code: BIDDER_CODE,
  gvlid: GVLID,
  supportedMediaTypes: [BANNER, VIDEO, NATIVE],
  isBidRequestValid: function (bid) {
    // Check if the bid has all neccessary parameters for goldlayer
    console.log('isBidRequestValid', bid);
    return !!(bid.params.publisherId);
  },
  buildRequests: function (validBidRequests, bidderRequest) {
    // Transform prebidJS request into goldlayer request
    console.log('buildRequests', validBidRequests, bidderRequest);
  },
  getUserSyncs: function(syncOptions, serverResponses, gdprConsent, uspConsent) {},
  onTimeout: function(timeoutData) {},
  onBidWon: function(bid) {},
  onSetTargeting: function(bid) {},
  onBidderError: function({ error, bidderRequest }) {},
  onAdRenderSucceeded: function(bid) {},
}

registerBidder(spec);
