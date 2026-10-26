// 계약 유형 식별자
export const ContractType = Object.freeze({
    Loan: 'Loan',
    Deposit: 'Deposit',
    Insurance: 'Insurance',
    Trade: 'Trade',
    Employment: 'Employment',
    Lease: 'Lease',
    SecuredLoan: 'SecuredLoan',
    Settlement: 'Settlement'
});

export const InterestRateType = Object.freeze({
    Variable: 'Variable',
    Fixed: 'Fixed'
});

// 계약서를 나타내는 클래스
export class Contract {
    constructor(contract_id, name, contractType, participants, content, period, progress, paymentCondition, penalty, terminationCondition, status, interestRate = 0.04, interestRateType = InterestRateType.Fixed) {
        this.Contract_Id = contract_id;
        this.Name = name;
        this.ContractType = contractType;
        this.InterestRate = interestRate;
        this.InterestRateType = interestRateType;
        this.Participants = participants;
        this.Content = content;
        this.Period = period;
        this.Progress = progress;
        this.PaymentCondition = paymentCondition;
        this.Penalty = penalty;
        this.TerminationCondition = terminationCondition;
        this.Status = status;
    }
}
