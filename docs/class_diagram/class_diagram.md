# 클래스 다이어그램

## 1. 전체 구조

```mermaid
classDiagram

    %% =========================
    %% 주체
    %% =========================

    class Player
    class NPC
    class Bank
    class Employee

    %% =========================
    %% 거래 대상
    %% =========================

    class Resource
    class Asset
    class Product
    class Contract
    class FinancialProduct

    %% =========================
    %% 시스템
    %% =========================

    class Market
    class Production
    class Finance
    class Time
    class Settlement
    class Event
    class Progress

    %% =========================
    %% 주체 관계
    %% =========================

    Player --> Resource : 보유
    Player --> Asset : 소유
    Player --> Employee : 고용
    Player --> Contract : 계약
    Player --> FinancialProduct : 이용

    NPC --> Resource : 보유
    NPC --> Asset : 소유
    NPC --> Employee : 고용
    NPC --> Contract : 계약
    NPC --> FinancialProduct : 이용

    Bank --> FinancialProduct : 제공
    Bank --> Contract : 금융 계약

    Employee --> Contract : 고용 계약

    %% =========================
    %% 거래
    %% =========================

    Player --> Market : 거래
    NPC --> Market : 거래

    Market --> Resource : 거래 대상
    Market --> Product : 거래 대상
    Market --> Asset : 거래 대상

    %% =========================
    %% 생산
    %% =========================

    Production --> Resource : 소비
    Production --> Product : 생산
    Production --> Asset : 생산 기반

    Player --> Production : 생산 요청
    NPC --> Production : 생산 요청

    Employee --> Production : 노동 제공

    %% =========================
    %% 금융
    %% =========================

    Player --> Finance : 금융 이용
    NPC --> Finance : 금융 이용
    Bank --> Finance : 금융 처리

    Finance --> FinancialProduct : 금융 상품
    Finance --> Contract : 금융 계약

    %% =========================
    %% 시간
    %% =========================

    Time --> Production : 시간 경과
    Time --> Contract : 기간 경과
    Time --> Finance : 금융 처리
    Time --> Market : 시장 갱신
    Time --> Settlement : 결산 시점

    %% =========================
    %% 결산
    %% =========================

    Settlement --> Player : 결산 결과
    Settlement --> NPC : 경영 결과

    %% =========================
    %% 이벤트 / 진행
    %% =========================

    Event --> Market : 시장 변화
    Event --> Production : 생산 변화
    Event --> Finance : 금융 변화

    Progress --> Player : 진행 상태