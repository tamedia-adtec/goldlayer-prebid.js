import * as utils from '../src/utils.js';
import {BANNER, NATIVE, VIDEO} from '../src/mediaTypes.js';
// import { config } from '../src/config.js';
import { registerBidder } from '../src/adapters/bidderFactory.js';

/* Constants */
const BIDDER_CODE = 'goldlayer';
const GVLID = 580;
const URL = 'https://goldlayer-api.prod.gbads.net/bid/pbjs';

/* Mapping */
const convertToProprietaryData = (validBidRequests, bidderRequest) => {
  const requestData = {
    mock: false,
    debug: true,
    config: {
      publisher: {
        id: undefined,
      }
    },
    gdpr: {
      consent: undefined,
      consentString: undefined,
    },
    contextInfo: {
      contentUrl: undefined,
      bidderResources: undefined,
    },
    appInfo: {
      id: undefined,
    },
    userInfo: {
      ip: undefined,
      ua: undefined,
      ifa: undefined,
      ppid: [],
    },
    slots: [],
    targetings: {},
  };

  // Set config
  if (validBidRequests[0]?.params?.publisherId) {
    requestData.config.publisher.id = validBidRequests[0].params.publisherId
  }

  // Set GDPR
  if (bidderRequest?.gdprConsent) {
    requestData.gdpr.consent = bidderRequest.gdprConsent.gdprApplies;
    requestData.gdpr.consentString = bidderRequest.gdprConsent.consentString;
  }

  // Set contextInfo
  requestData.contextInfo.contentUrl = bidderRequest.refererInfo.canonicalUrl || bidderRequest.refererInfo.topmostLocation;

  // Set appInfo
  requestData.appInfo.id = bidderRequest?.ortb2?.site?.domain;

  // Set userInfo
  requestData.userInfo.ip = undefined;
  requestData.userInfo.ifa = undefined;
  requestData.userInfo.ua = bidderRequest?.ortb2?.device?.ua;
  requestData.userInfo.ppid = []

  // Set slots
  requestData.slots = validBidRequests.map((bid) => {
    const slot = {
      id: bid?.adUnitCode,
      sizes: bid?.sizes,
      targetings: bid?.params?.customTargeting,
    };
    return slot;
  });

  return requestData;
}

const convertProprietaryResponseToBidResponses = (serverResponse, bidRequest) => {
  const bidRequests = bidRequest?.bidderRequest?.bids || [];
  const creativeGroups = serverResponse?.body?.creatives || {};

  return bidRequests.reduce((bidResponses, bidRequest) => {
    const matchingCreativeGroup = creativeGroups[bidRequest.adUnitCode] || [];
    const matchingBidResponses = matchingCreativeGroup.map((creative) => {
      return {
        requestId: bidRequest.bidId,
        cpm: creative.cpm,
        currency: creative.currency,
        width: creative.width,
        height: creative.height,
        creativeId: creative.creativeId,
        dealId: creative.dealId,
        netRevenue: creative.netRevenue,
        ttl: creative.ttl,
        ad: creative.ad,
        vastUrl: creative.vastUrl,
        vastXml: creative.vastXml,
        mediaType: creative.mediaType,
        meta: creative.meta,
      };
    });
    return [...bidResponses, ...matchingBidResponses];
  }, []);
}

export const spec = {
  code: BIDDER_CODE,
  gvlid: GVLID,
  supportedMediaTypes: [BANNER, VIDEO, NATIVE],
  isBidRequestValid: function (bid) {
    return typeof bid.params.publisherId === 'string';
  },
  buildRequests: function (validBidRequests, bidderRequest) {
    const data = convertToProprietaryData(validBidRequests, bidderRequest);
    utils.logInfo('Bidder request', bidderRequest);
    return [{
      method: 'POST',
      url: URL,
      data: data,
      bidderRequest: bidderRequest,
      options: {
        withCredentials: false,
        contentType: 'application/json',
      }
    }];
  },
  interpretResponse: function (serverResponse, request) {
    const bids = convertProprietaryResponseToBidResponses(serverResponse, request);
    return bids
  },
  // Skip for now
  getUserSyncs: function(syncOptions, serverResponses, gdprConsent, uspConsent) {},
  // Skip for now
  onTimeout: function(timeoutData) {},
  // Skip for now
  onBidWon: function(bid) {},
  // Skip for now
  onSetTargeting: function(bid) {
    utils.logInfo('Targeting set', bid);
  },
  // Forward error to logging server / endpoint
  onBidderError: function({ error, bidderRequest }) {
    utils.logError('Error in goldlayer adapter', error);
  },
  // Forward success to logging server / endpoint
  onAdRenderSucceeded: function(bid) {},
}

registerBidder(spec);
