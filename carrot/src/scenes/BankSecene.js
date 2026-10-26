export class BankScene extends Phaser.Scene {
    constructor() {
        super('BankScene');
        this.productFilter = '전체';
        this.amountInput = '';
        this.focusedInput = false;
    }

    init(data) {
        this.player = data?.player;
        this.bank = data?.bank;
        this.dataManager = data?.dataManager;
        this.productFilter = '전체';
        this.amountInput = '';
        this.focusedInput = false;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        this.add.rectangle(width / 2, height / 2, width, height, 0x111318, 0.98);
        this.add.rectangle(width / 2, 56, width - 32, 88, 0x694a35)
            .setStrokeStyle(1, 0xb38a61);
        this.add.text(42, 27, '은행', { fontSize: '34px', color: '#ffffff', fontStyle: 'bold' });
        this.add.text(42, 68, '은행원과 대화하여 금융 업무를 처리하세요.', {
            fontSize: '18px', color: '#f2e7d9'
        });
        this.closeButton = this.makeButton(width - 120, 54, 150, 48, '닫기', () => this.closeScene(), 0x49372a);

        const leftX = 28;
        const leftWidth = Math.min(450, width * 0.36);
        const rightX = leftX + leftWidth + 22;
        const rightWidth = width - rightX - 28;
        this.drawLeftColumn(leftX, leftWidth, height);
        this.drawRightColumn(rightX, rightWidth, height);

        this.input.keyboard.on('keydown', this.handleAmountInput, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.refreshPlayerInfo();
    }

    drawLeftColumn(x, width, height) {
        this.drawPanel(x, 112, width, 204, '플레이어 정보');
        this.playerInfoText = this.add.text(x + 18, 156, '', {
            fontSize: '17px', color: '#f1eee8', lineSpacing: 7,
            wordWrap: { width: width - 36 }
        });

        const bankerY = 332;
        this.drawPanel(x, bankerY, width, height - bankerY - 26, '은행원');
        const portraitY = bankerY + 48;
        const portraitHeight = Math.max(130, height - bankerY - 190);
        this.add.rectangle(x + width / 2, portraitY + portraitHeight / 2, width - 36, portraitHeight, 0x282b2e)
            .setStrokeStyle(1, 0x68615a);
        this.add.text(x + width / 2, portraitY + portraitHeight / 2, '은행원 이미지', {
            fontSize: '17px', color: '#a9a39a'
        }).setOrigin(0.5);
        this.add.text(x + 20, portraitY + portraitHeight + 20, '은행원', {
            fontSize: '21px', color: '#ffffff', fontStyle: 'bold'
        });
        this.add.text(x + 20, portraitY + portraitHeight + 52, '무엇을 도와드릴까요?', {
            fontSize: '17px', color: '#d6d0c7'
        });
    }

    drawRightColumn(x, width, height) {
        this.add.text(x, 124, '금융 업무', { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' });
        const menuX = x;
        const menuWidth = Math.min(220, width * 0.38);
        const contentX = menuX + menuWidth + 16;
        const contentWidth = width - menuWidth - 16;
        const menuItems = [
            ['일반 입금', () => this.showDeposit(contentX, contentWidth)],
            ['일반 대출', () => this.showLoan(contentX, contentWidth)],
            ['금융 상품\n대출 · 예금 · 보험', () => this.showProducts(contentX, contentWidth)],
            ['내 계약\n계약 조건 · 진행 상태 · 상환 현황', () => this.showContracts(contentX, contentWidth)]
        ];
        menuItems.forEach(([label, callback], index) => {
            const buttonY = 174 + index * 112;
            this.makeButton(menuX + menuWidth / 2, buttonY + 40, menuWidth, 82, label, callback, 0x35383c);
        });
        this.rightContent = this.add.container(contentX, 164);
        this.contentX = contentX;
        this.contentWidth = contentWidth;
        this.showHomeMessage();
    }

    showHomeMessage() {
        this.clearRightContent();
        this.addRightText('업무를 선택하세요.', 0, 12, 22, true);
    }

    showDeposit() {
        this.startRightPanel('일반 입금');
        this.playerBalanceText = this.addRightText(`플레이어 보유 자금: ${this.player?.Money ?? '초기화 전'}`, 0, 46);
        this.addAmountField(0, 104);
        this.makeRightButton(150, 220, 170, 44, '입금 확인', () => {
            const amount = Number(this.amountInput);
            if (!Number.isFinite(amount) || amount <= 0) {
                this.showResult('양수 금액을 입력하세요.', false);
                return;
            }
            if (typeof this.bank?.AcceptDeposit !== 'function') {
                this.showResult('입금 기능을 사용할 수 없습니다.', false);
                return;
            }
            const success = this.bank.AcceptDeposit(this.player, amount);
            this.showResult(success ? '입금이 처리되었습니다.' : '입금에 실패했습니다. 보유 자금과 은행 등록 상태를 확인하세요.', success);
            if (success) {
                this.amountInput = '';
                this.refreshPlayerInfo();
                this.amountFieldText?.setText('숫자를 입력하세요').setColor('#aaa49b');
                this.refreshOperationBalances();
            }
        });
        this.makeRightButton(350, 220, 170, 44, '뒤로', () => this.showHomeMessage(), 0x4a4d50);
        this.addResultLabel(254);
    }

    showLoan() {
        this.startRightPanel('일반 대출');
        const creditRating = this.player?.CreditRating;
        this.addRightText(`신용도: ${creditRating ?? '확인 불가 (CreditRating 데이터 없음)'}`, 0, 46);
        this.addRightText(`대출 가능 여부: ${creditRating == null ? '확인 불가' : '은행 심사 필요'}`, 0, 76);
        this.playerBalanceText = this.addRightText(`플레이어 보유 자금: ${this.player?.Money ?? '초기화 전'}`, 0, 106);
        this.addAmountField(0, 144);
        this.makeRightButton(150, 280, 170, 44, '대출 확인', () => {
            const amount = Number(this.amountInput);
            if (!Number.isFinite(amount) || amount <= 0) {
                this.showResult('양수 금액을 입력하세요.', false);
                return;
            }
            if (typeof this.bank?.IssueLoan !== 'function') {
                this.showResult('대출 기능을 사용할 수 없습니다.', false);
                return;
            }
            const success = this.bank.IssueLoan(this.player, amount);
            this.showResult(success ? '대출이 처리되었습니다.' : '대출 신청이 거절되었습니다. 은행의 기존 조건을 충족하지 못했습니다.', success);
            if (success) {
                this.amountInput = '';
                this.refreshPlayerInfo();
                this.amountFieldText?.setText('숫자를 입력하세요').setColor('#aaa49b');
                this.refreshOperationBalances();
            }
        });
        this.makeRightButton(350, 280, 170, 44, '뒤로', () => this.showHomeMessage(), 0x4a4d50);
        this.addResultLabel(314);
    }

    showProducts(filter = this.productFilter) {
        this.startRightPanel('금융 상품');
        this.productFilter = filter;
        const filters = ['전체', '대출', '예금', '보험'];
        filters.forEach((item, index) => {
            this.makeRightButton(54 + index * 112, 44, 102, 38, item, () => this.showProducts(item),
                item === filter ? 0x765638 : 0x45484b);
        });
        const typeLabels = {
            Loan: '대출', Deposit: '예금', Insurance: '보험', Trade: '거래',
            Employment: '고용', Lease: '임대', SecuredLoan: '담보 대출', Settlement: '위약금·합의'
        };
        const contractedIds = new Set((Array.isArray(this.player?.Contracts) ? this.player.Contracts : [])
            .map(contract => contract?.ContractId ?? contract?.Contract_Id)
            .filter(id => id != null));
        const products = (Array.isArray(this.bank?.Contracts) ? this.bank.Contracts : [])
            .filter(item => item && !contractedIds.has(item.Contract_Id))
            .map(item => ({ type: typeLabels[item.ContractType] ?? item.ContractType ?? '유형 없음', item }))
            .filter(({ type }) => filter === '전체' || type === filter);
        if (!products.length) {
            this.addRightText('등록된 미체결 계약이 없습니다.', 0, 100, 18);
            return;
        }
        products.forEach(({ type, item }, index) => {
            const y = 96 + index * 78;
            const title = item?.Name ?? `${type} 상품`;
            this.addRightText(`${title} · ${type}`, 0, y, 17, true);
            const rate = item?.InterestRate ?? item?.Content?.InterestRate ?? item?.Content?.Rate;
            const details = [
                rate != null && `금리 ${rate}`,
                item?.Content?.Amount != null && `한도/금액 ${item.Content.Amount}`,
                item?.Content?.Premium != null && `보험료 ${item.Content.Premium}`,
                item?.Content?.Payout != null && `보험금 ${item.Content.Payout}`,
                item?.Period?.Duration != null && `기간 ${item.Period.Duration} ${item.Period.Unit ?? ''}`,
                item?.Content?.Description && `설명 ${item.Content.Description}`
            ].filter(Boolean);
            this.addRightText(details.join(' · ') || '등록된 상세 조건 없음', 0, y + 25, 14);
            this.makeRightButton(this.contentWidth - 58, y + 34, 112, 34, '계약 보기', () => this.openContract(item), 0x4a4d50);
        });
    }

    showProductDetail(type, item) {
        this.startRightPanel('상품 상세');
        this.addRightText(`상품명: ${item?.Name ?? `${type} 상품`}`, 0, 48);
        this.addRightText(`유형: ${type}`, 0, 78);
        const content = item?.Content ?? {};
        const period = item?.Period ?? {};
        const lines = [
            item?.InterestRate != null && `금리: ${item.InterestRate} (${item.InterestRateType ?? '유형 정보 없음'})`,
            content.InterestRate != null && `금리: ${content.InterestRate}`,
            content.Rate != null && `금리: ${content.Rate}`,
            content.Amount != null && `금액/한도: ${content.Amount}`,
            content.Premium != null && `보험료: ${content.Premium}`,
            content.Payout != null && `보험금: ${content.Payout}`,
            period.Duration != null && `기간: ${period.Duration} ${period.Unit ?? ''}`,
            content.Description && `설명: ${content.Description}`
        ].filter(Boolean);
        this.addRightText(lines.join('\n') || '등록된 상세 조건이 없습니다.', 0, 112, 17);
        this.makeRightButton(72, 222, 140, 40, '목록으로', () => this.showProducts(this.productFilter), 0x4a4d50);
    }

    showContracts() {
        this.startRightPanel('내 계약');
        const playerSummaries = Array.isArray(this.player?.Contracts) ? this.player.Contracts : [];
        if (!playerSummaries.length) {
            this.addRightText('체결한 계약이 없습니다.', 0, 52, 18);
            return;
        }
        let y = 48;
        this.addRightText('플레이어 계약', 0, y, 18, true);
        y += 30;
        const bankContracts = Array.isArray(this.bank?.Contracts) ? this.bank.Contracts : [];
        playerSummaries.forEach(summary => {
            const contractId = summary?.ContractId ?? summary?.Contract_Id;
            const contract = bankContracts.find(item => item?.Contract_Id === contractId) ?? summary;
            this.addRightText(`ID ${contractId ?? '확인 불가'} · ${contract?.Name ?? '이름 없음'} · ${contract?.ContractType ?? '유형 없음'} · ${summary?.Status ?? contract?.Status ?? '상태 없음'}`, 0, y, 15);
            if (contract?.Contract_Id != null) {
                this.makeRightButton(this.contentWidth - 62, y + 18, 120, 34, '계약 보기', () => this.openContract(contract), 0x4a4d50);
            }
            y += 62;
        });
    }

    openContract(contract) {
        const contractSystem = this.scene.get('Start')?.contractSystem;
        this.scene.pause();
        this.scene.launch('ContractScene', {
            contract,
            player: this.player,
            contractSystem,
            dataManager: this.dataManager,
            returnScene: 'BankScene'
        });
    }

    startRightPanel(title) {
        this.clearRightContent();
        this.addRightText(title, 0, 0, 22, true);
    }

    clearRightContent() {
        this.rightContent.removeAll(true);
        this.resultText = null;
        this.amountFieldText = null;
        this.amountInput = '';
        this.focusedInput = false;
    }

    addRightText(text, x, y, fontSize = 16, bold = false) {
        const object = this.add.text(x, y, text, {
            fontSize: `${fontSize}px`, color: '#f1eee8', fontStyle: bold ? 'bold' : 'normal',
            wordWrap: { width: Math.max(80, this.contentWidth - x - 10) }, lineSpacing: 5
        });
        this.rightContent.add(object);
        return object;
    }

    makeRightButton(x, y, width, height, label, callback, color = 0x5a4635) {
        const background = this.add.rectangle(x, y, width, height, color)
            .setStrokeStyle(1, 0x93816f).setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y, label, {
            fontSize: '15px', color: '#ffffff', align: 'center',
            wordWrap: { width: width - 12 }
        }).setOrigin(0.5);
        background.on('pointerdown', callback);
        background.on('pointerover', () => background.setFillStyle(0x776047));
        background.on('pointerout', () => background.setFillStyle(color));
        this.rightContent.add([background, text]);
        return background;
    }

    addAmountField(x, y) {
        this.addRightText('금액', x, y, 16, true);
        const fieldY = y + 28;
        const background = this.add.rectangle(x + this.contentWidth / 2, fieldY + 18, this.contentWidth - 8, 38, 0x26292c)
            .setStrokeStyle(1, 0x9b8a77).setInteractive({ useHandCursor: true });
        this.amountFieldText = this.add.text(x + 12, fieldY + 8, this.amountInput || '숫자를 입력하세요', {
            fontSize: '16px', color: this.amountInput ? '#ffffff' : '#aaa49b'
        });
        const focus = () => {
            this.focusedInput = true;
            this.amountFieldText.setColor('#ffffff');
        };
        background.on('pointerdown', focus);
        this.amountFieldText.setInteractive({ useHandCursor: true }).on('pointerdown', focus);
        this.rightContent.add([background, this.amountFieldText]);
    }

    handleAmountInput(event) {
        if (!this.focusedInput) return;
        if (/^\d$/.test(event.key)) this.amountInput += event.key;
        else if (event.key === 'Backspace') this.amountInput = this.amountInput.slice(0, -1);
        else if (event.key === 'Escape') this.focusedInput = false;
        else return;
        this.amountFieldText?.setText(this.amountInput || '숫자를 입력하세요');
        if (!this.amountInput) this.amountFieldText?.setColor('#aaa49b');
    }

    addResultLabel(y = 210) {
        this.resultText = this.addRightText('', 0, y, 15);
    }

    showResult(message, success) {
        if (!this.resultText) this.addResultLabel();
        this.resultText.setText(message).setColor(success ? '#9de0a5' : '#ffb1a8');
    }

    refreshPlayerInfo() {
        const player = this.player;
        const id = this.bank?.GetCustomerId?.(player);
        const deposits = this.bank?.DepositBalances instanceof Map ? this.bank.DepositBalances.get(id) ?? 0 : null;
        const loans = this.bank?.LoanBalances instanceof Map ? this.bank.LoanBalances.get(id) ?? 0 : null;
        const credit = player?.CreditRating;
        this.playerInfoText?.setText([
            `이름: ${player?.Name ?? '플레이어'}`,
            `계좌 번호: 000-000-000-000 (표시용)`,
            `예금 잔액: ${deposits ?? '초기화 전'}`,
            `대출 잔액: ${loans ?? '초기화 전'}`,
            `신용도: ${credit ?? '확인 불가'}`,
            `보유 자금: ${player?.Money ?? '초기화 전'}`
        ].join('\n'));
    }

    refreshOperationBalances() {
        this.playerBalanceText?.setText(`플레이어 보유 자금: ${this.player?.Money ?? '초기화 전'}`);
    }

    drawPanel(x, y, width, height, title) {
        this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x202328)
            .setStrokeStyle(1, 0x6b6259);
        this.add.text(x + 16, y + 12, title, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' });
    }

    makeButton(x, y, width, height, label, callback, color = 0x35383c) {
        const background = this.add.rectangle(x, y, width, height, color)
            .setStrokeStyle(1, 0x817569).setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, {
            fontSize: '17px', color: '#ffffff', align: 'center', wordWrap: { width: width - 20 }
        }).setOrigin(0.5);
        background.on('pointerdown', callback);
        background.on('pointerover', () => background.setFillStyle(0x5a5044));
        background.on('pointerout', () => background.setFillStyle(color));
        return background;
    }

    closeScene() {
        const startScene = this.scene.get('Start');
        startScene?.updateUI?.();
        this.scene.stop();
        this.scene.resume('Start');
    }

    cleanup() {
        this.input.keyboard.off('keydown', this.handleAmountInput, this);
        this.closeButton?.removeAllListeners();
    }
}
