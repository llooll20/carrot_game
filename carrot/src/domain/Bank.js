// 은행의 자금, 고객 및 금융 계약을 관리하고 대출·예금·보험 처리를 담당한다.
import { Contract } from '../models/Contract.js';
import { IExchangeParticipant } from './interfaces/IExchangeParticipant.js';

export class Bank extends IExchangeParticipant {
    // 은행의 초기 자금과 기본 금리를 설정하고 관리 목록을 초기화한다.
    constructor(funds = 0, baseInterestRates = 0.04) {
        super();
        // 은행이 보유한 자금
        this.Funds = funds;
        // 교환 인터페이스 호환용 자원 보유량(은행 자원 시스템은 미구현)
        this.Resources = new Map();
        // 은행이 제공하는 대출, 예금, 보험 계약 목록
        this.LoanProducts = [];
        this.DepositProducts = [];
        this.InsuranceProducts = [];
        // 기본 금리와 대출·예금 금리
        this.BaseInterestRates = baseInterestRates;
        this.LoanInterestRate = baseInterestRates;
        this.DepositInterestRate = baseInterestRates;
        // 고객별 대출 및 예금 원금 잔액
        this.LoanBalances = new Map();
        this.DepositBalances = new Map();
        // 은행의 전체 계약과 등록 고객
        this.Contracts = [];
        this.Customer = new Map();
        // 고객 및 계약 ID 발급을 위한 다음 번호
        this.NextCustomerId = 1;
        this.LatestContractId = 0;
    }

    getMoney() {
        return this.Funds;
    }

    addMoney(amount) {
        if (Number.isFinite(amount) && amount > 0) this.Funds += amount;
    }

    removeMoney(amount) {
        if (!Number.isFinite(amount) || amount <= 0 || this.Funds < amount) return false;
        this.Funds -= amount;
        return true;
    }

    getResource(resourceNumber) {
        return this.Resources.get(resourceNumber) ?? 0;
    }

    addResource(resourceNumber, amount) {
        if (resourceNumber == null || !Number.isFinite(amount) || amount <= 0) return;
        this.Resources.set(resourceNumber, this.getResource(resourceNumber) + amount);
    }

    removeResource(resourceNumber, amount) {
        const currentAmount = this.getResource(resourceNumber);
        if (!Number.isFinite(amount) || amount <= 0 || currentAmount < amount) return false;
        this.Resources.set(resourceNumber, currentAmount - amount);
        return true;
    }

    // 신용 등급과 은행 자금을 확인한 뒤 고객에게 대출한다.
    IssueLoan(customer, loan_amount) {
        const customerId = this.GetCustomerId(customer);
        const creditRating = customer?.CreditRating;
        if (!this.Customer.has(customerId) || !Number.isFinite(loan_amount) || loan_amount <= 0 ||
            ![2, 3].includes(creditRating) || this.Funds < loan_amount) {
            return false;
        }

        const contract = this.CreateFinancialContract(customer, 'Loan', loan_amount, 'MonthlyInterest');
        if (!contract) return false;

        this.Funds -= loan_amount;
        customer.Money = (customer.Money ?? 0) + loan_amount;
        this.LoanBalances.set(customerId, (this.LoanBalances.get(customerId) ?? 0) + loan_amount);
        this.LoanProducts.push(contract);
        return true;
    }

    // 고객의 대출 원금을 상환받고 전액 상환 시 신용 등급을 높인다.
    CollectLoanRepayment(customer, loan_amount) {
        const customerId = this.GetCustomerId(customer);
        const balance = this.LoanBalances.get(customerId) ?? 0;
        if (!this.Customer.has(customerId) || !Number.isFinite(loan_amount) || loan_amount <= 0 ||
            loan_amount > balance || (customer.Money ?? 0) < loan_amount) {
            return false;
        }

        customer.Money -= loan_amount;
        this.Funds += loan_amount;
        const remainingBalance = balance - loan_amount;
        this.LoanBalances.set(customerId, remainingBalance);
        if (remainingBalance === 0) this.IncreaseCreditRating(customer);
        return true;
    }

    // 고객의 예금을 받아 잔액과 은행 자금에 반영한다.
    AcceptDeposit(customer, deposit_amount) {
        const customerId = this.GetCustomerId(customer);
        if (!this.Customer.has(customerId) || !Number.isFinite(deposit_amount) || deposit_amount <= 0 ||
            (customer.Money ?? 0) < deposit_amount) {
            return false;
        }

        const contract = this.CreateFinancialContract(customer, 'Deposit', deposit_amount, 'MonthlyInterest');
        if (!contract) return false;
        customer.Money -= deposit_amount;
        this.Funds += deposit_amount;
        this.DepositBalances.set(customerId, (this.DepositBalances.get(customerId) ?? 0) + deposit_amount);
        this.DepositProducts.push(contract);
        return true;
    }

    // 고객 예금 잔액에 대한 이자를 지급한다.
    PayDepositInterest(customer) {
        const customerId = this.GetCustomerId(customer);
        const balance = this.DepositBalances.get(customerId) ?? 0;
        const interest = balance * this.DepositInterestRate;
        if (!this.Customer.has(customerId) || balance <= 0 || this.Funds < interest) return false;
        customer.Money = (customer.Money ?? 0) + interest;
        this.Funds -= interest;
        return true;
    }

    // 계약 ID를 관리하며 계약을 은행 계약 목록에 등록한다.
    CreateContract(contract) {
        if (!(contract instanceof Contract) || this.Contracts.includes(contract)) return false;
        if (!Number.isFinite(contract.Contract_Id) || contract.Contract_Id <= 0) {
            contract.Contract_Id = ++this.LatestContractId;
        } else {
            this.LatestContractId = Math.max(this.LatestContractId, contract.Contract_Id);
        }
        this.Contracts.push(contract);
        return true;
    }

    // JSON에서 불러온 계약 중 은행 금융 계약을 목록에 등록한다.
    LoadContracts(contracts = []) {
        if (!Array.isArray(contracts)) return false;
        this.Contracts = contracts.filter(contract =>
            contract && contract.Contract_Id !== 1
        );
        this.LatestContractId = this.Contracts.reduce(
            (latestId, contract) => Math.max(latestId, contract.Contract_Id ?? 0),
            this.LatestContractId
        );
        return true;
    }

    // 진행 중인 보험 계약의 보험료를 고객에게서 받는다.
    CollectInsurancePremium(customer) {
        const contract = this.GetCustomerContracts(this.GetCustomerId(customer))
            .find(item => item.ContractType === 'Insurance' && item.Status === 'InProgress');
        const premium = contract?.Content?.Premium;
        if (!contract || !Number.isFinite(premium) || premium <= 0 || (customer.Money ?? 0) < premium) return false;
        customer.Money -= premium;
        this.Funds += premium;
        return true;
    }

    // 진행 중인 보험 계약에 정해진 보험금을 고객에게 지급한다.
    PayInsurancePayout(customer) {
        const contract = this.GetCustomerContracts(this.GetCustomerId(customer))
            .find(item => item.ContractType === 'Insurance' && item.Status === 'InProgress');
        const payout = contract?.Content?.Payout;
        if (!contract || !Number.isFinite(payout) || payout <= 0 || this.Funds < payout) return false;
        customer.Money = (customer.Money ?? 0) + payout;
        this.Funds -= payout;
        return true;
    }

    // 고객을 은행에 등록하고 식별자가 없으면 새 ID를 부여한다.
    AddCustomer(customer) {
        if (!customer || typeof customer !== 'object') return false;
        if (this.GetCustomerId(customer) === undefined || this.GetCustomerId(customer) === null) {
            customer.CustomerId = this.NextCustomerId++;
        }
        const customerId = this.GetCustomerId(customer);
        if (customerId === undefined || customerId === null || this.Customer.has(customerId)) return false;
        this.Customer.set(customerId, customer);
        return true;
    }

    // 고객을 은행의 등록 목록에서 제거한다.
    RemoveCustomer(customer) {
        const customerId = typeof customer === 'object' ? this.GetCustomerId(customer) : customer;
        return this.Customer.delete(customerId);
    }

    // 대출 금리와 예금 금리를 유효한 값으로 변경한다.
    UpdateInterestRate(loanRate = this.LoanInterestRate, depositRate = this.DepositInterestRate) {
        if (!Number.isFinite(loanRate) || loanRate < 0 || !Number.isFinite(depositRate) || depositRate < 0) return false;
        this.LoanInterestRate = loanRate;
        this.DepositInterestRate = depositRate;
        return true;
    }

    // 등록 고객이 지정한 예약 계약을 승인하고 진행 상태로 변경한다.
    ApproveContract(customer, contractId) {
        const contract = this.Contracts.find(item => item.Contract_Id === contractId);
        const customerId = this.GetCustomerId(customer);
        if (!contract || !this.Customer.has(customerId) || contract.Status !== 'Scheduled' ||
            !contract.Participants?.Parties?.some(party => party.ActorId === customerId)) return false;
        contract.Status = 'InProgress';
        if (Array.isArray(customer.Contracts)) {
            const playerContract = customer.Contracts.find(item => item.ContractId === contractId);
            if (playerContract) playerContract.Status = contract.Status;
            else customer.Contracts.push({ ContractId: contractId, Status: contract.Status });
        }
        return true;
    }

    // 지정 고객이 참여자로 등록된 계약 목록을 반환한다.
    GetCustomerContracts(customerId) {
        return this.Contracts.filter(contract =>
            contract.Participants?.Parties?.some(party => party.ActorId === customerId)
        );
    }

    // 아직 승인되지 않은 계약 목록을 반환한다.
    GetAvailableContracts() {
        return this.Contracts.filter(contract => contract.Status === 'Scheduled');
    }

    // 월말 대출 이자와 예금 이자 및 보험료를 처리한다.
    ProcessMonthlyFinance() {
        let processed = false;
        for (const [customerId, balance] of this.LoanBalances) {
            if (balance <= 0) continue;
            const customer = this.Customer.get(customerId);
            const interest = balance * this.LoanInterestRate;
            if (customer && (customer.Money ?? 0) >= interest) {
                customer.Money -= interest;
                this.Funds += interest;
                processed = true;
            }
        }
        for (const [customerId, balance] of this.DepositBalances) {
            if (balance > 0 && this.PayDepositInterest(this.Customer.get(customerId))) processed = true;
        }
        for (const customer of this.Customer.values()) {
            if (this.CollectInsurancePremium(customer)) processed = true;
        }
        return processed;
    }

    // 고객 객체 또는 ID에서 고객 식별자를 반환한다.
    GetCustomerId(customer) {
        return typeof customer === 'object' && customer !== null
            ? customer.CustomerId ?? customer.Id ?? customer.Number
            : customer;
    }

    // 대출 또는 예금 계약을 생성해 은행과 고객의 계약 목록에 등록한다.
    CreateFinancialContract(customer, type, amount, paymentType) {
        const customerId = this.GetCustomerId(customer);
        const contract = new Contract(
            ++this.LatestContractId,
            `${type} contract`,
            type,
            { Parties: [
                { ActorType: 'Customer', ActorId: customerId, Role: 'Customer' },
                { ActorType: 'Bank', ActorId: 1, Role: 'Bank' }
            ], Guarantor: null },
            { Action: null, ResourceNumber: null, Amount: amount, From: null, To: null, Frequency: null,
                InterestRate: type === 'Loan' ? this.LoanInterestRate : this.DepositInterestRate,
                PaymentCondition: paymentType },
            { Duration: null, Unit: 'Month' },
            { CompletedPeriods: 0 },
            { Type: paymentType },
            null,
            { Type: 'None', Conditions: [] },
            'InProgress'
        );
        if (!this.CreateContract(contract)) return false;
        if (Array.isArray(customer.Contracts)) {
            customer.Contracts.push({ ContractId: contract.Contract_Id, Status: contract.Status });
        }
        return contract;
    }

    // 전액 상환한 고객의 신용 등급을 최대 3까지 한 단계 높인다.
    IncreaseCreditRating(customer) {
        if (Number.isInteger(customer.CreditRating) && customer.CreditRating < 3) {
            customer.CreditRating++;
        }
    }
}
