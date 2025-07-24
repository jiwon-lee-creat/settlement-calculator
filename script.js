
document.getElementById("calc-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const rent = parseInt(document.getElementById("host-rent").value);
  const utilities = parseInt(document.getElementById("utilities").value);
  const cleaning = parseInt(document.getElementById("cleaning").value);
  const deposit = parseInt(document.getElementById("deposit").value);
  const original = parseInt(document.getElementById("original-nights").value);
  const changed = parseInt(document.getElementById("changed-nights").value);
  const reduced = original - changed;

  const rentPerNight = rent / original;
  const utilitiesPerNight = utilities / original;

  const guestRefund = Math.round(((rentPerNight * 1.11) + (utilitiesPerNight * 1.05)) * reduced);
  const hostDeduct = Math.round(((rentPerNight * 0.95) + utilitiesPerNight) * reduced);

  const resultBox = document.getElementById("result");
  resultBox.innerHTML = `
    ✅ <b>기존 ${original}박 → 변경 ${changed}박</b><br/>
    ✅ ${reduced}박 단축됨<br/><br/>
    💰 게스트 환불 예상 금액: <b>${guestRefund.toLocaleString()}원</b><br/>
    💸 호스트 정산 차감 예상 금액: <b>${hostDeduct.toLocaleString()}원</b>
  `;
});
