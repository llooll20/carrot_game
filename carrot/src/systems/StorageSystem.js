//저장공간 처리 시스템
export class StorageSystem {
    constructor(player, dataManager) {
        this.Player = player;
        this.DataManager = dataManager;

        // 폐기 예정 자원
        this.PendingDisposals = new Map();
    }
    // 자원 폐기 지정
    SetDisposal(resourceNumber, amount) {
        if (amount <= 0) {
            return false;
        }

        const currentAmount =
            this.Player.Resources.get(resourceNumber) ?? 0;

        const pendingAmount =
            this.PendingDisposals.get(resourceNumber) ?? 0;

        // 이미 폐기 지정된 수량을 제외하고 검사
        if (currentAmount - pendingAmount < amount) {
            return false;
        }

        this.PendingDisposals.set(
            resourceNumber,
            pendingAmount + amount
        );

        return true;
    }

    // 폐기 지정 취소
    CancelDisposal(resourceNumber, amount) {
        const pendingAmount =
            this.PendingDisposals.get(resourceNumber) ?? 0;

        if (amount <= 0 || amount > pendingAmount) {
            return false;
        }

        const remainingAmount = pendingAmount - amount;

        if (remainingAmount === 0) {
            this.PendingDisposals.delete(resourceNumber);
        } else {
            this.PendingDisposals.set(
                resourceNumber,
                remainingAmount
            );
        }

        return true;
    }

    // 턴 종료 시 폐기 처리
    ProcessDisposals() {
        if(!this.PendingDisposals)
            return 0;
        for (const [resourceNumber, amount] of this.PendingDisposals) {
            const currentAmount = this.Player.Resources.get(resourceNumber) ?? 0;

            // 현재 보유량 확인
            if (currentAmount < amount) {
                continue;
            }

            // 자원 정보 및 단가 조회
            const resource =
                this.DataManager.GetResource(resourceNumber);

            if (!resource) {
                continue;
            }

            const marketItem =
                this.DataManager.GetMarketData(resourceNumber);

            if (!marketItem) {
                continue;
            }

            // 폐기 비용 = 수량 × 자원 단가 × 1/2
            const disposalCost = amount * marketItem.Price * 0.5;

            // 비용 지불 가능 여부 확인
            if (this.Player.Money < disposalCost) {
                console.log("비용지급 불가!!");
                continue;
            }

            // 비용 지불 및 자원 제거
            this.Player.Money -= disposalCost;
            this.Player.Resources.set(
                resourceNumber,
                currentAmount - amount
            );
        }

        // 처리 완료 후 폐기 목록 초기화
        this.PendingDisposals.clear();
    }

    // 저장 공간 초과 검사 및 벌금 부과
    CheckStorageCapacity() {
        const excessAmount = Math.max(
            0,
            this.Player.CurrentAmount -
            this.Player.CurrentTotalCapacity
        );
        console.log(`벌금 계산시 플레이어 자원량`,this.Player.CurrentAmount);
        console.log(`벌금 계산시 플레이어 총자원량`,this.Player.CurrentTotalCapacity);

        // 초과 공간이 없다면 벌금 없음
        if (excessAmount === 0) {
            return 0;
        }

        // 초과 공간 1단위당 벌금
        const finePerUnit = 100;

        const fine = excessAmount * finePerUnit;

        this.Player.Money -= fine;

        console.log(`저장 공간 초과량: ${excessAmount}`);
        console.log(`저장 공간 초과 벌금: ${fine}`);

        return fine;
    }
}