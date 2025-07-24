function dateDiffInNights(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = e - s;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function formatCurrency(value) {
  return value.toLocaleString('ko-KR') + '원';
}

function calculate() {
  const oldStart = document.getElementById('oldStart').value;
  const oldEnd = document.getElementById('oldEnd').value;
  const newStart = document.getElementById('newStart').value;
  const newEnd = document.getElementById('newEnd').value;
  const totalHostRent = parseInt(document.getElementById('totalHostRent').value || '0');
  const totalUtility = parseInt(document.getElementById('totalUtility').value || '0');
  const cleaning = parseInt(document.getElementById('cleaning').value || '0');
  const deposit = parseInt(document.getElementById('deposit').value || '0');
  const customHostRent = parseInt(document.getElementById('customHostRent').value || '0');
  const customUtility = parseInt(document.getElementById('customUtility').value || '0');

  const oldNights = dateDiffInNights(oldStart, oldEnd);
  const newNights = dateDiffInNights(newStart, newEnd);
  const nightDiff = newNights - oldNights;

  let summaryText = `${Math.abs(nightDiff)}박 ` + (nightDiff > 0 ? '연장됨' : '단축됨');
  document.getElementById('dateSummary').innerText = summaryText;

  const guestPerNight = (customHostRent * 1.11) + (customUtility * 1.05);
  const hostPerNight = (customHostRent * 0.95) + customUtility;
  const guestTotal = Math.abs(nightDiff) * guestPerNight;
  const hostTotal = Math.abs(nightDiff) * hostPerNight;

  let guestLabel = nightDiff > 0 ? '게스트 추가 결제 금액' : '게스트 환불 금액';
  let hostLabel = nightDiff > 0 ? '호스트 추가 정산 금액' : '호스트 차감 정산 금액';

  document.getElementById('resultArea').innerHTML = `
    <p><strong>📌 ${summaryText}</strong></p>
    <ul>
      <li>${guestLabel}: <strong>${formatCurrency(guestTotal)}</strong> (수식: (임대료 ${customHostRent} * 1.11) + (공과금 ${customUtility} * 1.05) * ${Math.abs(nightDiff)})</li>
      <li>${hostLabel}: <strong>${formatCurrency(hostTotal)}</strong> (수식: (임대료 ${customHostRent} * 0.95) + (공과금 ${customUtility}) * ${Math.abs(nightDiff)})</li>
    </ul>
  `;
}
