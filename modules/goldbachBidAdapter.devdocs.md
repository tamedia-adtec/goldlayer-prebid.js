---
layout: bidder
title: Goldbach
description: Goldbach Bidder Adapter
biddercode: goldbach
aliasCode: fileContainingPBJSAdapterCodeIfDifferentThenBidderCode
tcfeu_supported: true
dsa_supported: true/false
gvl_id: 580
usp_supported: false
coppa_supported: false
gpp_sids: tcfeu, tcfca, usnat, usstate_all, usp
schain_supported: true/false
dchain_supported: true/false
userId: goldbach.com, oneid.live
media_types: banner, video, native
safeframes_ok: true/false
deals_supported: true/false
floors_supported: false
fpd_supported: true/false
pbjs: true
pbs: false
prebid_member: true/false
multiformat_supported: will-bid-on-one
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
| `publisherId` | required | Publisher Environment ID | `example.com_de_ios`      |  `string` |
