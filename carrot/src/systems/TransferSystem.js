import { IExchangeParticipant } from '../domain/interfaces/IExchangeParticipant.js';
import { TransactionResult } from '../models/TransactionResult.js';

// 교환 주체 사이의 화폐 및 자원 이전을 검증하고 기록한다.
export class TransferSystem {
    constructor() {
        this.Transactions = [];
    }

    // 인자 3개는 화폐(from, to, amount), 인자 4개는 자원(from, to, resourceNumber, amount) 이전이다.
    Transfer(from, to, ...transferArguments) {
        if (transferArguments.length === 1) {
            return this.ExecuteTransfer(from, to, 'Money', null, transferArguments[0]);
        }

        if (transferArguments.length === 2) {
            const [resourceNumber, amount] = transferArguments;
            if (!Number.isInteger(resourceNumber) || resourceNumber <= 0) {
                return this.CreateResult(from, to, 'Resource', resourceNumber, amount, false,
                    '자원 번호는 양의 정수여야 합니다.');
            }
            return this.ExecuteTransfer(from, to, 'Resource', resourceNumber, amount);
        }

        return this.CreateResult(from, to, 'Unknown', null,
            transferArguments[transferArguments.length - 1], false,
            'Transfer() 인자 형식이 올바르지 않습니다.');
    }

    // 두 교환 주체의 공통 메서드만 사용해 이전을 처리한다.
    ExecuteTransfer(from, to, assetType, resourceNumber, amount) {
        if (!this.IsParticipant(from) || !this.IsParticipant(to)) {
            return this.CreateResult(from, to, assetType, resourceNumber, amount, false,
                '교환 주체가 IExchangeParticipant 규약을 구현하지 않았습니다.');
        }
        if (from === to) {
            return this.CreateResult(from, to, assetType, resourceNumber, amount, false,
                '송신자와 수신자는 서로 달라야 합니다.');
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            return this.CreateResult(from, to, assetType, resourceNumber, amount, false,
                '이전 수량은 유한한 양수여야 합니다.');
        }

        const getAsset = participant => assetType === 'Money'
            ? participant.getMoney()
            : participant.getResource(resourceNumber);
        const removeAsset = participant => assetType === 'Money'
            ? participant.removeMoney(amount)
            : participant.removeResource(resourceNumber, amount);
        const addAsset = participant => assetType === 'Money'
            ? participant.addMoney(amount)
            : participant.addResource(resourceNumber, amount);

        let fromBefore;
        let toBefore;
        try {
            fromBefore = getAsset(from);
            toBefore = getAsset(to);
        } catch {
            return this.CreateResult(from, to, assetType, resourceNumber, amount, false,
                '교환 주체의 자산을 조회할 수 없습니다.');
        }

        if (!Number.isFinite(fromBefore) || fromBefore < amount) {
            return this.CreateResult(from, to, assetType, resourceNumber, amount, false,
                assetType === 'Money' ? '송신자의 화폐가 부족합니다.' : '송신자의 자원이 부족합니다.');
        }
        if (!Number.isFinite(toBefore) || toBefore < 0) {
            return this.CreateResult(from, to, assetType, resourceNumber, amount, false,
                '수신자의 현재 자산을 확인할 수 없습니다.');
        }

        let removed = false;
        try {
            removed = removeAsset(from) === true;
        } catch {
            this.RestoreAsset(from, assetType, resourceNumber, fromBefore, getAsset);
            return this.CreateResult(from, to, assetType, resourceNumber, amount, false,
                '송신자의 자산 차감 중 오류가 발생했습니다.');
        }

        const fromAfterRemoval = this.ReadAsset(from, getAsset);
        if (!removed || fromAfterRemoval !== fromBefore - amount) {
            const restored = this.RestoreAsset(from, assetType, resourceNumber, fromBefore, getAsset);
            return this.CreateResult(from, to, assetType, resourceNumber, amount, false,
                restored ? '송신자의 자산 차감에 실패했습니다.' : '차감 실패 후 송신자 자산 복구에 실패했습니다.');
        }

        try {
            addAsset(to);
        } catch {
            const recipientRestored = this.RestoreAsset(to, assetType, resourceNumber, toBefore, getAsset);
            const senderRestored = this.RestoreAsset(from, assetType, resourceNumber, fromBefore, getAsset);
            return this.CreateResult(from, to, assetType, resourceNumber, amount, false,
                recipientRestored && senderRestored
                    ? '수신자의 자산 추가 중 오류가 발생해 이전을 취소했습니다.'
                    : '수신자의 자산 추가 실패 후 롤백이 완료되지 않았습니다.');
        }

        const toAfterAddition = this.ReadAsset(to, getAsset);
        if (toAfterAddition !== toBefore + amount) {
            const recipientRestored = this.RestoreAsset(to, assetType, resourceNumber, toBefore, getAsset);
            const senderRestored = this.RestoreAsset(from, assetType, resourceNumber, fromBefore, getAsset);
            return this.CreateResult(from, to, assetType, resourceNumber, amount, false,
                recipientRestored && senderRestored
                    ? '수신자의 자산 추가가 반영되지 않아 이전을 취소했습니다.'
                    : '수신자의 자산 추가 실패 후 롤백이 완료되지 않았습니다.');
        }

        return this.CreateResult(from, to, assetType, resourceNumber, amount, true, null);
    }

    // 규약 클래스 상속 및 필수 메서드 구현 여부를 확인한다.
    IsParticipant(participant) {
        const requiredMethods = [
            'getMoney', 'addMoney', 'removeMoney',
            'getResource', 'addResource', 'removeResource'
        ];
        return participant instanceof IExchangeParticipant &&
            requiredMethods.every(methodName =>
                typeof participant[methodName] === 'function' &&
                participant[methodName] !== IExchangeParticipant.prototype[methodName]
            );
    }

    // 자산 조회 오류를 실패 값으로 변환한다.
    ReadAsset(participant, getAsset) {
        try {
            return getAsset(participant);
        } catch {
            return NaN;
        }
    }

    // 교환 전 수량으로 자산을 되돌린다.
    RestoreAsset(participant, assetType, resourceNumber, expectedAmount, getAsset) {
        const currentAmount = this.ReadAsset(participant, getAsset);
        if (!Number.isFinite(currentAmount)) return false;
        if (currentAmount === expectedAmount) return true;

        const difference = Math.abs(expectedAmount - currentAmount);
        try {
            if (currentAmount > expectedAmount) {
                const removed = assetType === 'Money'
                    ? participant.removeMoney(difference)
                    : participant.removeResource(resourceNumber, difference);
                if (removed !== true) return false;
            } else if (assetType === 'Money') {
                participant.addMoney(difference);
            } else {
                participant.addResource(resourceNumber, difference);
            }
        } catch {
            return false;
        }
        return this.ReadAsset(participant, getAsset) === expectedAmount;
    }

    // 기존 TransactionResult에 교환 정보와 진단 메타데이터를 추가해 반환 및 기록한다.
    CreateResult(from, to, assetType, resourceNumber, amount, success, reason) {
        const resources = new Map();
        if (assetType === 'Resource' && resourceNumber != null && Number.isFinite(amount)) {
            resources.set(resourceNumber, amount);
        }

        const result = new TransactionResult(success, resources, assetType === 'Money' ? amount : 0);
        result.TransferType = assetType;
        result.ResourceNumber = resourceNumber;
        result.Amount = amount;
        result.From = this.GetParticipantIdentity(from);
        result.To = this.GetParticipantIdentity(to);
        result.Reason = reason;
        this.Transactions.push({
            TransferType: result.TransferType,
            ResourceNumber: result.ResourceNumber,
            Amount: result.Amount,
            From: result.From,
            To: result.To,
            Success: result.Success,
            Reason: result.Reason
        });
        return result;
    }

    // 기존 도메인 식별자를 우선 사용하고 없으면 클래스 이름으로 기록한다.
    GetParticipantIdentity(participant) {
        if (!participant || typeof participant !== 'object') return null;
        return {
            Type: participant.ActorType ?? participant.constructor?.name ?? 'Unknown',
            Id: participant.ActorId ?? participant.CustomerId ?? participant.Id ?? participant.Number ?? null
        };
    }
}
