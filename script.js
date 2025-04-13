document
  .getElementById("bookingForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    // التحقق من تكرار الموعد
    const isBooked = await checkBooking(date, time);
    if (isBooked) {
      alert("هذا الموعد محجوز بالفعل! الرجاء اختيار موعد آخر.");
      return;
    }

    // إرسال البيانات إلى Google Sheets
    await saveToGoogleSheets(name, phone, date, time);

    // إعداد رسالة WhatsApp
    const message = `حجز موعد جديد:\nالاسم: ${name}\nرقم الهاتف: ${phone}\nالتاريخ: ${date}\nالوقت: ${time}`;
    const whatsappUrl = `https://wa.me/+01226035742?text=${encodeURIComponent(
      message
    )}`;

    // فتح WhatsApp
    window.open(whatsappUrl, "_blank");

    // تنظيف النموذج
    document.getElementById("bookingForm").reset();
    alert("تم إرسال الحجز بنجاح!");
  });

async function checkBooking(date, time) {
  const response = await fetch(
    "https://script.google.com/macros/s/AKfycbw3Vrf3_mAw8GmsmY2djAc68P9dUVrs8vvoX7mCzWwgh009pkoXJFyJ53F_bL2w9O8o/exec?action=checkBooking&date=" +
      date +
      "&time=" +
      time
  );
  const result = await response.json();
  return result.isBooked;
}

async function saveToGoogleSheets(name, phone, date, time) {
  const data = { name, phone, date, time };
  await fetch(
    "https://script.google.com/macros/s/AKfycbw3Vrf3_mAw8GmsmY2djAc68P9dUVrs8vvoX7mCzWwgh009pkoXJFyJ53F_bL2w9O8o/exec",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}
