# 구매 시퀀스 다이어그램

```mermaid
sequenceDiagram
    actor Player
    participant Market
    participant Storage

    Player->>Market: 시장 방문
    Market-->>Player: 판매 상품 표시

    Player->>Market: 상품 선택
    Player->>Market: 구매 수량 입력
    Player->>Market: 구매 요청

    Market-->>Player: 구매 완료

    Market->>Player: 구매 금액 차감
    Market->>Storage: 구매 상품 저장