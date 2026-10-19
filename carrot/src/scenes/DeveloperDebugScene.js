export class DeveloperDebugScene extends Phaser.Scene {
    constructor() {
        super('DeveloperDebugScene');
        this.refreshInterval = null;
    }

    init(data) {
        this.player = data?.player;
        this.market = data?.market;
        this.turn = data?.turn;
        this.turnSystem = data?.turnSystem;
        this.dataManager = data?.dataManager;
    }

    create() {
        this.cameras.main.setBackgroundColor('#101820');
        this.add.text(24, 16, 'Developer Debug Scene  |  F3 열기 · ESC 복귀 · 휠 스크롤', {
            fontSize: '22px', color: '#ffffff'
        });
        this.statusText = this.add.text(24, 56, '', {
            fontSize: '16px', color: '#d9e2ec', lineSpacing: 5,
            wordWrap: { width: 1200 }
        });

        this.refreshDebugText();
        this.refreshInterval = this.time.addEvent({
            delay: 500, loop: true, callback: this.refreshDebugText, callbackScope: this
        });
        this.input.on('wheel', this.handleWheel, this);
        this.input.keyboard.on('keydown-ESC', this.closeDebugScene, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    }

    refreshDebugText() {
        const player = this.player;
        const resources = player?.Resources;
        const transports = player?.Transport ? [player.Transport] : [];
        const resourceName = id => this.dataManager?.GetResource?.(id)?.ResourceName ?? `ID ${id}`;
        const productionType = id => {
            const item = this.cache.json.get('ProductionBase')?.find?.(entry => entry.ProductionBaseNumber === id);
            return item?.ProductionBaseName ?? `ID ${id}`;
        };
        const entries = map => map instanceof Map ? [...map.entries()] : [];
        const displayMap = map => entries(map).length
            ? entries(map).map(([id, amount]) => `${resourceName(id)} (${id}): ${amount}`).join('\n')
            : '없음';
        const playerContracts = Array.isArray(player?.Contracts) ? player.Contracts : [];
        const bank = this.turnSystem?.Bank;
        const bankContracts = Array.isArray(bank?.Contracts) ? bank.Contracts : [];
        const productionBases = Array.isArray(player?.ProductionBases) ? player.ProductionBases : [];
        const productionCounts = productionBases.reduce((result, base) => {
            const name = productionType(base?.ProductionBasetype);
            result[name] = (result[name] ?? 0) + 1;
            return result;
        }, {});
        const marketItems = entries(this.market?.MarketItems);
        const facilities = Array.isArray(player?.StorageFacilities) ? player.StorageFacilities : [];
        const totalCapacity = player && typeof player.getCapacityOfStorage === 'function'
            ? player.getCapacityOfStorage() : null;
        // getUsedStorage recalculates and writes Player.CurrentAmount. Read the existing
        // value so this inspection scene does not modify game state.
        const usedCapacity = player?.CurrentAmount ?? null;
        const available = player && typeof player.getAvailableStorage === 'function'
            ? player.getAvailableStorage() : null;
        const contractLine = contract => {
            const id = contract?.Contract_Id ?? contract?.ContractId ?? '확인 불가';
            const name = contract?.Name ? `, ${contract.Name}` : '';
            const status = contract?.Status ?? '상태 확인 불가';
            const type = contract?.ContractType ? `, 유형 ${contract.ContractType}` : '';
            const progress = contract?.Progress?.CompletedPeriods;
            const duration = contract?.Period?.Duration;
            const extra = progress !== undefined || duration !== undefined
                ? `, 이행 ${progress ?? '확인 불가'}/${duration ?? '확인 불가'}` : '';
            return `ID ${id}${name}${type}, 상태 ${status}${extra}`;
        };
        const contractCounts = list => ['Scheduled', 'InProgress', 'Completed', 'Breached', 'Terminated']
            .map(status => `${status}: ${list.filter(contract => contract.Status === status).length}`).join('\n');

        const lines = [
            'Player',
            `자금 (Money): ${player?.Money ?? '초기화 전'}`,
            `당근 보유량: ${resources instanceof Map ? resources.get(1) ?? 0 : '초기화 전'}`,
            `운송장치: ${transports.length ? transports.map(transport => `ID ${transport.getTransportId?.() ?? '확인 불가'} (적재 ${transport.getCurrentStorage?.() ?? '확인 불가'}/${transport.getTotalStorage?.() ?? '확인 불가'})\n${displayMap(transport.getResources?.())}`).join('\n') : '없음'}`,
            `플레이어 보유 자원:\n${displayMap(resources)}`,
            `생산 기반 종류/개수: ${productionBases.length ? Object.entries(productionCounts).map(([name, count]) => `${name}: ${count}`).join(', ') : '없음'}`,
            `직원 수 및 배치: ${productionBases.length ? productionBases.map(base => `기반 ${base?.Number ?? '?'}: ${base?.AssignedEmployees?.length ?? 0}명`).join(', ') : '없음'}`,
            `플레이어 계약 목록: ${playerContracts.length ? playerContracts.map(contractLine).join('\n') : '없음'}`,
            `총 저장 용량: ${totalCapacity ?? '확인 불가'}`,
            `사용 중인 저장 공간: ${usedCapacity ?? '확인 불가'}`,
            `남은 저장 공간: ${available ?? '확인 불가'}`,
            '', 'Bank',
            `은행 보유 자금 (Funds): ${bank?.Funds ?? '미구현 (Bank 인스턴스 없음)'}`,
            `플레이어 관련 계약: ${bankContracts.length ? bankContracts.map(contractLine).join('\n') : bank ? '없음' : '미구현 (Bank 인스턴스 없음)'}`,
            `기본 금리: ${bank?.BaseInterestRates ?? '미구현 (Bank 인스턴스 없음)'}`,
            `대출 금리: ${bank?.LoanInterestRate ?? '미구현 (Bank 인스턴스 없음)'}`,
            `예금 금리: ${bank?.DepositInterestRate ?? '미구현 (Bank 인스턴스 없음)'}`,
            `플레이어 대출 잔액: ${bank?.LoanBalances instanceof Map ? bank.LoanBalances.get(bank.GetCustomerId?.(player)) ?? 0 : '미구현 (Bank 인스턴스 없음)'}`,
            `플레이어 예금 잔액: ${bank?.DepositBalances instanceof Map ? bank.DepositBalances.get(bank.GetCustomerId?.(player)) ?? 0 : '미구현 (Bank 인스턴스 없음)'}`,
            `미체결 상품 제안: ${bank ? ['LoanProducts', 'DepositProducts', 'InsuranceProducts'].map(key => `${key}: ${bank[key]?.length ?? 0}`).join(', ') : '미구현 (Bank 인스턴스 없음)'}`,
            '', 'TurnSystem',
            `현재 턴: ${this.turn?.CurrentTurn ?? '초기화 전'}`,
            '현재 경과 주: 미구현', '현재 경과 월: 미구현', '현재 경과 년: 미구현',
            '', 'Market',
            `시장 자원:\n${marketItems.length ? marketItems.map(([id, item]) => `${resourceName(id)} (${id}): 가격 ${item?.Price ?? '확인 불가'}, 재고 ${item?.Stock ?? '확인 불가'}`).join('\n') : '없음'}`,
            '', 'Production',
            `생산 기반 목록:\n${productionBases.length ? productionBases.map(base => `ID ${base?.Number ?? '확인 불가'}, 종류 ${productionType(base?.ProductionBasetype)} (${base?.ProductionBasetype ?? '확인 불가'}), 위치 ${base?.Position ? `${base.Position.x}, ${base.Position.y}` : '확인 불가'}, 지정 자원 ${base?.AssignedResource == null ? '없음' : resourceName(base.AssignedResource)}, 직원 ${base?.AssignedEmployees?.length ?? 0}, 진행도 ${base?.CurrentProgress ?? '확인 불가'}, 활성화 ${base?.Activate === undefined ? '확인 불가' : Boolean(base.Activate)}`).join('\n') : '없음'}`,
            '', 'Storage',
            `총 저장 용량: ${totalCapacity ?? '초기화 전'}`,
            `현재 사용량: ${usedCapacity ?? '초기화 전'}`,
            `남은 저장 용량: ${available ?? '확인 불가'}`,
            `저장 공간 초과량: ${totalCapacity !== null && usedCapacity !== null ? Math.max(0, usedCapacity - totalCapacity) : '확인 불가'}`,
            `저장 시설: ${facilities.length ? facilities.map(facility => `ID ${facility?.Number ?? '?'}, 용량 ${facility?.Capacity ?? '?'}`).join('; ') : '없음'}`,
            '', 'ContractSystem',
            `Player 목록:\n${playerContracts.length ? playerContracts.map(contractLine).join('\n') : '없음'}`,
            `Bank 목록:\n${bankContracts.length ? bankContracts.map(contractLine).join('\n') : bank ? '없음' : '미구현 (Bank 인스턴스 없음)'}`,
            `Player 상태별 계약 수:\n${contractCounts(playerContracts)}`,
            `Bank 상태별 계약 수:\n${bank ? contractCounts(bankContracts) : '미구현 (Bank 인스턴스 없음)'}`
        ];

        this.statusText.setText(lines.join('\n'));
        this.cameras.main.setBounds(0, 0, 1280, Math.max(720, this.statusText.y + this.statusText.height + 80));
    }

    handleWheel(pointer, gameObjects, deltaX, deltaY) {
        const camera = this.cameras.main;
        camera.setScroll(camera.scrollX, Phaser.Math.Clamp(camera.scrollY + deltaY, 0, camera.getBounds().height - camera.height));
    }

    closeDebugScene() {
        this.scene.stop();
    }

    cleanup() {
        this.refreshInterval?.remove();
        this.refreshInterval = null;
        this.input.off('wheel', this.handleWheel, this);
        this.input.keyboard.off('keydown-ESC', this.closeDebugScene, this);
    }
}
