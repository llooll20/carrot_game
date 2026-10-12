// 계약서를 나타내는 클래스
export class Contract {
    constructor(contract_id, name, contractType, participants, content, period, progress, paymentCondition, penalty, terminationCondition, status) {
        this.Contract_Id = contract_id;
        this.Name = name;
        this.ContractType = contractType;
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
