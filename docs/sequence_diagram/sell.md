# 판매 시퀀스 다이어그램

```mermaid
sequenceDiagram
    actor Player
    participant Storage
    participant Transport
    participant TurnSystem
    participant Market

    Player->>Storage: 판매 상품 선택
    Player->>Storage: 판매 수량 선택

    Player->>Storage: 상품 출고 요청
    Storage->>Transport: LoadProduct(product, quantity)
    Transport-->>Player: 적재 완료

    Player->>TurnSystem: EndTurn()

    TurnSystem->>Market: 판매 처리 요청
    Market->>Transport: 판매 상품 확인
    Transport-->>Market: 상품 및 수량 전달

    Market->>Transport: 판매 상품 차감
    Market->>Player: AddMoney(amount)

    Market-->>TurnSystem: 판매 완료
    TurnSystem-->>Player: 턴 종료 및 판매 결과