// تكوين Google Sheets API
const SPREADSHEET_ID =
  "AKfycbxPjWjr4SnLeL8FDwYcUyGgumifQ393aVFShaTOYPGQ-GtVdPsz4JygqDkeVDgxPya6";
const WHATSAPP_NUMBER = "01226035742"; // استبدل هذا برقم WhatsApp الخاص بك
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw3Vrf3_mAw8GmsmY2djAc68P9dUVrs8vvoX7mCzWwgh009pkoXJFyJ53F_bL2w9O8o/exec";

document
  .getElementById("bookingForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    try {
      // إظهار حالة التحميل
      const submitButton = this.querySelector('button[type="submit"]');
      submitButton.classList.add("loading");
      submitButton.disabled = true;

      // حفظ الحجز مباشرة
      const success = await saveBooking(name, phone, date, time);

      if (success) {
        // إرسال رسالة WhatsApp
        sendWhatsAppMessage(name, phone, date, time);
        alert("تم حجز الموعد بنجاح!");
        this.reset();
      } else {
        alert("حدث خطأ أثناء حفظ الحجز. الرجاء المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("حدث خطأ في النظام. الرجاء المحاولة مرة أخرى لاحقاً.");
    } finally {
      // إزالة حالة التحميل
      const submitButton = this.querySelector('button[type="submit"]');
      submitButton.classList.remove("loading");
      submitButton.disabled = false;
    }
  });

// استخدام iframe مخفي للتواصل مع Google Apps Script
async function saveBooking(name, phone, date, time) {
  return new Promise((resolve, reject) => {
    // إنشاء iframe مخفي
    let iframe = document.getElementById("hidden_iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.name = "hidden_iframe";
      iframe.id = "hidden_iframe";
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }

    // إنشاء نموذج مخفي
    const form = document.createElement("form");
    form.method = "POST";
    form.action = GOOGLE_SCRIPT_URL;
    form.target = "hidden_iframe";
    form.style.display = "none";

    // إضافة البيانات
    const data = {
      action: "saveBooking",
      name: name,
      phone: phone,
      date: date,
      time: time,
    };

    for (const key in data) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    }

    // إضافة مستمع للتحميل
    iframe.onload = function () {
      try {
        // محاولة قراءة الاستجابة
        const response = iframe.contentDocument.body.textContent;
        resolve(response.includes("Success"));
      } catch (e) {
        // إذا لم نتمكن من قراءة الاستجابة، نفترض النجاح
        resolve(true);
      }
    };

    // إضافة النموذج وإرساله
    document.body.appendChild(form);
    form.submit();

    // إزالة النموذج بعد الإرسال
    setTimeout(() => {
      document.body.removeChild(form);
    }, 1000);
  });
}

function sendWhatsAppMessage(name, phone, date, time) {
  const message = `حجز موعد جديد:%0Aالاسم: ${name}%0Aرقم الهاتف: ${phone}%0Aالتاريخ: ${date}%0Aالوقت: ${time}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(whatsappUrl, "_blank");
}
