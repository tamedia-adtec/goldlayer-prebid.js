import { expect } from 'chai';
import { spec } from 'modules/goldlayerBidAdapter.js';
import { newBidder } from 'src/adapters/bidderFactory.js';
import * as bidderFactory from 'src/adapters/bidderFactory.js';
import { auctionManager } from 'src/auctionManager.js';
import { deepClone } from 'src/utils.js';
import { config } from 'src/config.js';
import { VIDEO } from 'src/mediaTypes.js';

const BIDDER_NAME = 'goldlayer'
const ENDPOINT = 'https://goldlayer-api.prod.gbads.net/bid/pbjs';

/* Eids */
let eids = [
  {
    source: 'goldbach.com',
    uids: [
      {
        id: '0d862e87-14e9-47a4-9e9b-886b7d7a9d1b',
        atype: 1,
        ext: { stype: 'ppuid' }
      }
    ]
  },
  {
    source: 'niceid.live',
    uids: [
      {
        id: '0d862e87-14e9-47a4-9e9b-886b7d7a9d1a',
        atype: 1,
        ext: { stype: 'ppuid' }
      }
    ]
  },
  {
    source: 'otherid.live',
    uids: [
      {
        id: '0d862e87-14e9-47a4-9e9b-886b7d7a9d1a',
        atype: 1,
        ext: { stype: 'other-id' }
      }
    ]
  }
];

/* Ortb2 bid information */
let ortb2 = {
  device: {
    ip: '133.713.371.337',
    connectiontype: 6,
    w: 1512,
    h: 982,
    ifa: '23575619-ef35-4908-b468-ffc4000cdf07',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    geo: {lat: 47.318054, lon: 8.582883, zip: '8700'}
  },
  site: {
    domain: 'publisher-page.ch',
    page: 'https://publisher-page.ch/home',
    publisher: { domain: 'publisher-page.ch' },
    ref: 'https://publisher-page.ch/home'
  },
  user: {
    ext: {
      eids: eids
    }
  }
};

/* Minimal bidderRequest */
let validBidderRequest = {
  auctionId: '7570fb24-810d-4c26-9f9c-acd0b6977f60',
  start: 1731680672810,
  auctionStart: 1731680672808,
  ortb2: ortb2,
  bidderCode: BIDDER_NAME,
  gdprConsent: {
    gdprApplies: true,
    consentString: 'trust-me-i-consent'
  },
  timeout: 300
};

/* Minimal validBidRequests */
let validBidRequests = [
  {
    bidder: BIDDER_NAME,
    adUnitCode: '/46753895/publisher.ch/inside-full-content-pos1/pbjs-test',
    adUnitId: 'c3400db6-c4c5-465e-bf67-1545751944b7',
    auctionId: '7570fb24-810d-4c26-9f9c-acd0b6977f60',
    bidId: '3d52a1909b972a',
    bidderRequestId: '2b63a1826ab946',
    userIdAsEids: eids,
    ortb2: ortb2,
    mediaTypes: {
      banner: {
        sizes: [[300, 50], [300, 250], [300, 600], [320, 50], [320, 480], [320, 64], [320, 160], [320, 416], [336, 280]]
      }
    },
    sizes: [[300, 50], [300, 250], [300, 600], [320, 50], [320, 480], [320, 64], [320, 160], [320, 416], [336, 280]],
    params: {
      publisherId: 'de-publisher.ch-ios',
      customTargeting: {
        language: 'de'
      }
    }
  },
  {
    bidder: BIDDER_NAME,
    adUnitCode: '/46753895/publisher.ch/inside-full-content-pos1/pbjs-test/video',
    adUnitId: 'c3400db6-c4c5-465e-bf67-1545751944b8',
    auctionId: '7570fb24-810d-4c26-9f9c-acd0b6977f60',
    bidId: '3d52a1909b972b',
    bidderRequestId: '2b63a1826ab946',
    userIdAsEids: eids,
    ortb2: ortb2,
    mediaTypes: {
      video: {
        sizes: [[640, 480]]
      }
    },
    sizes: [[640, 480]],
    params: {
      publisherId: 'de-publisher.ch-ios',
      video: {
        maxduration: 30,
      },
      customTargeting: {
        language: 'de'
      }
    }
  }
];

/* Creative request send to server */
let validCreativeRequest = {
  mock: false,
  debug: false,
  timestampStart: 1731680672811,
  timestampEnd: 1731680675811,
  config: {
    publisher: {
      id: 'de-20minuten.ch',
    },
  },
  gdpr: {},
  contextInfo: {
    contentUrl: 'http://127.0.0.1:5500/sample-request.html',
  },
  appInfo: {
    id: '127.0.0.1:5500',
  },
  userInfo: {
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    ifa: '23575619-ef35-4908-b468-ffc4000cdf07',
    ppid: [
      {
        source: 'oneid.live',
        id: '0d862e87-14e9-47a4-9e9b-886b7d7a9d1b',
      },
      {
        source: 'goldbach.com',
        id: 'aa07ead5044f47bb28894ffa0346ed2c',
      },
    ],
  },
  slots: [
    {
      id: '/46753895/publisher.ch/inside-full-content-pos1/pbjs-test',
      sizes: [
        [300, 50],
        [300, 250],
        [300, 600],
        [320, 50],
        [320, 480],
        [320, 64],
        [320, 160],
        [320, 416],
        [336, 280],
      ],
      targetings: {
        gpsenabled: 'false',
        fr: 'false',
        pagetype: 'story',
        darkmode: 'false',
        userloggedin: 'false',
        iosbuild: '24110',
        language: 'de',
        storyId: '103211763',
        connection: 'wifi',
      },
    },
    {
      id: '/46753895/publisher.ch/inside-full-content-pos1/pbjs-test/video',
      sizes: [[640, 480]],
      targetings: {
        gpsenabled: 'false',
        fr: 'false',
        pagetype: 'story',
        darkmode: 'false',
        userloggedin: 'false',
        iosbuild: '24110',
        language: 'de',
        storyId: '103211763',
        connection: 'wifi',
        duration: 'XL',
      },
    },
  ],
  targetings: {
    long: 8.582883,
    lat: 47.318054,
    connection: '4G',
    zip: '8700',
  },
};

/* Creative response received from server */
let validCreativeResponse = {
  creatives: {
    '/46753895/publisher.ch/inside-full-content-pos1/pbjs-test': [
      {
        cpm: 32.2,
        currency: 'USD',
        width: 1,
        height: 1,
        creativeId: '1',
        ttl: 3600,
        mediaType: 'native',
        netRevenue: true,
        ad: 'native-ad',
        meta: {
          advertiserDomains: ['example.com'],
          mediaType: 'native'
        }
      },
      {
        cpm: 21.9,
        currency: 'USD',
        width: 300,
        height: 50,
        creativeId: '2',
        ttl: 3600,
        mediaType: 'banner',
        netRevenue: true,
        ad: 'banner-ad',
        meta: {
          advertiserDomains: ['example.com'],
          mediaType: 'banner'
        }
      }
    ],
    '/46753895/publisher.ch/inside-full-content-pos1/pbjs-test/video': [
      {
        cpm: 44.2,
        currency: 'USD',
        width: 1,
        height: 1,
        creativeId: '3',
        ttl: 3600,
        mediaType: 'video',
        netRevenue: true,
        ad: 'video-ad',
        meta: {
          advertiserDomains: ['example.com'],
          mediaType: 'video'
        }
      }
    ],
  }
};

/* composed request */
let validRequest = {
  url: ENDPOINT,
  method: 'POST',
  data: validCreativeRequest,
  options: {
    contentType: 'application/json',
    withCredentials: false
  },
  bidderRequest: {
    ...validBidderRequest,
    bids: validBidRequests
  }
}

describe('GoldlayerBidAdapter', function () {
  const adapter = newBidder(spec);

  describe('inherited functions', function () {
    it('exists and is a function', function () {
      expect(adapter.callBids).to.exist.and.to.be.a('function');
    });
  });

  describe('isBidRequestValid', function () {
    let bid = {
      bidder: BIDDER_NAME,
      params: {
        publisherId: 'de-publisher.ch-ios',
      },
      adUnitCode: '/46753895/publisher.ch/inside-full-content-pos1/pbjs-test',
      sizes: [[300, 250], [300, 600]]
    };

    it('should return true when required params found', function () {
      expect(spec.isBidRequestValid(bid)).to.equal(true);
    });

    it('should return false when required params are not passed', function () {
      let invalidBid = Object.assign({}, bid);
      delete invalidBid.params;
      invalidBid.params = {
        publisherId: undefined
      };
      expect(spec.isBidRequestValid(invalidBid)).to.equal(false);
    });
  });

  describe('buildRequests', function () {
    let getAdUnitsStub;

    beforeEach(function() {
      getAdUnitsStub = sinon.stub(auctionManager, 'getAdUnits').callsFake(function() {
        return [];
      });
    });

    afterEach(function() {
      getAdUnitsStub.restore();
    });

    it('should use defined endpoint', function () {
      let bidRequests = deepClone(validBidRequests);
      let bidderRequest = deepClone(validBidderRequest);

      const requests = spec.buildRequests(bidRequests, bidderRequest);
      expect(requests.length).to.equal(1);
      expect(requests[0].url).to.equal(ENDPOINT);
    })

    it('should parse all bids to valid slots', function () {
      let bidRequests = deepClone(validBidRequests);
      let bidderRequest = deepClone(validBidderRequest);

      const requests = spec.buildRequests(bidRequests, bidderRequest);
      const payload = requests[0].data;

      expect(payload.slots).to.exist;
      expect(Array.isArray(payload.slots)).to.be.true;
      expect(payload.slots.length).to.equal(2);
      expect(payload.slots[0].id).to.equal(bidRequests[0].adUnitCode);
      expect(Array.isArray(payload.slots[0].sizes)).to.be.true;
      expect(payload.slots[0].sizes.length).to.equal(bidRequests[0].sizes.length);
      expect(payload.slots[1].id).to.equal(bidRequests[1].adUnitCode);
      expect(Array.isArray(payload.slots[1].sizes)).to.be.true;
    });

    it('should parse all video bids to valid video slots (use video sizes)', function () {
      let bidRequests = validBidRequests.map(request => Object.assign({}, []));
      let bidderRequest = deepClone(validBidderRequest);

      const requests = spec.buildRequests([{
        ...bidRequests[1],
        sizes: [],
        mediaTypes: {
          [VIDEO]: {
            sizes: []
          }
        }
      }], bidderRequest);
      const payload = requests[0].data;

      expect(payload.slots.length).to.equal(1);
      expect(payload.slots[0].sizes.length).to.equal(1);
      expect(payload.slots[0].sizes[0][0]).to.equal(640);
      expect(payload.slots[0].sizes[0][1]).to.equal(480);
    });

    it('should set timestamps on request', function () {
      let bidRequests = deepClone(validBidRequests);
      let bidderRequest = deepClone(validBidderRequest);

      const requests = spec.buildRequests(bidRequests, bidderRequest);
      const payload = requests[0].data;

      expect(payload.timestampStart).to.exist;
      expect(payload.timestampStart).to.be.greaterThan(1)
      expect(payload.timestampEnd).to.exist;
      expect(payload.timestampEnd).to.be.greaterThan(1)
    });

    it('should set config on request', function () {
      let bidRequests = deepClone(validBidRequests);
      let bidderRequest = deepClone(validBidderRequest);

      const requests = spec.buildRequests(bidRequests, bidderRequest);
      const payload = requests[0].data;

      expect(payload.config.publisher.id).to.equal(bidRequests[0].params.publisherId);
    });

    it('should set config on request', function () {
      let bidRequests = deepClone(validBidRequests);
      let bidderRequest = deepClone(validBidderRequest);

      const requests = spec.buildRequests(bidRequests, bidderRequest);
      const payload = requests[0].data;

      expect(payload.config.publisher.id).to.equal(bidRequests[0].params.publisherId);
    });

    it('should set gdpr on request', function () {
      let bidRequests = deepClone(validBidRequests);
      let bidderRequest = deepClone(validBidderRequest);

      const requests = spec.buildRequests(bidRequests, bidderRequest);
      const payload = requests[0].data;

      expect(payload.gdpr).to.exist;
      expect(payload.gdpr.consent).to.equal(bidderRequest.gdprConsent.gdprApplies);
      expect(payload.gdpr.consentString).to.equal(bidderRequest.gdprConsent.consentString);
    });

    it('should set contextInfo on request', function () {
      let bidRequests = deepClone(validBidRequests);
      let bidderRequest = deepClone(validBidderRequest);

      const requests = spec.buildRequests(bidRequests, bidderRequest);
      const payload = requests[0].data;

      expect(payload.contextInfo.contentUrl).to.exist;
      expect(payload.contextInfo.contentUrl).to.equal(bidderRequest.ortb2.site.page);
    });

    it('should set appInfo on request', function () {
      let bidRequests = deepClone(validBidRequests);
      let bidderRequest = deepClone(validBidderRequest);

      const requests = spec.buildRequests(bidRequests, bidderRequest);
      const payload = requests[0].data;

      expect(payload.appInfo.id).to.exist;
      expect(payload.appInfo.id).to.equal(bidderRequest.ortb2.site.domain);
    });

    it('should set userInfo on request', function () {
      let bidRequests = deepClone(validBidRequests);
      let bidderRequest = deepClone(validBidderRequest);

      const requests = spec.buildRequests(bidRequests, bidderRequest);
      const payload = requests[0].data;

      expect(payload.userInfo).to.exist;
      expect(payload.userInfo.ua).to.equal(bidderRequest.ortb2.device.ua);
      expect(payload.userInfo.ip).to.equal(bidderRequest.ortb2.device.ip);
      expect(payload.userInfo.ifa).to.equal(bidderRequest.ortb2.device.ifa);
      expect(Array.isArray(payload.userInfo.ppid)).to.be.true;
      expect(payload.userInfo.ppid.length).to.equal(2);
    });

    it('should set mapped general targetings on request', function () {
      let bidRequests = deepClone(validBidRequests);
      let bidderRequest = deepClone(validBidderRequest);

      const requests = spec.buildRequests(bidRequests, bidderRequest);
      const payload = requests[0].data;

      expect(payload.slots[0].targetings['duration']).to.not.exist;
      expect(payload.slots[1].targetings['duration']).to.exist;
      expect(payload.targetings['duration']).to.not.exist;
      expect(payload.targetings['lat']).to.exist;
      expect(payload.targetings['long']).to.exist;
      expect(payload.targetings['zip']).to.exist;
      expect(payload.targetings['connection']).to.exist;
    });

    it('should set mapped video duration targetings on request', function () {
      let bidRequests = deepClone(validBidRequests);
      let videoRequest = deepClone(validBidRequests[1]);
      let bidderRequest = deepClone(validBidderRequest);

      bidRequests.push({
        ...videoRequest,
        params: {
          ...videoRequest.params,
          video: {
            maxduration: 10
          }
        }
      })

      bidRequests.push({
        ...videoRequest,
        params: {
          ...videoRequest.params,
          video: {
            maxduration: 35
          }
        }
      })

      const requests = spec.buildRequests(bidRequests, bidderRequest);
      const payload = requests[0].data;

      expect(payload.slots[0].targetings['duration']).to.not.exist;
      expect(payload.slots[1].targetings['duration']).to.exist;
      expect(payload.slots[1].targetings['duration']).to.equal('XL');
      expect(payload.slots[2].targetings['duration']).to.equal('M');
      expect(payload.slots[3].targetings['duration']).to.equal('XXL');
    });

    it('should set mapped connection targetings on request', function () {
      let bidRequests = deepClone(validBidRequests);
      let bidderRequest = deepClone(validBidderRequest);

      const bidderRequestEthernet = deepClone(bidderRequest);
      bidderRequestEthernet.ortb2.device.connectiontype = 1;
      const payloadEthernet = spec.buildRequests(bidRequests, bidderRequestEthernet)[0].data;

      const bidderRequestWifi = deepClone(bidderRequest);
      bidderRequestWifi.ortb2.device.connectiontype = 2;
      const payloadWifi = spec.buildRequests(bidRequests, bidderRequestWifi)[0].data;

      const bidderRequest2G = deepClone(bidderRequest);
      bidderRequest2G.ortb2.device.connectiontype = 4;
      const payload2G = spec.buildRequests(bidRequests, bidderRequest2G)[0].data;

      const bidderRequest3G = deepClone(bidderRequest);
      bidderRequest3G.ortb2.device.connectiontype = 5;
      const payload3G = spec.buildRequests(bidRequests, bidderRequest3G)[0].data;

      const bidderRequest4G = deepClone(bidderRequest);
      bidderRequest4G.ortb2.device.connectiontype = 6;
      const payload4G = spec.buildRequests(bidRequests, bidderRequest4G)[0].data;

      const bidderRequestNoConnection = deepClone(bidderRequest);
      bidderRequestNoConnection.ortb2.device.connectiontype = undefined;
      const payloadNoConnection = spec.buildRequests(bidRequests, bidderRequestNoConnection)[0].data;

      expect(payloadEthernet.targetings['connection']).to.equal('ethernet');
      expect(payloadWifi.targetings['connection']).to.equal('wifi');
      expect(payload2G.targetings['connection']).to.equal('2G');
      expect(payload3G.targetings['connection']).to.equal('3G');
      expect(payload4G.targetings['connection']).to.equal('4G');
      expect(payloadNoConnection.targetings['connection']).to.equal(undefined);
    });

    it('should create a request with minimal information', function () {
      let bidderRequest = Object.assign({}, validBidderRequest);
      let bidRequests = validBidRequests.map(request => Object.assign({}, request));

      // Removing usable bidderRequest values
      bidderRequest.gdprConsent = undefined;
      bidderRequest.ortb2.device.connectiontype = undefined;
      bidderRequest.ortb2.device.geo = undefined;
      bidderRequest.ortb2.device.ip = undefined;
      bidderRequest.ortb2.device.ifa = undefined;
      bidderRequest.ortb2.device.ua = undefined;

      // Removing usable bidRequests values
      bidRequests = bidRequests.map(request => {
        request.ortb2.device.connectiontype = undefined;
        request.ortb2.device.geo = undefined;
        request.ortb2.device.ip = undefined;
        request.ortb2.device.ifa = undefined;
        request.ortb2.device.ua = undefined;
        request.userIdAsEids = undefined;
        request.params = {
          publisherId: 'de-publisher.ch-ios'
        };
        return request;
      });

      const requests = spec.buildRequests(bidRequests, bidderRequest);
      const payload = requests[0].data;

      // bidderRequest mappings
      expect(payload.gdpr).to.exist;
      expect(payload.gdpr.consent).to.not.exist;
      expect(payload.gdpr.consentString).to.not.exist;
      expect(payload.userInfo).to.exist;
      expect(payload.userInfo.ua).to.exist;
      expect(payload.userInfo.ip).to.not.exist;
      expect(payload.userInfo.ifa).to.not.exist;
      expect(payload.userInfo.ppid.length).to.equal(0);
      expect(payload.targetings).to.exist;
      expect(payload.targetings['connection']).to.not.exist;
      expect(payload.targetings['lat']).to.not.exist;
      expect(payload.targetings['long']).to.not.exist;
      expect(payload.targetings['zip']).to.not.exist;

      // bidRequests mapping
      expect(payload.slots).to.exist;
      expect(payload.slots.length).to.equal(2);
      expect(payload.slots[0].targetings).to.exist
      expect(payload.slots[1].targetings).to.exist
    });
  });

  describe('interpretResponse', function () {
    it('should map response to valid bids (amount)', function () {
      let request = deepClone(validRequest);
      let bidResponse = deepClone({body: validCreativeResponse});

      const response = spec.interpretResponse(bidResponse, request);

      expect(response).to.exist;
      expect(response.length).to.equal(3);
      expect(response.filter(bid => bid.requestId === validBidRequests[0].bidId).length).to.equal(2)
      expect(response.filter(bid => bid.requestId === validBidRequests[1].bidId).length).to.equal(1)
    });
  });
});
