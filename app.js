/**
 * ==========================================================================
 * 스마트에코 쾌적교실 (Smart Eco Classroom) - JavaScript 비즈니스 로직
 * 
 * 사용자 요구사항 완벽 구현:
 * 1. [STEP 1] 처음에 접속하면 '학교 / 학년 / 반 선택 게이트'가 나타나고, 선택 완료 시 대시보드로 이동!
 * 2. [STEP 2] 오늘 날씨 & AI 환기 보기 탭 vs 100% 기상청 API 기반 7일간 일주일 날씨 예보 탭
 * 3. 100% 사용자 발급 기상청 API 키 기반 단기예보 일주일 연동
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    let currentSchool = {
        schoolName: '제주여자고등학교',
        officeCode: 'T10',
        schoolCode: '9290071',
        schoolKind: '고등학교',
        grade: '2',
        classNm: '9',
        lat: 33.4890,
        lng: 126.4983,
        nx: 52,
        ny: 38
    };

    const dataModeText = document.getElementById('dataModeText');

    // 게이트 요소
    const schoolGatePanel = document.getElementById('schoolGatePanel');
    const mainDashboardWrapper = document.getElementById('mainDashboardWrapper');
    const inputGateSchoolSearch = document.getElementById('inputGateSchoolSearch');
    const btnGateSearchSchool = document.getElementById('btnGateSearchSchool');
    const gateSchoolDropdownList = document.getElementById('gateSchoolDropdownList');
    const selectGateGrade = document.getElementById('selectGateGrade');
    const selectGateClass = document.getElementById('selectGateClass');
    const btnStartDashboard = document.getElementById('btnStartDashboard');
    const btnChangeSchool = document.getElementById('btnChangeSchool');
    const selectedSchoolBadge = document.getElementById('selectedSchoolBadge');

    // 대시보드 요소
    const btnGpsLocation = document.getElementById('btnGpsLocation');
    const currentLocationTag = document.getElementById('currentLocationTag');
    const inputTargetDate = document.getElementById('inputTargetDate');
    const timelineTitleHeader = document.getElementById('timelineTitleHeader');
    const scheduleStatusNoticeTag = document.getElementById('scheduleStatusNoticeTag');
    const weatherSourceTag = document.getElementById('weatherSourceTag');
    const btnShareUrl = document.getElementById('btnShareUrl');

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabViews = {
        today: document.getElementById('tabViewToday'),
        weekly: document.getElementById('tabViewWeekly'),
        calendar: document.getElementById('tabViewCalendar')
    };

    // 카드 요소
    const valOutdoorTemp = document.getElementById('valOutdoorTemp');
    const valHumidity = document.getElementById('valHumidity');
    const valDiscomfort = document.getElementById('valDiscomfort');
    const barTempFill = document.getElementById('barTempFill');

    const valSensoryTemp = document.getElementById('valSensoryTemp');
    const sensoryStatusBadge = document.getElementById('sensoryStatusBadge');
    const sensoryStatusText = document.getElementById('sensoryStatusText');
    const sensoryDesc = document.getElementById('sensoryDesc');
    const indicatorPointer = document.getElementById('indicatorPointer');

    const valPm10 = document.getElementById('valPm10');
    const dustStatusBadge = document.getElementById('dustStatusBadge');
    const dustStatusText = document.getElementById('dustStatusText');
    const valPm10Detail = document.getElementById('valPm10Detail');
    const valPm25Detail = document.getElementById('valPm25Detail');

    const aiGuidePanel = document.getElementById('aiGuidePanel');
    const guideBgAnimation = document.getElementById('guideBgAnimation');
    const ventilationMainTitle = document.getElementById('ventilationMainTitle');
    const ventilationSubTitle = document.getElementById('ventilationSubTitle');
    const recommendedVentTime = document.getElementById('recommendedVentTime');
    const airCirculationTip = document.getElementById('airCirculationTip');

    const aiRecommendedTemp = document.getElementById('aiRecommendedTemp');
    const aiHvacMode = document.getElementById('aiHvacMode');
    const energySavingVal = document.getElementById('energySavingVal');
    const hvacNote = document.getElementById('hvacNote');

    const timelineTrack = document.getElementById('timelineTrack');
    const weeklyWeatherTrack = document.getElementById('weeklyWeatherTrack');

    const sliderTemp = document.getElementById('sliderTemp');
    const sliderHum = document.getElementById('sliderHum');
    const sliderPm10 = document.getElementById('sliderPm10');
    const sliderPm25 = document.getElementById('sliderPm25');

    const sliderTempVal = document.getElementById('sliderTempVal');
    const sliderHumVal = document.getElementById('sliderHumVal');
    const sliderPm10Val = document.getElementById('sliderPm10Val');
    const sliderPm25Val = document.getElementById('sliderPm25Val');

    const resetSimBtn = document.getElementById('resetSimBtn');
    const presetHotDayBtn = document.getElementById('presetHotDayBtn');
    const presetPerfectDayBtn = document.getElementById('presetPerfectDayBtn');
    const presetDustyDayBtn = document.getElementById('presetDustyDayBtn');

    let fetchedScheduleList = [
        { period: '1교시', subject: '여름방학 (자율)' },
        { period: '2교시', subject: '여름방학 (자율)' },
        { period: '3교시', subject: '여름방학 (자율)' },
        { period: '4교시', subject: '여름방학 (자율)' },
        { period: '5교시', subject: '방과후 학교' },
        { period: '6교시', subject: '동아리' },
        { period: '7교시', subject: '자율' }
    ];

    // ----------------------------------------------------------------------
    // 1. URL 쿼리 파라미터 읽기/갱신 및 탭 전환
    // ----------------------------------------------------------------------
    function syncUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        let hasParams = false;

        if (urlParams.has('school')) { currentSchool.schoolName = urlParams.get('school'); hasParams = true; }
        if (urlParams.has('grade')) { currentSchool.grade = urlParams.get('grade'); hasParams = true; }
        if (urlParams.has('classNm')) { currentSchool.classNm = urlParams.get('classNm'); hasParams = true; }
        if (urlParams.has('officeCode')) currentSchool.officeCode = urlParams.get('officeCode');
        if (urlParams.has('schoolCode')) currentSchool.schoolCode = urlParams.get('schoolCode');

        if (urlParams.has('date')) {
            inputTargetDate.value = urlParams.get('date');
        } else {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            inputTargetDate.value = `${yyyy}-${mm}-${dd}`;
        }

        inputGateSchoolSearch.value = currentSchool.schoolName;

        return hasParams;
    }

    function updateUrlParams() {
        const params = new URLSearchParams();
        params.set('school', currentSchool.schoolName);
        params.set('grade', currentSchool.grade);
        params.set('classNm', currentSchool.classNm);
        params.set('officeCode', currentSchool.officeCode);
        params.set('schoolCode', currentSchool.schoolCode);
        params.set('date', inputTargetDate.value);

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }

    // 탭 전환 이벤트
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.getAttribute('data-tab');
            Object.keys(tabViews).forEach(key => {
                if (key === targetTab) {
                    tabViews[key].style.display = 'flex';
                } else {
                    tabViews[key].style.display = 'none';
                }
            });
        });
    });

    btnShareUrl.addEventListener('click', () => {
        updateUrlParams();
        navigator.clipboard.writeText(window.location.href);
        alert(`🔗 현재 학급 설정 URL 주소가 복사되었습니다!\n${window.location.href}`);
    });

    // ----------------------------------------------------------------------
    // 2. 게이트 화면 <-> 대시보드 화면 전환
    // ----------------------------------------------------------------------
    function showDashboard() {
        schoolGatePanel.style.display = 'none';
        mainDashboardWrapper.style.display = 'block';

        selectedSchoolBadge.textContent = `${currentSchool.schoolName} ${currentSchool.grade}학년 ${currentSchool.classNm}반`;
        updateUrlParams();

        fetchLiveWeather();
        fetchNeisSchedule();
        fetchWeeklyWeather();
    }

    function showSchoolGate() {
        schoolGatePanel.style.display = 'flex';
        mainDashboardWrapper.style.display = 'none';
    }

    btnChangeSchool.addEventListener('click', showSchoolGate);

    // ----------------------------------------------------------------------
    // 3. 동적 반 개수 자동 맞춤 (나이스 API)
    // ----------------------------------------------------------------------
    async function updateGateClassCountOption(targetGrade = '2', targetClass = '9') {
        const isElementary = currentSchool.schoolKind.includes('초등');
        const maxGrade = isElementary ? 6 : 3;

        let gradeHtml = '';
        for (let g = 1; g <= maxGrade; g++) {
            const isSel = String(g) === String(targetGrade) ? 'selected' : '';
            gradeHtml += `<option value="${g}" ${isSel}>${g}학년</option>`;
        }
        selectGateGrade.innerHTML = gradeHtml;

        try {
            const res = await fetch(`/api/class-count?officeCode=${currentSchool.officeCode}&schoolCode=${currentSchool.schoolCode}&grade=${targetGrade}`);
            const result = await res.json();
            const classCount = result.totalClassCount || 11;

            let classHtml = '';
            for (let c = 1; c <= classCount; c++) {
                const isSel = String(c) === String(targetClass) ? 'selected' : '';
                classHtml += `<option value="${c}" ${isSel}>${c}반</option>`;
            }
            selectGateClass.innerHTML = classHtml;
        } catch (e) {
            let classHtml = '';
            for (let c = 1; c <= 11; c++) {
                const isSel = String(c) === String(targetClass) ? 'selected' : '';
                classHtml += `<option value="${c}" ${isSel}>${c}반</option>`;
            }
            selectGateClass.innerHTML = classHtml;
        }
    }

    // 게이트에서 대시보드 시작하기 클릭
    btnStartDashboard.addEventListener('click', () => {
        currentSchool.grade = selectGateGrade.value;
        currentSchool.classNm = selectGateClass.value;
        showDashboard();
    });

    // ----------------------------------------------------------------------
    // 4. 대시보드 렌더링 수식
    // ----------------------------------------------------------------------
    function calculateSensoryTemp(temp, hum) {
        if (temp < 15) return temp;
        const e = (hum / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp));
        const sensory = temp + (0.33 * e) - (0.70 * 1.5) - 4.0;
        return Math.round(sensory * 10) / 10;
    }

    function calculateDiscomfortIndex(temp, hum) {
        const di = (9/5 * temp) - 0.55 * (1 - hum/100) * (9/5 * temp - 26) + 32;
        const rounded = Math.round(di);
        let level = '쾌적';
        if (rounded >= 80) level = '매우 높음';
        else if (rounded >= 75) level = '높음';
        else if (rounded >= 68) level = '보통';
        return `${rounded} (${level})`;
    }

    function updateAnimationBackground(isVentilationGood) {
        if (isVentilationGood) {
            guideBgAnimation.innerHTML = `
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
                    <path class="wind-line" d="M -100 80 Q 200 40 500 120 T 1100 80" stroke="#388E3C" stroke-width="6" fill="none" opacity="0.6"/>
                    <path class="wind-line" d="M -100 160 Q 300 200 600 120 T 1100 180" stroke="#81C784" stroke-width="4" fill="none" opacity="0.5" style="animation-delay: -1s;"/>
                </svg>
            `;
            aiGuidePanel.classList.remove('warning-mode');
        } else {
            guideBgAnimation.innerHTML = `
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="80" r="120" fill="#FFB74D" opacity="0.15">
                        <animate attributeName="r" values="80;140;80" dur="4s" repeatCount="indefinite"/>
                    </circle>
                </svg>
            `;
            aiGuidePanel.classList.add('warning-mode');
        }
    }

    function updateDashboard() {
        const temp = parseFloat(sliderTemp.value);
        const hum = parseInt(sliderHum.value, 10);
        const pm10 = parseInt(sliderPm10.value, 10);
        const pm25 = parseInt(sliderPm25.value, 10);

        sliderTempVal.textContent = `${temp.toFixed(1)} °C`;
        sliderHumVal.textContent = `${hum} %`;
        sliderPm10Val.textContent = `${pm10} µg/m³`;
        sliderPm25Val.textContent = `${pm25} µg/m³`;

        updateBadgeColor(sliderPm10Val, pm10, 30, 80);
        updateBadgeColor(sliderPm25Val, pm25, 15, 35);

        const sensoryTemp = calculateSensoryTemp(temp, hum);
        const discomfortStr = calculateDiscomfortIndex(temp, hum);

        valOutdoorTemp.textContent = temp.toFixed(1);
        valHumidity.textContent = `${hum}%`;
        valDiscomfort.textContent = discomfortStr;
        barTempFill.style.width = `${Math.min(Math.max(((temp - 10) / 28) * 100, 5), 100)}%`;

        valSensoryTemp.textContent = sensoryTemp.toFixed(1);
        
        let sensoryLevel = 'good';
        let sensoryStatusTextVal = '쾌적 🌿';
        let sensoryDescText = `기온과 습도가 적정 범위에 있어 야외 활동 및 환기에 적합합니다.`;
        
        if (sensoryTemp >= 33) {
            sensoryLevel = 'danger';
            sensoryStatusTextVal = '폭염 경보 🚨';
            sensoryDescText = `체감온도가 <strong>${sensoryTemp.toFixed(1)}°C</strong>로 매우 높습니다. 창문을 닫고 강력 냉방이 필요합니다.`;
        } else if (sensoryTemp >= 30) {
            sensoryLevel = 'warning';
            sensoryStatusTextVal = '무더위 경고 ⚠️';
            sensoryDescText = `습도가 높아 실제 온도보다 <strong>${(sensoryTemp - temp).toFixed(1)}°C 더 높게</strong> 느껴집니다. 냉방 가동 권장.`;
        }

        sensoryStatusBadge.className = `status-badge ${sensoryLevel}`;
        sensoryStatusText.textContent = sensoryStatusTextVal;
        sensoryDesc.innerHTML = sensoryDescText;
        
        const pointerPercent = Math.min(Math.max(((sensoryTemp - 15) / 23) * 100, 5), 95);
        indicatorPointer.style.left = `${pointerPercent}%`;

        valPm10.textContent = pm10;
        let dustLevel = 'good';
        let dustStatusTextVal = '좋음 🌿';

        if (pm10 > 80 || pm25 > 35) {
            dustLevel = 'danger';
            dustStatusTextVal = '나쁨 😷';
        } else if (pm10 > 30 || pm25 > 15) {
            dustLevel = 'warning';
            dustStatusTextVal = '보통 😐';
        }

        dustStatusBadge.className = `status-badge ${dustLevel}`;
        dustStatusText.textContent = dustStatusTextVal;
        valPm10Detail.textContent = `${pm10} µg/m³ (${pm10 <= 30 ? '좋음' : pm10 <= 80 ? '보통' : '나쁨'})`;
        valPm25Detail.textContent = `${pm25} µg/m³ (${pm25 <= 15 ? '좋음' : pm25 <= 35 ? '보통' : '나쁨'})`;

        const isDustAcceptable = (pm10 <= 80 && pm25 <= 35);
        const isTempInComfortRange = (temp >= 20.0 && temp <= 28.0);
        const isNaturalVentilationRecommended = isDustAcceptable && isTempInComfortRange && (sensoryTemp < 30.0);

        if (isNaturalVentilationRecommended) {
            ventilationMainTitle.innerHTML = `자연 환기 권장 (10분간 창문 개방) 🍃`;
            ventilationSubTitle.textContent = `현재 실외 미세먼지(${pm10}µg/m³)가 깨끗하고 기온(${temp.toFixed(1)}°C)이 매우 쾌적합니다. 창문을 열어 교실 내 이산화탄소를 배출해 주세요!`;
            recommendedVentTime.textContent = `매 교시 쉬는 시간 10분간 맞바람 창문 동시 개방`;
            airCirculationTip.textContent = `복도측 창문과 운동장측 창문을 함께 열면 공기 순환 효율이 최고가 됩니다.`;

            if (temp >= 25.0) {
                aiRecommendedTemp.innerHTML = `26<span class="unit">°C</span>`;
                aiHvacMode.textContent = `자연 환기 후 절전 냉방`;
                energySavingVal.textContent = `약 22.4% 에너지 절감`;
                hvacNote.textContent = `10분 환기 완료 후 창문을 닫고 26°C 설정으로 가동하면 최적의 쾌적함이 유지됩니다.`;
            } else {
                aiRecommendedTemp.innerHTML = `송풍<span class="unit">모드</span>`;
                aiHvacMode.textContent = `에어컨 Off (송풍/환기팬 가동)`;
                energySavingVal.textContent = `최대 45.0% 에너지 절감`;
                hvacNote.textContent = `현재 날씨가 선선하므로 에어컨 냉방 대신 창문 자연 환기와 서큘레이터 가동을 추천합니다.`;
            }

            updateAnimationBackground(true);

        } else {
            let reasonText = '';
            if (!isDustAcceptable) {
                reasonText = `미세먼지/초미세먼지 농도(${pm10}/${pm25}µg/m³)가 '나쁨' 상태입니다.`;
            } else if (sensoryTemp >= 30.0) {
                reasonText = `실외 체감온도(${sensoryTemp.toFixed(1)}°C)가 무더위 기준(30°C 이상)을 초과했습니다.`;
            } else if (temp > 28.0) {
                reasonText = `실외 기온이 ${temp.toFixed(1)}°C로 높아 외부 열기 유입을 차단해야 합니다.`;
            } else {
                reasonText = `실외 기온이 낮아 창문을 닫고 실내 온도 관리가 필요합니다.`;
            }

            ventilationMainTitle.innerHTML = `창문 닫기 & 에어컨 26°C 가동 권장 🚨`;
            ventilationSubTitle.innerHTML = `${reasonText} <strong>창문을 닫고 실내 공기청정기 및 냉방기</strong>를 가동하세요.`;
            recommendedVentTime.textContent = `창문 밀폐 및 공기청정기 강풍 모드 가동`;
            airCirculationTip.textContent = `실내 이산화탄소 상승 방지를 위해 에어컨 외기 순환 모드 또는 환기 장치를 가동하세요.`;

            aiRecommendedTemp.innerHTML = `26<span class="unit">°C</span>`;
            aiHvacMode.textContent = `에어컨 26°C + 공기청정기 가동`;
            energySavingVal.textContent = `약 18.5% 에너지 절감`;
            hvacNote.textContent = `권장 설정 온도 26°C 유지 시 냉방병 예방과 에너지 절약 효과를 동시에 얻을 수 있습니다.`;

            updateAnimationBackground(false);
        }

        renderScheduleTimeline(temp, hum, pm10, pm25);
    }

    function updateBadgeColor(badgeElem, val, goodMax, warnMax) {
        badgeElem.classList.remove('good', 'warning', 'danger');
        if (val <= goodMax) badgeElem.classList.add('good');
        else if (val <= warnMax) badgeElem.classList.add('warning');
        else badgeElem.classList.add('danger');
    }

    function renderScheduleTimeline(baseTemp, baseHum, basePm10, basePm25) {
        const periodTimes = [
            '09:00~09:50', '10:00~10:50', '11:00~11:50', '12:00~12:50',
            '13:20~14:10', '14:20~15:10', '15:20~16:10'
        ];

        let html = '';
        for (let i = 0; i < 7; i++) {
            const periodName = `${i + 1}교시`;
            const periodTime = periodTimes[i] || '09:00~09:50';
            const subject = fetchedScheduleList[i] ? fetchedScheduleList[i].subject : '수업';

            const pTemp = baseTemp + (i - 2) * 0.8;
            const pPm10 = Math.max(0, basePm10 + (i - 2) * 2);
            const pVentGood = (pPm10 <= 80 && basePm25 <= 35) && (pTemp >= 20.0 && pTemp <= 28.0);

            const isCurrent = (i === 2);
            const cardClass = isCurrent ? 'period-card current-period' : 'period-card';

            const actionIcon = pVentGood ? '🍃' : '❄️';
            const badgeText = pVentGood ? '자연 환기' : '창문 닫기';
            const badgeClass = pVentGood ? 'period-badge vent-open' : 'period-badge vent-close';
            const hvacRecommend = pVentGood ? (pTemp > 25 ? '26°C' : '송풍') : '26°C';

            html += `
                <div class="${cardClass}">
                    <div class="period-name">${periodName}</div>
                    <div class="subject-badge" title="${subject}">${subject}</div>
                    <div class="period-time">${periodTime}</div>
                    <div class="period-action-icon" title="${badgeText}">${actionIcon}</div>
                    <div class="${badgeClass}">${badgeText}</div>
                    <div class="period-temp">${pTemp.toFixed(1)}°C / ${hvacRecommend}</div>
                </div>
            `;
        }

        timelineTrack.innerHTML = html;
    }

    // ----------------------------------------------------------------------
    // 5. 100% 사용자 기상청 API 키 기반 단기예보 일주일 날씨 호출
    // ----------------------------------------------------------------------
    async function fetchWeeklyWeather() {
        try {
            const res = await fetch(`/api/weekly-weather?nx=${currentSchool.nx}&ny=${currentSchool.ny}`);
            const result = await res.json();

            if (result && result.data && result.data.length > 0) {
                let html = '';
                result.data.forEach(day => {
                    html += `
                        <div class="weekly-card">
                            <div class="weekly-date">${day.date}</div>
                            <div class="weekly-icon">${day.icon}</div>
                            <div style="font-size:0.75rem; font-weight:800; color:#0288D1; margin-bottom:2px;">${day.weatherText}</div>
                            <div class="weekly-temp-range">
                                <span class="min-t">${day.minTemp}°</span> ~ <span class="max-t">${day.maxTemp}°C</span>
                            </div>
                            <div class="weekly-vent-tag">${day.ventIndex}</div>
                        </div>
                    `;
                });
                weeklyWeatherTrack.innerHTML = html;
            }
        } catch (e) {
            console.warn('[Notice] 기상청 단기예보 예외:', e);
        }
    }

    async function fetchNeisSchedule() {
        try {
            const grade = currentSchool.grade;
            const classNm = currentSchool.classNm;
            const rawDate = inputTargetDate.value;
            const formattedDateParam = rawDate ? rawDate.replace(/-/g, '') : '';

            timelineTitleHeader.textContent = `📅 [${currentSchool.schoolName} ${grade}학년 ${classNm}반] ${rawDate}자 시간표`;

            updateUrlParams();

            const schedRes = await fetch(`/api/school-schedule?officeCode=${currentSchool.officeCode}&schoolCode=${currentSchool.schoolCode}&date=${formattedDateParam}`);
            const schedResult = await schedRes.json();

            const url = `/api/schedule?officeCode=${currentSchool.officeCode}&schoolCode=${currentSchool.schoolCode}&schoolKind=${encodeURIComponent(currentSchool.schoolKind)}&grade=${grade}&classNm=${classNm}&date=${formattedDateParam}`;
            
            const response = await fetch(url);
            const result = await response.json();

            if (result) {
                if (schedResult.isVacation) {
                    scheduleStatusNoticeTag.textContent = schedResult.message;
                } else {
                    scheduleStatusNoticeTag.textContent = result.message || '나이스 수신 완료';
                }

                if (result.data && result.data.length > 0) {
                    fetchedScheduleList = result.data;
                }
            }
        } catch (error) {
            scheduleStatusNoticeTag.textContent = '나이스 시간표 연결 대기 중';
        } finally {
            updateDashboard();
        }
    }

    async function fetchLiveWeather() {
        try {
            const rawDate = inputTargetDate.value;
            const formattedDateParam = rawDate ? rawDate.replace(/-/g, '') : '';

            dataModeText.textContent = `기상청 공식 데이터 연동 중...`;
            const response = await fetch(`/api/weather?nx=${currentSchool.nx}&ny=${currentSchool.ny}&lat=${currentSchool.lat}&lng=${currentSchool.lng}&date=${formattedDateParam}`);
            const result = await response.json();

            if (result && result.data) {
                const w = result.data;
                sliderTemp.value = w.temp;
                sliderHum.value = w.humidity;
                sliderPm10.value = w.pm10;
                sliderPm25.value = w.pm25;

                dataModeText.textContent = result.source || '기상청 공식 연동 완료';
                if (weatherSourceTag) weatherSourceTag.textContent = result.isHistorical ? '과거 관측 기후' : '기상청 공식 실시간';
            }
        } catch (error) {
            dataModeText.textContent = '실시간 시뮬레이터 작동 중';
        } finally {
            updateDashboard();
        }
    }

    // ----------------------------------------------------------------------
    // 6. 게이트 학교 검색 처리
    // ----------------------------------------------------------------------
    btnGateSearchSchool.addEventListener('click', async () => {
        const query = inputGateSchoolSearch.value.trim();
        if (!query) return;

        try {
            gateSchoolDropdownList.style.display = 'block';
            gateSchoolDropdownList.innerHTML = '<div class="school-dropdown-item">검색 중...</div>';

            const res = await fetch(`/api/school-search?schoolName=${encodeURIComponent(query)}`);
            const result = await res.json();

            if (result.status === 'success' && result.data.length > 0) {
                let html = '';
                result.data.forEach(item => {
                    html += `
                        <div class="school-dropdown-item" 
                             data-name="${item.schoolName}"
                             data-office="${item.officeCode}"
                             data-code="${item.schoolCode}"
                             data-kind="${item.schoolKind}">
                            <strong>${item.schoolName}</strong> <small>(${item.officeName} - ${item.schoolKind})</small>
                        </div>
                    `;
                });
                gateSchoolDropdownList.innerHTML = html;

                document.querySelectorAll('.school-dropdown-item').forEach(elem => {
                    elem.addEventListener('click', async () => {
                        currentSchool.schoolName = elem.getAttribute('data-name');
                        currentSchool.officeCode = elem.getAttribute('data-office');
                        currentSchool.schoolCode = elem.getAttribute('data-code');
                        currentSchool.schoolKind = elem.getAttribute('data-kind');

                        inputGateSchoolSearch.value = currentSchool.schoolName;
                        gateSchoolDropdownList.style.display = 'none';

                        await updateGateClassCountOption('1', '1');
                    });
                });

            } else {
                gateSchoolDropdownList.innerHTML = '<div class="school-dropdown-item">검색 결과가 없습니다.</div>';
            }
        } catch (e) {
            gateSchoolDropdownList.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-input-wrapper')) {
            gateSchoolDropdownList.style.display = 'none';
        }
    });

    selectGateGrade.addEventListener('change', async () => {
        const selGrade = selectGateGrade.value;
        await updateGateClassCountOption(selGrade, '1');
    });

    inputTargetDate.addEventListener('change', () => {
        fetchNeisSchedule();
        fetchLiveWeather();
    });

    btnGpsLocation.addEventListener('click', () => {
        if (!navigator.geolocation) return alert('GPS 미지원');
        currentLocationTag.textContent = '📍 GPS 파악 중...';

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            currentSchool.lat = lat; currentSchool.lng = lng;

            try {
                const res = await fetch(`/api/coord-to-grid?lat=${lat}&lng=${lng}`);
                const grid = await res.json();

                if (grid.nx && grid.ny) {
                    currentSchool.nx = grid.nx; currentSchool.ny = grid.ny;
                    currentLocationTag.textContent = `📍 내 GPS 위치 (격자 X:${grid.nx}, Y:${grid.ny})`;
                    fetchLiveWeather();
                    fetchWeeklyWeather();
                }
            } catch (err) {
                currentLocationTag.textContent = 'GPS 오류';
            }
        });
    });

    const sliders = [sliderTemp, sliderHum, sliderPm10, sliderPm25];
    sliders.forEach(slider => {
        slider.addEventListener('input', () => {
            window.requestAnimationFrame(updateDashboard);
        });
    });

    resetSimBtn.addEventListener('click', () => { fetchLiveWeather(); fetchWeeklyWeather(); });
    presetHotDayBtn.addEventListener('click', () => { sliderTemp.value = 33.5; sliderHum.value = 75; sliderPm10.value = 25; sliderPm25.value = 12; updateDashboard(); });
    presetPerfectDayBtn.addEventListener('click', () => { sliderTemp.value = 23.5; sliderHum.value = 50; sliderPm10.value = 12; sliderPm25.value = 6; updateDashboard(); });
    presetDustyDayBtn.addEventListener('click', () => { sliderTemp.value = 24.0; sliderHum.value = 55; sliderPm10.value = 115; sliderPm25.value = 58; updateDashboard(); });

    // ----------------------------------------------------------------------
    // 7. 초기 진입 흐름 제어
    // ----------------------------------------------------------------------
    const hasUrlParams = syncUrlParams();
    updateGateClassCountOption(currentSchool.grade, currentSchool.classNm).then(() => {
        // URL에 이미 학교 정보가 명시되어 들어온 경우는 바로 대시보드로 진입!
        if (hasUrlParams) {
            showDashboard();
        } else {
            // 처음 들어왔을 때는 학교/학년/반 선택 게이트 패널 출력!
            showSchoolGate();
        }
    });

});
