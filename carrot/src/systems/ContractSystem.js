import { Contract } from '../models/Contract.js';
import { TransferSystem } from './TransferSystem.js';

// 계약 생성과 참여자별 계약 목록을 관리하는 시스템
export class ContractSystem {
    // 계약 데이터와 다음 계약 ID를 초기화한다.
    constructor(contractData = []) {
        this.ContractData = contractData;
        this.Contracts = contractData;
        this.Contractors = new Map();
        this.TransferSystem = new TransferSystem();
        this.Latest_Id = contractData.reduce(
            (latestId, contract) => Math.max(latestId, contract.Contract_Id ?? 0),
            0
        );
    }

    // 입력한 조건으로 새 계약을 만들고 데이터에 추가한다.
    CreateContract(
        name, contractType, seller, buyer, guarantor, action, resourceNumber,
        amount, frequency, duration, paymentCondition, penaltyType,
        penaltyAmount, penaltyResourceNumber, penaltyDescription,
        terminationType, termination1ActorRole, termination1Action,
        termination1ResourceNumber, termination1Amount, termination1TargetRole,
        termination2ActorRole, termination2Action, termination2Amount,
        termination2ResourceNumber, termination2TargetRole,
        interestRate = 0.04, interestRateType = 'Fixed'
    ) {
        const contract = new Contract(
            ++this.Latest_Id,
            name,
            contractType,
            {
                Parties: [
                    this.CreateParty(seller, 'Seller', 'Player'),
                    this.CreateParty(buyer, 'Buyer', 'NPC')
                ],
                Guarantor: this.CreateActor(guarantor, 'NPC')
            },
            {
                Action: action,
                ResourceNumber: resourceNumber,
                Amount: amount,
                From: 'Seller',
                To: 'Buyer',
                Frequency: frequency
            },
            { Duration: duration, Unit: 'Month' },
            { CompletedPeriods: 0 },
            { Type: paymentCondition },
            {
                Type: penaltyType,
                Amount: penaltyAmount,
                ResourceNumber: penaltyResourceNumber,
                Description: penaltyDescription
            },
            {
                Type: terminationType,
                Conditions: [
                    {
                        ActorRole: termination1ActorRole,
                        Action: termination1Action,
                        ResourceNumber: termination1ResourceNumber,
                        Amount: termination1Amount,
                        TargetRole: termination1TargetRole
                    },
                    {
                        ActorRole: termination2ActorRole,
                        Action: termination2Action,
                        ResourceNumber: termination2ResourceNumber,
                        Amount: termination2Amount,
                        TargetRole: termination2TargetRole
                    }
                ]
            },
            'Scheduled',
            interestRate,
            interestRateType
        );

        this.Contracts.push(contract);
        this.SaveContractData();
        return contract;
    }

    // 참여자의 계약을 승인하고 계약 상태를 진행 중으로 변경한다.
    ApproveContract(contractor, contract) {
        const targetContract = contract ?? this.Contracts.find(item =>
            item.Status === 'Scheduled' && this.IsParticipant(item, contractor)
        );

        if (!targetContract || targetContract.Status !== 'Scheduled' ||
            !this.IsParticipant(targetContract, contractor)) {
            return false;
        }

        if (!Array.isArray(contractor.Contracts)) {
            contractor.Contracts = [];
        }

        const contractorContract = contractor.Contracts.find(
            item => item.ContractId === targetContract.Contract_Id
        );
        if (contractorContract) {
            contractorContract.Status = targetContract.Status;
        } else {
            contractor.Contracts.push({
                ContractId: targetContract.Contract_Id,
                Status: targetContract.Status
            });
        }

        this.Contractors.set(this.GetActorKey(contractor), contractor);
        targetContract.Status = 'InProgress';
        contractor.Contracts.find(
            item => item.ContractId === targetContract.Contract_Id
        ).Status = targetContract.Status;
        this.SaveContractData();
        return true;
    }

    // 참여자가 보유한 계약 목록을 반환한다.
    GetPlayerContracts(contractor) {
        return Array.isArray(contractor?.Contracts) ? contractor.Contracts : [];
    }

    // 계약 진행도를 확인하고 완료 조건을 만족하면 계약을 완료한다.
    UpdateContractStatus(contract) {
        if (!contract || contract.Status !== 'InProgress') {
            return false;
        }

        if (contract.Progress?.CompletedPeriods >= contract.Period?.Duration) {
            const contractor = contract.Participants?.Parties
                .map(party => this.FindContractor(party))
                .find(Boolean);
            return this.CompleteContract(contract, contractor);
        }

        // 계약 이행 가능 여부를 판단할 참여자 자원/거래 처리가 아직 연결되지 않았다.
        return false;
    }

    // 월의 마지막 턴에 진행 중인 계약의 이행 기간을 처리한다.
    ProgressContracts() {
        const results = [];
        for (const contract of this.Contracts) {
            if (!contract || contract.Status !== 'InProgress' ||
                !Number.isFinite(contract.Period?.Duration) ||
                !Number.isFinite(contract.Progress?.CompletedPeriods) ||
                contract.Progress.CompletedPeriods >= contract.Period.Duration) {
                continue;
            }

            const content = contract.Content;
            if (!content || (content.Amount == null && content.ResourceNumber == null)) {
                continue;
            }

            const transferResult = content.ResourceNumber != null
                ? this.TransferContractResource(contract, content.ResourceNumber, content.Amount)
                : this.TransferContractMoney(contract, content.Amount);
            if (!transferResult.Success) {
                results.push({
                    Contract_Id: contract.Contract_Id,
                    Updated: false,
                    Completed: false,
                    Reason: transferResult.Reason
                });
                continue;
            }

            contract.Progress.CompletedPeriods += 1;
            results.push({
                Contract_Id: contract.Contract_Id,
                Updated: true,
                Completed: this.UpdateContractStatus(contract),
                Reason: null
            });
        }
        if (results.some(result => result.Updated)) this.SaveContractData();
        return results;
    }

    // 계약 Content에 명시된 역할 사이에서 금액을 이전한다.
    TransferContractMoney(contract, amount) {
        const { from, to } = this.GetContractTransferParticipants(contract);
        return this.TransferSystem.Transfer(from, to, amount);
    }

    // 계약 Content에 명시된 역할 사이에서 자원을 이전한다.
    TransferContractResource(contract, resourceNumber, amount) {
        const { from, to } = this.GetContractTransferParticipants(contract);
        return this.TransferSystem.Transfer(from, to, resourceNumber, amount);
    }

    // Content.From/To 역할에 해당하는 계약 당사자 객체를 찾는다.
    GetContractTransferParticipants(contract) {
        const parties = contract?.Participants?.Parties;
        const content = contract?.Content;
        const fromActor = Array.isArray(parties)
            ? parties.find(party => party?.Role === content?.From)
            : null;
        const toActor = Array.isArray(parties)
            ? parties.find(party => party?.Role === content?.To)
            : null;
        return {
            from: this.FindContractor(fromActor),
            to: this.FindContractor(toActor)
        };
    }

    // 계약 해지 조건을 확인하고 해지를 처리한다.
    CancelContract(contract) {
        if (!contract || contract.Status !== 'InProgress' ||
            contract.TerminationCondition?.Conditions?.length === 0) {
            return false;
        }

        // 조건의 실제 이행을 확인할 거래 처리가 연결되지 않아 취소를 확정할 수 없다.
        return false;
    }

    // 원 계약의 패널티 조건으로 패널티 계약을 생성한다.
    CreatePenaltyContract(contract, contractor) {
        if (!contract?.Penalty || !contractor) {
            return false;
        }

        // 패널티 계약의 당사자 및 이행 처리가 명세에 정의되지 않았다.
        return false;
    }

    // 계약 상태를 완료로 바꾸고 참여자의 계약 목록에 반영한다.
    CompleteContract(contract, contractor) {
        if (!contract || !contractor || contract.Status !== 'InProgress') {
            return false;
        }

        contract.Status = 'Completed';
        const contractorContract = contractor.Contracts?.find(
            item => item.ContractId === contract.Contract_Id
        );
        if (contractorContract) {
            contractorContract.Status = contract.Status;
        }
        this.SaveContractData();
        return true;
    }

    // 참여자 정보를 역할이 포함된 계약 당사자 형식으로 만든다.
    CreateParty(actor, role, defaultActorType) {
        return { ...this.CreateActor(actor, defaultActorType), Role: role };
    }

    // 참여자 정보를 계약 당사자 형식으로 변환한다.
    CreateActor(actor, defaultActorType) {
        if (actor && typeof actor === 'object') {
            return {
                ActorType: actor.ActorType ?? defaultActorType,
                ActorId: actor.ActorId ?? actor.Id ?? actor.Number
            };
        }

        return { ActorType: defaultActorType, ActorId: actor };
    }

    // 참여자가 해당 계약 당사자인지 확인한다.
    IsParticipant(contract, contractor) {
        if (!contract?.Participants?.Parties || !contractor) {
            return false;
        }

        const actorId = contractor.ActorId ?? contractor.CustomerId ?? contractor.Id ?? contractor.Number;
        const actorType = contractor.ActorType ?? (contractor.Credit !== undefined ? 'Player' : 'NPC');

        return contract.Participants.Parties.some(party =>
            party.ActorId === actorId && party.ActorType === actorType
        );
    }

    // 참여자 정보에 해당하는 게임 주체를 찾는다.
    FindContractor(actor) {
        return this.Contractors.get(this.GetActorKey(actor));
    }

    // 주체 유형과 ID를 조합해 식별 키를 만든다.
    GetActorKey(actor) {
        return `${actor?.ActorType}:${actor?.ActorId ?? actor?.CustomerId ?? actor?.Id ?? actor?.Number}`;
    }

    // 현재 계약 데이터 스냅샷을 브라우저 저장소에 기록한다.
    SaveContractData() {
        if (typeof localStorage === 'undefined') {
            return false;
        }

        try {
            localStorage.setItem('ContractData', JSON.stringify(this.Contracts));
            return true;
        } catch {
            return false;
        }
    }
}
