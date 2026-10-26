# 자원 자산 관계도
```mermaid
flowchart LR

    subgraph RESOURCE[자원]
        RAW((자원, 공간))
        PRODUCT((상품))
        RAW -->|인력 + 시간| PRODUCT
    end

    MARKET[(시장)]

    subgraph ASSET[자산]
        GOODS((재화))
        BANK((은행))
        NPC((NPC))

        GOODS -->|금융 계약| BANK
        GOODS <-->|개인 계약| NPC
    end

    GOODS -->|구매 자금| MARKET
    MARKET -->|자원| RAW

    PRODUCT -->|상품 판매| MARKET
    MARKET -->|판매대금| GOODS