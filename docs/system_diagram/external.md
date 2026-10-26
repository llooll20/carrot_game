# 플레이어 외부 상호작용 요소
```mermaid
flowchart LR
    NPC[NPC]

    subgraph P[플레이어]
        PRODUCT((상품))
        MONEY((재화))
    end

    MARKET[시장]
    BANK[은행]

    NPC -->|계약| PRODUCT
    NPC --> MONEY
    PRODUCT -->|판매| MARKET
    MARKET -->|구매| MONEY
    MONEY -->|금융| BANK