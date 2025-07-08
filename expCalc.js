function initDropdowns() {
	// 드롭다운 초기화
	colorSelect.innerHTML = "";
	bootsSelect.innerHTML = "";

	const uniqueColors = [...new Set(levelData.map(lvl => lvl.color))];
	uniqueColors.forEach(color => {
		const option = document.createElement('option');
		option.value = color;
		option.textContent = levelData.find(lvl => lvl.color === color).koNameColor;
		colorSelect.appendChild(option);
	});

	const uniqueBoots = [...new Set(levelData.map(lvl => lvl.boots))];
	uniqueBoots.forEach(boots => {
		const option = document.createElement('option');
		option.value = boots;
		option.textContent = levelData.find(lvl => lvl.boots === boots).koNameBoots;
		bootsSelect.appendChild(option);
	});
}

// 현재 테일즈런너의 레벨들을 변수에 JSON 형식으로 입력
let levelData = [];

fetch('levelData.json')
.then(res => res.json())
.then(data => {
	levelData = data;
	initDropdowns();
	calculate();
})
.catch(err => console.error('레벨 데이터 로드 실패:', err));

// 입력 요소들에서 값 가져오기, 각각 레벨 색상, 레벨 신발, 퍼센티지 값, 페이지전체 경험치 값들, 그리고 맨 아래 두 개는 출력 영역
const colorSelect = document.getElementById('colorSelect');
const bootsSelect = document.getElementById('bootsSelect');
const percentInput = document.getElementById('percentInput');
const fishExpInputs = document.querySelectorAll('.fishExp');
const currentExpDisplay = document.getElementById('currentExpDisplay');
const afterExpDisplay = document.getElementById('afterExpDisplay');
const afterLevelDisplay = document.getElementById('afterLevelDisplay');

// 디스플레이 요소들 참조
const iconBefore = document.querySelector('#iconDisplayBefore img');
const iconAfter = document.querySelector('#iconDisplayAfter img');
const barBefore = document.getElementById('levelBarDisplayInnerBefore');
const barAfter = document.getElementById('levelBarDisplayInnerAfter');
const pctBefore = document.getElementById('percentDisplayBefore');
const pctAfter = document.getElementById('percentDisplayAfter');

// 레벨 색상과 신발 종류 입력하는 select 부분의 선택지 동적 추가
const uniqueColors = [...new Set(levelData.map(lvl => lvl.color))];
uniqueColors.forEach(color => {
	const option = document.createElement('option');
	option.value = color;
	option.textContent = levelData.find(lvl => lvl.color === color).koNameColor;
	colorSelect.appendChild(option);
});

const uniqueBoots = [...new Set(levelData.map(lvl => lvl.boots))];
uniqueBoots.forEach(boots => {
	const option = document.createElement('option');
	option.value = boots;
	option.textContent = levelData.find(lvl => lvl.boots === boots).koNameBoots;
	bootsSelect.appendChild(option);
});

// 로그 기록 함수
function appendLog(lines) {
	const logDiv = document.getElementById('logMessage');
	if (!logDiv) return;
	lines.forEach(line => {
		const p = document.createElement('p');
		p.textContent = line;
		logDiv.appendChild(p);
	});
	logDiv.appendChild(document.createElement('br'));
}

// function clearLogs() {
// 	const logDiv = document.getElementById('logMessage');
// 	if (logDiv) logDiv.textContent = '';
// }

// 계산 함수
function calculate() {

	// 색상과 신발 입력값을 가져오기
	const color = colorSelect.value;
	const boots = bootsSelect.value;

	// 퍼센티지 입력값을 수로 변환하기
	const percent = parseFloat(percentInput.value);

	// 퍼센티지 값의 범위를 검사하기 (0부터 99.99까지)
	if (isNaN(percent) || percent < 0 || percent >= 100) {
		currentExpDisplay.textContent = "";
		afterExpDisplay.textContent = "";
		// afterLevelDisplay.textContent = "";
		pctBefore.textContent = "퍼센티지 값은 0 ~ 99.99 사이의 값으로 입력해주세요.";
		pctAfter.textContent = "";

		barBefore.style.width = '0%';
		barAfter.style.width = '0%';
		iconAfter.src = 'levelIcons-svg/1.svg';
		iconAfter.alt = '1.svg';
		return;
	}

	const currentLevel = levelData.find(lvl => lvl.color === color && lvl.boots === boots);
	if (!currentLevel) return;

	const next = levelData.find(lvl => lvl.level === currentLevel.level + 1);

	// 최고 레벨에서는 더 이상 계산하지 않음
	let nextXp;
	if (next) {
		nextXp = next.xp;
	} else {
		nextXp = currentLevel.xp;
	}

	const currentXp = currentLevel.xp + (nextXp - currentLevel.xp) * (percent/100);

	// 총 어획물 EXP 합산
	let totalFishXp = 0;
	fishExpInputs.forEach(i => totalFishXp += parseInt(i.value)||0);
	const afterXp = currentXp + totalFishXp;

	// 입력 아이콘 src 값을 변경
	iconBefore.src = `levelIcons-svg/${currentLevel.level}.svg`;
	iconBefore.alt = `${currentLevel.level}.svg`;

	// 입력 퍼센티지 바와 텍스트 바 그래픽을 반영
	let displayPctBefore = percent;
	barBefore.style.width = displayPctBefore + '%';
	pctBefore.textContent = `Lv.${currentLevel.level} ${currentLevel.koNameColor} ${currentLevel.koNameBoots} ${displayPctBefore.toFixed(2)}%`;

	// 출력 값 계산
	currentExpDisplay.textContent = Math.round(currentXp).toLocaleString();
	afterExpDisplay.textContent = Math.round(afterXp).toLocaleString();

	// 출력 최종 퍼센티지 과도한 경우 단순화
	let final = levelData[0];
	levelData.forEach(lvl => { if (afterXp >= lvl.xp) final = lvl; });

	const finalNext = levelData.find(lvl => lvl.level === final.level + 1);
	let finalPercent;
	if (!finalNext) {
		// 최고레벨 도달
		finalPercent = 100;
	} else {
		const within = afterXp - final.xp;
		const gap = finalNext.xp - final.xp;
		finalPercent = Math.min((within / gap) * 100, 100);
	}

	// 출력 아이콘 src 변경
	iconAfter.src = `levelIcons-svg/${final.level}.svg`;
	iconAfter.alt = `${final.level}.svg`;
	// 출력 퍼센티지 바 & 텍스트 반영
	barAfter.style.width = finalPercent + '%';
	pctAfter.textContent  = `Lv.${final.level} ${final.koNameColor} ${final.koNameBoots} ${finalPercent.toFixed(2)}%`;

	// afterLevelDisplay.textContent = `${final.koNameColor} ${final.koNameBoots}, 약 ${Math.round(finalPercent * 100) / 100}%`;
}

// 이벤트리스너 동일
colorSelect.addEventListener('change', calculate);
bootsSelect.addEventListener('change', calculate);
percentInput.addEventListener('input', calculate);
fishExpInputs.forEach(i=>i.addEventListener('input', calculate));

calculate();

// 색상 드롭다운 로그
colorSelect.addEventListener('change', () => {
	// clearLogs();
	const lvl = levelData.find(l => l.color === colorSelect.value && l.boots === bootsSelect.value);
	if (lvl) {
		appendLog([
			`현재 레벨 입력: ${lvl.koNameColor} ${lvl.koNameBoots}`,
			`${lvl.koNameColor} ${lvl.koNameBoots} 경험치: ${lvl.xp.toLocaleString()} EXP 이상`
		]);
	}
});

// 신발 드롭다운 로그
bootsSelect.addEventListener('change', () => {
	// clearLogs();
	const lvl = levelData.find(l => l.color === colorSelect.value && l.boots === bootsSelect.value);
	if (lvl) {
		appendLog([
			`현재 레벨 입력: ${lvl.koNameColor} ${lvl.koNameBoots}`,
			`${lvl.koNameColor} ${lvl.koNameBoots} 경험치: ${lvl.xp.toLocaleString()} EXP 이상`
		]);
	}
});

// 퍼센티지 입력 blur 로그
percentInput.addEventListener('blur', () => {
	const p = parseFloat(percentInput.value);
	if (isNaN(p) || p < 0 || p >= 100) return;

	const curr = levelData.find(l => l.color === colorSelect.value && l.boots === bootsSelect.value);
	const next = levelData.find(l => l.level === curr.level + 1);
	if (!curr || !next) return;

	const needed = next.xp - curr.xp;
	const currXpCalc = curr.xp + needed * (p / 100);

	appendLog([
		`현재 레벨의 퍼센티지 입력: ${p.toFixed(2)}%`,
		`입력되어 있는 현재 레벨: ${curr.koNameColor} ${curr.koNameBoots}`,
		`다음 레벨: ${next.koNameColor} ${next.koNameBoots}`,
		`${curr.koNameColor} ${curr.koNameBoots} 달성 조건: ${curr.xp.toLocaleString()} EXP`,
		`${next.koNameColor} ${next.koNameBoots} 달성 조건: ${next.xp.toLocaleString()} EXP`,
		`${next.koNameColor} ${next.koNameBoots} 달성에 필요한 추가 경험치: ${needed.toLocaleString()} EXP`,
		`입력된 퍼센티지로 현재 총 경험치 계산: ${curr.xp.toLocaleString()} + ${needed.toLocaleString()} * ${(p/100).toFixed(4)} = 약 ${Math.round(currXpCalc).toLocaleString()} EXP`
	]);
});

// 어획물 EXP 입력 blur 로그
fishExpInputs.forEach(input => {
	input.addEventListener('blur', () => {
		const curr = levelData.find(l => l.color === colorSelect.value && l.boots === bootsSelect.value);
		const next = levelData.find(l => l.level === curr.level + 1);

		const p = parseFloat(percentInput.value);
		const needed = next ? next.xp - curr.xp : 0;
		const currXpCalc = curr.xp + (next ? needed * (p / 100) : 0);

		let sumFish = 0;
		fishExpInputs.forEach(inp => sumFish += parseInt(inp.value) || 0);
		const afterXp = currXpCalc + sumFish;

		let finalLevel = levelData[0];
		levelData.forEach(l => { if (afterXp >= l.xp) finalLevel = l; });
		const finalNext = levelData.find(l => l.level === finalLevel.level + 1);

		const additionalNeeded = finalNext ? finalNext.xp - finalLevel.xp : 0;
		const within = afterXp - finalLevel.xp;
		const finalPct = finalNext ? Math.min(within / additionalNeeded * 100, 100) : 100;

		appendLog([
			`어획물 경험치 총 입력: ${sumFish.toLocaleString()} EXP`,
			`현재 경험치: 약 ${Math.round(currXpCalc).toLocaleString()} EXP`,
			`입력한 어획물들을 전부 EXP로 더하면: 약 ${Math.round(afterXp).toLocaleString()} EXP`,
			`최소 약 ${Math.round(afterXp).toLocaleString()} EXP를 만족하는 레벨: ${finalLevel.koNameColor} ${finalLevel.koNameBoots}`,
			`${finalLevel.koNameColor} ${finalLevel.koNameBoots} 달성 조건: ${finalLevel.xp.toLocaleString()} EXP`,
			`${finalNext ? finalNext.koNameColor + ' ' + finalNext.koNameBoots : '최대 레벨'} 달성 조건: ${finalNext ? finalNext.xp.toLocaleString() : ''} EXP`,
			`${finalNext ? finalNext.koNameColor + ' ' + finalNext.koNameBoots : ''}로 레벨업 시 필요한 추가 경험치: ${additionalNeeded.toLocaleString()} EXP`,
			`교환 후 경험치에서 ${finalLevel.koNameColor} ${finalLevel.koNameBoots} 최소 경험치를 빼면: ${(afterXp - finalLevel.xp).toLocaleString()} EXP`,
			`교환 후 레벨의 퍼센티지 계산: ${(within / (additionalNeeded || 1) * 100).toFixed(2)}%`
		]);
	});
});
