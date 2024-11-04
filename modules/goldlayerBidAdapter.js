import * as utils from '../src/utils.js';
import {BANNER, NATIVE, VIDEO} from '../src/mediaTypes.js';
// import { config } from '../src/config.js';
import { registerBidder } from '../src/adapters/bidderFactory.js';

/* Constants */
const BIDDER_CODE = 'goldlayer';
const GVLID = 580;
// const URL = 'https://goldlayer-api.prod.gbads.net/bid/prebidjs';

/* Custom business logic */

export const spec = {
  code: BIDDER_CODE,
  gvlid: GVLID,
  supportedMediaTypes: [BANNER, VIDEO, NATIVE],
  isBidRequestValid: function (bid) {
    // Check all parameters that can be remapped to GL 

    // Check if the bid has all neccessary parameters for goldlayer
    utils.logInfo('isBidRequestValid', bid);
    return !!(bid.params.publisherId);
  },
  buildRequests: function (validBidRequests, bidderRequest) {
    // Transform prebidJS request into goldlayer request
    utils.logInfo('buildRequests', validBidRequests, bidderRequest);
  },
  // Skip for now
  getUserSyncs: function(syncOptions, serverResponses, gdprConsent, uspConsent) {},
  // Skip for now
  onTimeout: function(timeoutData) {},
  // Skip for now
  onBidWon: function(bid) {},
  // Skip for now
  onSetTargeting: function(bid) {},
  // Forward error to logging server / endpoint
  onBidderError: function({ error, bidderRequest }) {
    utils.logError('Error in goldlayer adapter', error);
  },
  // Forward success to logging server / endpoint
  onAdRenderSucceeded: function(bid) {},
}

registerBidder(spec);
