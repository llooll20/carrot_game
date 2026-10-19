export class ContractScene extends Phaser.Scene {
    constructor() {
        super('ContractScene');
        this.playerSigned = false;
        this.submitting = false;
    }

    init(data) {
        this.contract = data?.contract;
        this.player = data?.player;
        this.dataManager = data?.dataManager;
        this.returnScene = data?.returnScene ?? 'Start';
        this.playerSigned = false;
        this.submitting = false;
        this.signatureStates = [];
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        this.add.rectangle(width / 2, height / 2, width, height, 0x090909, 0.78)
            .setScrollFactor(0).setDepth(0).setInteractive();
        this.closeButton = this.add.text(width - 32, 18, '닫기', {
            fontSize: '18px', color: '#ffffff', backgroundColor: '#493d35', padding: { x: 14, y: 9 }
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(102).setInteractive({ useHandCursor: true });
        this.closeButton.on('pointerdown', this.closeScene, this);

        this.content = this.add.container(0, 0).setDepth(101);
        this.signatureStates = [];
        this.buildContractDocument();
        this.input.on('wheel', this.handleWheel, this);
        this.input.keyboard.on('keydown-ESC', this.closeScene, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    }

    buildContractDocument() {
        const contract = this.contract;
        if (!contract || typeof contract !== 'object') {
            this.add.text(250, 180, '계약 정보를 불러올 수 없습니다.', {
                fontSize: '28px', color: '#f5ebd4', backgroundColor: '#493d35', padding: { x: 28, y: 24 },
                wordWrap: { width: 780 }
            }).setDepth(101);
            return;
        }

        const left = 180;
        const docWidth = this.scale.width - 360;
        const innerLeft = left + 24;
        const innerWidth = docWidth - 48;
        this.add.rectangle(this.scale.width / 2, 20, docWidth, 10000, 0xe9dfc8)
            .setOrigin(0.5, 0).setStrokeStyle(2, 0x6b5846);
        let y = 44;
        y = this.addText(`계약서  ·  ${contract.Name ?? '이름 정보 없음'}`, innerLeft, y, innerWidth, 32, true);
        y = this.addText(`계약 ID: ${contract.Contract_Id ?? '정보 없음'}     계약 유형: ${this.humanize(contract.ContractType)}`, innerLeft, y + 4, innerWidth, 20);
        if (contract.Description) y = this.addText(`설명: ${contract.Description}`, innerLeft, y + 4, innerWidth, 20);

        y = this.addSection('계약 당사자', innerLeft, y + 18, innerWidth);
        const actors = this.getActors(contract);
        if (actors.length === 0) {
            y = this.addText('계약 당사자 정보 없음', innerLeft + 10, y + 10, innerWidth - 20, 24);
        } else {
            const gap = 10;
            const cardWidth = (innerWidth - gap * (actors.length - 1)) / actors.length;
            actors.forEach((actor, index) => {
                const x = innerLeft + index * (cardWidth + gap);
                this.addPanel(x, y + 8, cardWidth, 94, 0xf3ecd9);
                this.addText(`${this.humanize(actor.Role)} (${actor.Role ?? '정보 없음'})`, x + 10, y + 17, cardWidth - 20, 20, true);
                this.addText(actor.Name, x + 10, y + 42, cardWidth - 20, 22);
                this.addText(`${actor.ActorType ?? '유형 미상'} #${actor.ActorId ?? 'ID 미상'}`, x + 10, y + 67, cardWidth - 20, 18, false, 14);
            });
            y += 112;
        }

        y = this.addSection('계약 조건', innerLeft, y + 16, innerWidth);
        const conditions = this.getContractConditions(contract);
        y = this.addLines(conditions.length ? conditions : ['조건 정보 없음'], innerLeft + 10, y + 8, innerWidth - 20);

        y = this.addSection('위반 조건', innerLeft, y + 16, innerWidth, 0x793c35);
        y = this.addLines(this.getPenaltyLines(contract.Penalty), innerLeft + 10, y + 8, innerWidth - 20);

        y = this.addSection('계약 종료 조건', innerLeft, y + 16, innerWidth);
        y = this.addLines(this.getTerminationLines(contract.TerminationCondition), innerLeft + 10, y + 8, innerWidth - 20);

        y = this.addSection('계약서 서명', innerLeft, y + 16, innerWidth);
        y = this.addText('모든 필수 당사자가 서명하면 계약이 체결됩니다.', innerLeft + 10, y + 8, innerWidth - 20, 22);
        this.signatureResult = this.add.text(innerLeft + 10, y + 6, '', {
            fontSize: '15px', color: '#793c35', wordWrap: { width: innerWidth - 20 }
        });
        y += 30;
        if (actors.length === 0) {
            y = this.addText('서명 영역을 표시할 당사자가 없습니다.', innerLeft + 10, y, innerWidth - 20, 22);
        } else {
            const gap = 10;
            const cardWidth = (innerWidth - gap * (actors.length - 1)) / actors.length;
            actors.forEach((actor, index) => {
                const x = innerLeft + index * (cardWidth + gap);
                const playerActor = actor.ActorType === 'Player';
                const signed = playerActor && this.playerSigned;
                const box = this.add.rectangle(x + cardWidth / 2, y + 38, cardWidth, 76, 0xf3ecd9)
                    .setStrokeStyle(1, playerActor ? 0x765d43 : 0x9c9588);
                this.addText(`${this.humanize(actor.Role)} · ${actor.Name}`, x + 8, y + 12, cardWidth - 16, 18, true, 14);
                const state = this.add.text(x + 8, y + 39, signed ? '서명 완료' : playerActor ? '여기를 클릭하여 서명' : '대기 중', {
                    fontSize: '15px', color: signed ? '#315c3b' : '#51473d', align: 'center',
                    wordWrap: { width: cardWidth - 16 }
                }).setOrigin(0.5, 0).setPosition(x + cardWidth / 2, y + 39);
                this.signatureStates.push({ playerActor, box, state });
                if (playerActor && !this.playerSigned) {
                    box.setInteractive({ useHandCursor: true });
                    state.setInteractive({ useHandCursor: true });
                    box.on('pointerdown', this.signAsPlayer, this);
                    state.on('pointerdown', this.signAsPlayer, this);
                }
            });
            y += 132;
        }
        this.contractStatusText = this.add.text(innerLeft + 10, y + 8, `계약 상태: ${this.humanize(contract.Status)}`, {
            fontSize: '20px', color: '#332b23', wordWrap: { width: innerWidth - 20 }
        });
        this.content.add(this.contractStatusText);
        y = y + this.contractStatusText.height + 12;
        this.content.setSize(this.scale.width, y + 36);
        this.cameraBounds = Math.max(0, y + 60 - this.scale.height);
    }

    getActors(contract) {
        const parties = Array.isArray(contract?.Participants?.Parties)
            ? contract.Participants.Parties.filter(Boolean) : [];
        if (parties.length === 0) return [];
        const guarantor = contract?.Participants?.Guarantor;
        const actors = [...parties];
        if (guarantor && (guarantor.ActorId != null || guarantor.ActorType)) {
            actors.push({ ...guarantor, Role: 'Guarantor' });
        }
        return actors.map(actor => ({
            ...actor,
            Name: actor.ActorType === 'Player' ? '플레이어' : `${actor.ActorType ?? '당사자'} #${actor.ActorId ?? '?'}`
        }));
    }

    getContractConditions(contract) {
        const lines = [];
        const content = contract.Content ?? {};
        if (content.Action) lines.push(`행위: ${this.humanize(content.Action)}`);
        if (content.ResourceNumber != null) lines.push(`거래 품목: ${this.resourceName(content.ResourceNumber)}`);
        if (content.Amount != null) lines.push(`계약 수량/금액: ${content.Amount}${content.Frequency ? ` / ${this.humanize(content.Frequency)}` : ''}`);
        if (content.From || content.To) lines.push(`이행 당사자: ${content.From ?? '정보 없음'} → ${content.To ?? '정보 없음'}`);
        if (content.Frequency) lines.push(`이행 주기: ${this.humanize(content.Frequency)}`);
        if (contract.Period?.Duration != null || contract.Period?.Unit) {
            lines.push(`계약 기간: ${contract.Period.Duration ?? '정보 없음'} ${this.humanize(contract.Period.Unit)}`);
        }
        if (contract.Progress?.CompletedPeriods != null || contract.Period?.Duration != null) {
            lines.push(`이행 진행도: ${contract.Progress?.CompletedPeriods ?? '정보 없음'} / ${contract.Period?.Duration ?? '정보 없음'}`);
        }
        if (contract.PaymentCondition?.Type) lines.push(`이행 시점: ${this.humanize(contract.PaymentCondition.Type)}`);
        return lines;
    }

    getPenaltyLines(penalty) {
        if (!penalty || typeof penalty !== 'object') return ['위반 조건 없음'];
        const lines = [];
        if (penalty.Type) lines.push(`패널티 유형: ${this.humanize(penalty.Type)}`);
        if (penalty.Amount != null) lines.push(`배상 금액/수량: ${penalty.Amount}${penalty.ResourceNumber != null ? ` ${this.resourceName(penalty.ResourceNumber)}` : ''}`);
        if (penalty.Description) lines.push(`설명: ${penalty.Description}`);
        return lines.length ? lines : ['위반 조건 없음'];
    }

    getTerminationLines(termination) {
        if (!termination || typeof termination !== 'object') return ['종료 조건 없음'];
        const lines = [];
        if (termination.Type) lines.push(`종료 조건 유형: ${this.humanize(termination.Type)}`);
        const conditions = Array.isArray(termination.Conditions) ? termination.Conditions.filter(Boolean) : [];
        conditions.forEach((condition, index) => {
            const details = [
                condition.ActorRole && `${this.humanize(condition.ActorRole)}의 행위`,
                condition.Action && this.humanize(condition.Action),
                condition.ResourceNumber != null && this.resourceName(condition.ResourceNumber),
                condition.Amount != null && `수량/금액 ${condition.Amount}`,
                condition.TargetRole && `대상 ${this.humanize(condition.TargetRole)}`
            ].filter(Boolean);
            if (details.length) lines.push(`조건 ${index + 1}: ${details.join(' · ')}`);
        });
        return lines.length ? lines : ['종료 조건 없음'];
    }

    addSection(title, x, y, width, color = 0x574535) {
        this.add.rectangle(x + width / 2, y + 13, width, 28, color);
        this.add.text(x + 10, y + 2, title, { fontSize: '18px', color: '#fff8e9' });
        return y + 34;
    }

    addText(text, x, y, width, fontSize = 18, bold = false, fixedFontSize = null) {
        const size = fixedFontSize ?? fontSize;
        const object = this.add.text(x, y, text, {
            fontSize: `${size}px`, color: '#332b23', fontStyle: bold ? 'bold' : 'normal',
            wordWrap: { width }, lineSpacing: 3
        });
        this.content.add(object);
        return y + object.height + 3;
    }

    addLines(lines, x, y, width) {
        lines.forEach(line => { y = this.addText(line, x, y, width, 17); });
        return y;
    }

    addPanel(x, y, width, height, color) {
        const panel = this.add.rectangle(x + width / 2, y + height / 2, width, height, color)
            .setStrokeStyle(1, 0x95846c);
        this.content.add(panel);
        return panel;
    }

    resourceName(resourceNumber) {
        return this.dataManager?.GetResource?.(resourceNumber)?.ResourceName ?? `자원 ID ${resourceNumber}`;
    }

    humanize(value) {
        if (value == null || value === '') return '정보 없음';
        const labels = {
            Seller: '판매자', Buyer: '구매자', Guarantor: '보증인',
            Monthly: '매월', Month: '개월', AtPeriodEnd: '매월 말',
            TransferResource: '자원 이전', PayMoney: '금액 지급',
            RecurringTrade: '정기 거래', FixedCompensation: '고정 배상', MutualSettlement: '상호 합의'
        };
        return labels[value] ?? String(value);
    }

    signAsPlayer() {
        if (this.playerSigned) return;
        if (!this.contract || typeof this.contract !== 'object') {
            this.signatureResult?.setText('계약 정보를 불러올 수 없어 완료 처리할 수 없습니다.');
            return;
        }

        this.playerSigned = true;
        this.contract.Status = 'Completed';
        const playerContract = this.player?.Contracts?.find?.(item =>
            item.ContractId === this.contract.Contract_Id
        );
        if (playerContract) playerContract.Status = 'Completed';
        this.contractStatusText?.setText('계약 상태: 완료');
        this.signatureResult?.setText('서명이 완료되어 계약 상태가 완료로 변경되었습니다.');
        this.signatureStates.filter(item => item.playerActor).forEach(({ box, state }) => {
            state.setText('서명 완료').setColor('#315c3b');
            box.disableInteractive();
            state.disableInteractive();
        });
    }

    handleWheel(pointer, gameObjects, deltaX, deltaY) {
        const camera = this.cameras.main;
        camera.setScroll(camera.scrollX, Phaser.Math.Clamp(camera.scrollY + deltaY, 0, this.cameraBounds ?? 0));
    }

    closeScene() {
        this.scene.stop();
        this.scene.resume(this.returnScene);
    }

    cleanup() {
        this.input.off('wheel', this.handleWheel, this);
        this.input.keyboard.off('keydown-ESC', this.closeScene, this);
        this.closeButton?.removeAllListeners();
    }
}
