// تكوين Google Sheets API
const SPREADSHEET_ID = "11wNQXKFqsb1ZILXNGJBiGJAgJGf0yX9yt73ABjBPnn4"; // قم بتغيير هذا إلى معرف جدول البيانات الخاص بك
const WHATSAPP_NUMBER = "01226035742"; // رقم الواتساب
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwelPPVhjenjB9qR7BWg2CthkNVkCOuxhKvzd8sgUVei5m-iorCLvbjf1LG5P3MPrch/exec";

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
        alert(
          "عذراً، هذا الموعد محجوز مسبقاً أو حدث خطأ. الرجاء المحاولة مرة أخرى."
        );
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

async function saveBooking(name, phone, date, time) {
  try {
    // تحضير البيانات كمعلمات URL
    const params = new URLSearchParams({
      action: "saveBooking",
      name: name,
      phone: phone,
      date: date,
      time: time,
    });

    // إضافة معلمة عشوائية لتجنب التخزين المؤقت
    params.append("nocache", new Date().getTime());

    // بناء URL كامل مع المعلمات
    const url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;

    // إرسال الطلب
    const response = await fetch(url, {
      method: "GET",
      mode: "no-cors",
    });

    // نظراً لاستخدام mode: 'no-cors'، سنفترض أن العملية نجحت إذا لم يكن هناك خطأ
    return true;
  } catch (error) {
    console.error("Error saving booking:", error);
    return false;
  }
}

function sendWhatsAppMessage(name, phone, date, time) {
  const message = `حجز موعد جديد:%0Aالاسم: ${name}%0Aرقم الهاتف: ${phone}%0Aالتاريخ: ${date}%0Aالوقت: ${time}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(whatsappUrl, "_blank");
}
