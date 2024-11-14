---
layout: bidder
title: example
description: Prebid example Bidder Adapter
biddercode: example
aliasCode: fileContainingPBJSAdapterCodeIfDifferentThenBidderCode
tcfeu_supported: true/false
dsa_supported: true/false
gvl_id: none
usp_supported: true/false
coppa_supported: true/false
gpp_sids: tcfeu, tcfca, usnat, usstate_all, usp
schain_supported: true/false
dchain_supported: true/false
userId: (list of supported vendors)
media_types: banner, video, native
safeframes_ok: true/false
deals_supported: true/false
floors_supported: true/false
fpd_supported: true/false
pbjs: true/false
pbs: true/false
prebid_member: true/false
multiformat_supported: will-bid-on-any, will-bid-on-one, will-not-bid
ortb_blocking_supported: true/partial/false
privacy_sandbox: no or comma separated list of `paapi`, `topics`
sidebarType: 1
---
### Note

The Goldbach bidding adapter requires an individualized `'publisherId'` and approval from the Goldbach team. Please reach out to your account manager for more information.

### Bid Params

{: .table .table-bordered .table-striped }
| Name          | Scope    | Description              | Example                   | Type      |
|---------------|----------|--------------------------|---------------------------|-----------|
| `publisherId` | required | Publisher Environment ID | `'example.com_de_ios'`    |  `string` |