import * as utils from '../src/utils.js';
import {BANNER, NATIVE, VIDEO} from '../src/mediaTypes.js';
import { registerBidder } from '../src/adapters/bidderFactory.js';

/* Constants */
const IS_LOCAL_MODE = false;
const BIDDER_CODE = 'goldlayer';
const GVLID = 580;
const URL = 'https://goldlayer-api.prod.gbads.net/bid/pbjs';
const URL_LOCAL = 'http://localhost:3000/bid/pbjs';
const TARGETING_KEYS = {
  // request level
  GEO_LAT: 'lat',
  GEO_LON: 'long',
  GEO_ZIP: 'zip',
  CONNECTION_TYPE: 'connection',
  // slot level
  VIDEO_DURATION: 'duration'
};

/* Mapping */
const convertToCustomTargeting = (bidderRequest) => {
  const customTargeting = {};

  // geo - lat/long
  if (bidderRequest?.ortb2?.device?.geo) {
    if (bidderRequest?.ortb2?.device?.geo?.lon) {
      customTargeting[TARGETING_KEYS.GEO_LON] = bidderRequest.ortb2.device.geo.lon;
    }
    if (bidderRequest?.ortb2?.device?.geo?.lat) {
      customTargeting[TARGETING_KEYS.GEO_LAT] = bidderRequest.ortb2.device.geo.lat;
    }
  }

  // connection
  if (bidderRequest?.ortb2?.device?.connectiontype) {
    switch (bidderRequest.ortb2.device.connectiontype) {
      case 1:
        customTargeting[TARGETING_KEYS.CONNECTION_TYPE] = 'ethernet';
        break;
      case 2:
        customTargeting[TARGETING_KEYS.CONNECTION_TYPE] = 'wifi';
        break;
      case 4:
        customTargeting[TARGETING_KEYS.CONNECTION_TYPE] = '2G';
        break;
      case 5:
        customTargeting[TARGETING_KEYS.CONNECTION_TYPE] = '3G';
        break;
      case 6:
        customTargeting[TARGETING_KEYS.CONNECTION_TYPE] = '4G';
        break;
    }
  }

  // zip
  if (bidderRequest?.ortb2?.device?.geo?.zip) {
    customTargeting[TARGETING_KEYS.GEO_ZIP] = bidderRequest.ortb2.device.geo.zip;
  }

  return customTargeting;
}

const convertToCustomSlotTargeting = (validBidRequest) => {
  const customTargeting = {};

  // video duration
  if (validBidRequest.mediaTypes?.[VIDEO]) {
    if (validBidRequest.params?.video?.maxduration) {
      const duration = validBidRequest.params?.video?.maxduration;
      if (duration <= 15) customTargeting[TARGETING_KEYS.VIDEO_DURATION] = 'M';
      if (duration > 15 && duration <= 30) customTargeting[TARGETING_KEYS.VIDEO_DURATION] = 'XL';
      if (duration > 30) customTargeting[TARGETING_KEYS.VIDEO_DURATION] = 'XXL';
    }
  }

  return customTargeting
}

const convertToProprietaryData = (validBidRequests, bidderRequest) => {
  const requestData = {
    mock: false,
    debug: true,
    timestampStart: undefined,
    timestampEnd: undefined,
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

  // Set timestamps
  requestData.timestampStart = Date.now();
  requestData.timestampEnd = Date.now() + (!isNaN(bidderRequest.timeout) ? Number(bidderRequest.timeout) : 0);

  // Set config
  if (validBidRequests[0]?.params?.publisherId) {
    requestData.config.publisher.id = validBidRequests[0].params.publisherId;
  }

  // Set GDPR
  if (bidderRequest?.gdprConsent) {
    requestData.gdpr.consent = bidderRequest.gdprConsent.gdprApplies;
    requestData.gdpr.consentString = bidderRequest.gdprConsent.consentString;
  }

  // Set contextInfo
  requestData.contextInfo.contentUrl = bidderRequest.refererInfo?.canonicalUrl || bidderRequest.refererInfo?.topmostLocation || bidderRequest?.ortb2?.site?.page;

  // Set appInfo
  requestData.appInfo.id = bidderRequest?.ortb2?.site?.domain || bidderRequest.refererInfo?.page;

  // Set userInfo
  requestData.userInfo.ip = bidderRequest?.ortb2?.device?.ip || navigator.ip;
  requestData.userInfo.ua = bidderRequest?.ortb2?.device?.ua || navigator.userAgent;

  // Set userInfo.ppid
  requestData.userInfo.ppid = (validBidRequests || []).reduce((ppids, validBidRequest) => {
    const extractedPpids = [];
    (validBidRequest.userIdAsEids || []).forEach((eid) => {
      (eid?.uids || []).forEach(uid => {
        if (uid?.ext?.stype === 'ppuid') {
          const isExistingInExtracted = !!extractedPpids.find(id => id.source === eid.source);
          const isExistingInPpids = !!ppids.find(id => id.source === eid.source);
          if (!isExistingInExtracted && !isExistingInPpids) extractedPpids.push({source: eid.source, id: uid.id});
        }
      });
    })
    return [...ppids, ...extractedPpids];
  }, []);

  // Set userInfo.ifa
  if (bidderRequest.ortb2?.device?.ifa) {
    requestData.userInfo.ifa = bidderRequest.ortb2.device.ifa;
  } else {
    requestData.userInfo.ifa = validBidRequests.find(validBidRequest => {
      return !!validBidRequest.ortb2?.device?.ifa;
    });
  }

  // Set slots
  requestData.slots = validBidRequests.map((validBidRequest) => {
    const slot = {
      id: validBidRequest?.adUnitCode,
      sizes: [
        ...validBidRequest?.sizes || [],
        ...(validBidRequest.mediaTypes?.[VIDEO] ? [[640, 480]] : [])
      ],
      targetings: {
        ...validBidRequest?.params?.customTargeting,
        ...convertToCustomSlotTargeting(validBidRequest)
      }
    };
    return slot;
  });

  // Set targetings
  requestData.targetings = convertToCustomTargeting(bidderRequest);

  return requestData;
}

const convertProprietaryResponseToBidResponses = (serverResponse, bidRequest) => {
  const bidRequests = bidRequest?.bidderRequest?.bids || [];
  const creativeGroups = serverResponse?.body?.creatives || {};

  utils.logInfo(bidRequest);

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
    return typeof bid.params.publisherId === 'string' && Array.isArray(bid.sizes);
  },
  buildRequests: function (validBidRequests, bidderRequest) {
    const url = IS_LOCAL_MODE ? URL_LOCAL : URL;
    const data = convertToProprietaryData(validBidRequests, bidderRequest);
    return [{
      method: 'POST',
      url: url,
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
