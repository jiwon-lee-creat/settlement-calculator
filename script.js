document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#originalRange", { mode: "range", dateFormat: "Y-m-d", locale: "ko" });
  flatpickr("#newRange", { mode: "range", dateFormat: "Y-m-d", locale: "ko" });
});

function fetchReservationData() {
  const resNum = document.getElementById("resNum").value.trim();
  if (!resNum) return;
  // API 호출 예시 (실제 API 주소로 교체 필요)
  console.log("예약번호 조회:", resNum);
}

function parseAmounts(text) {
  const fields = {
    '호스트 임대료': 0, '보증금': 0, '청소비': 0, '공과금': 0, '추가 인원비': 0
  };
  const clean = text.replace(/,/g, '').replace(/원/g, '');
  const matches = [...clean.matchAll(/(호스트 임대료|보증금|청소비|공과금|추가 인원비)[^\d]*(\d+)/g)];
  for (const m of matches) {
    fields[m[1]] += parseInt(m[2]);
  }
  return fields;
}

function format(num) {
  return Number.isInteger(num)
    ? num.toLocaleString() + '원'
    : num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '원';
}

function runCalculation() {
  const [start1, end1] = document.getElementById('originalRange').value.split(' to ');
  const [start2, end2] = document.getElementById('newRange').value.split(' to ');
  const parseDate = s => new Date(s);
  if (!start1 || !end1 || !start2 || !end2) {
    alert("일정을 정확히 선택해주세요.");
    return;
  }

  const origNights = Math.round((parseDate(end1) - parseDate(start1)) / 86400000);
  const newNights = Math.round((parseDate(end2) - parseDate(start2)) / 86400000);

  const amounts = parseAmounts(document.getElementById('amountInput').value);
  const results = {};
  const ratioKeys = ['호스트 임대료', '공과금'];
  const fixedKeys = ['보증금', '청소비', '추가 인원비'];

  ratioKeys.forEach(k => {
    const unit = amounts[k] / origNights;
    results[k] = { before: amounts[k], after: unit * newNights };
  });
  fixedKeys.forEach(k => {
    results[k] = { before: amounts[k], after: amounts[k] };
  });

  const guestBefore = results['호스트 임대료'].before * 1.11 + results['공과금'].before * 1.05 + results['청소비'].before * 1.05 + results['추가 인원비'].before * 1.11 + results['보증금'].before;
  const guestAfter = results['호스트 임대료'].after * 1.11 + results['공과금'].after * 1.05 + results['청소비'].after * 1.05 + results['추가 인원비'].after * 1.11 + results['보증금'].after;
  const hostBefore = results['호스트 임대료'].before * 0.95 + results['공과금'].before + results['청소비'].before + results['추가 인원비'].before;
  const hostAfter = results['호스트 임대료'].after * 0.95 + results['공과금'].after + results['청소비'].after + results['추가 인원비'].after;

  results['게스트 결제금액'] = { before: guestBefore, after: guestAfter };
  results['호스트 정산금액'] = { before: hostBefore, after: hostAfter };

  const tbody = document.getElementById("resultBody");
  tbody.innerHTML = "";
  for (const key in results) {
    const b = results[key].before;
    const a = results[key].after;
    const d = a - b;
    tbody.innerHTML += `<tr><td>${key}</td><td>${format(b)}</td><td>${format(a)}</td><td>${format(d)}</td></tr>`;
  }
  document.getElementById("resultTable").style.display = "table";

  const delta = newNights - origNights;
  const changeText = delta > 0 ? `${delta}박 연장` : delta < 0 ? `${-delta}박 단축` : "변경 없음";
  const todayStr = new Date().toISOString().split("T")[0];
  const unitRent = Math.floor(results['호스트 임대료'].before / origNights);
  const unitUtil = Math.floor(results['공과금'].before / origNights);

  document.getElementById("summary").innerText =
    `게스트 ${guestAfter > guestBefore ? "추가 결제" : "환불"}: ${format(Math.abs(guestAfter - guestBefore))} / ` +
    `호스트 ${hostAfter > hostBefore ? "추가 정산" : "반환"}: ${format(Math.abs(hostAfter - hostBefore))}`;

  document.getElementById("unitRates").innerText =
    `1박 임대료: ${format(unitRent)}, 1박 공과금: ${format(unitUtil)}`;

  document.getElementById("memo").innerText =
    `21. 일정변경: ${start1} ~ ${end1} (${origNights}박)
` +
    `변경 : ${start2} ~ ${end2} (${newNights}박) /${changeText} /1/N박 기준(호스트 임대료: ${format(unitRent)}, 공과금: ${format(unitUtil)}) ` +
    `/호스트 ${format(Math.abs(hostAfter - hostBefore))} ${hostAfter > hostBefore ? '추가정산' : '반환'} ` +
    `/게스트 ${format(Math.abs(guestAfter - guestBefore))} ${guestAfter > guestBefore ? '추가결제' : '환불'} /처리일자 : ${todayStr} /처리자 :`;

  document.getElementById("cofinance").innerText =
    `@finance [일정변경 공유] 예약정보: ${document.getElementById("resNum").value.trim()}
` +
    `일정 변경(${changeText}) 공유 드립니다.

` +
    `@finance [추가 정산 요청]
` +
    `예약정보: ${document.getElementById("resNum").value.trim()}
` +
    `추가정산금액: ${format(hostAfter - hostBefore)} (호스트 임대료 ${format(unitRent)} + 공과금 ${format(unitUtil)} 기준)
` +
    `내용: ${delta}박 연장으로 호스트측으로 추가정산 부탁드립니다.`;
}
