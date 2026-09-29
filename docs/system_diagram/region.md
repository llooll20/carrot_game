# 플레이어 활동 지역 요소
```mermaid
flowchart TB
    subgraph REGION[플레이어 활동 지역]
        subgraph PRODUCTION[생산]
            LAND[토지]
            WORKSHOP[작업장]
            FACTORY[공장]
            CRAFT[공방]
        end

        STORAGE[저장소]
        TRANSPORT[운송]

        subgraph OFFICE[사무실]
            STATUS[현황 확인]
            ADVICE[조언]
            CONTRACT[계약]
            CREDIT[신용도]
        end

        PRODUCTION --> STORAGE
        STORAGE --> TRANSPORT
    end

    PURCHASE[구매]
    MARKET[시장]

    PURCHASE -->|구매| STORAGE
    TRANSPORT -->|판매| MARKET