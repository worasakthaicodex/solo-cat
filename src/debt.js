export function debtPayment(principal, interest, initial) {
  const cents = value => {
    const text = String(value ?? '').trim() || '0';
    if (!/^\d+(\.\d{1,2})?$/.test(text)) throw Error('กรอกเงินต้นและดอกเบี้ยเป็นจำนวนไม่ติดลบ ไม่เกิน 2 ตำแหน่ง');
    const n = Math.round(Number(text) * 100);
    if (!Number.isSafeInteger(n)) throw Error('จำนวนเงินมากเกินไป');
    return n;
  };
  const p = cents(principal), i = cents(interest);
  if (!Number.isSafeInteger(p + i) || p + i <= 0) throw Error('ยอดชำระรวมต้องมากกว่า 0');
  const result={expenseCategory:'debt',principalAmount:p/100,interestAmount:i/100,amount:(p+i)/100};
  if(initial!==undefined){const total=cents(initial);if(total<=0)throw Error('กรอกเงินต้นตั้งต้นให้มากกว่า 0');if(p>total)throw Error('เงินต้นที่จ่ายต่อรอบต้องไม่เกินเงินต้นตั้งต้น');result.debtInitial=total/100}
  return result;
}
