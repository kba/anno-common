# Algorithms

## DOI

TLA and AR have a field `doi` that is by default `null` and can be set to a DOI.

A user with a [doiMinter](acl#doiMinter) role may call the `mintDoi` method.

```
If TLA has no doi:
  Mint doi1 for URL of TLA
  TLA.doi := doi1
For AR in TLA.hasReply:
  If AR has no doi:
    Mint doiN for URL of AR
    AR.doi := doiN
```
