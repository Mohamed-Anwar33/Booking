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
  return new Promise((resolve, reject) => {
    // إنشاء نموذج البيانات
    const formData = new FormData();
    formData.append("action", "saveBooking");
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("date", date);
    formData.append("time", time);

    // إنشاء عنصر النموذج
    const form = document.createElement("form");
    form.method = "POST";
    form.action = GOOGLE_SCRIPT_URL;

    // إضافة البيانات إلى النموذج
    for (const [key, value] of formData.entries()) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    // إنشاء iframe للاستجابة
    const iframe = document.createElement("iframe");
    iframe.name = "submit-iframe";
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // تعيين النموذج ليستخدم الـ iframe
    form.target = "submit-iframe";
    document.body.appendChild(form);

    // معالجة الاستجابة
    iframe.onload = function () {
      try {
        const response = iframe.contentWindow.document.body.textContent;
        console.log("Response:", response);
        resolve(response && response.includes("Success"));
      } catch (error) {
        console.error("Error reading response:", error);
        resolve(false);
      } finally {
        // تنظيف العناصر
        setTimeout(() => {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
        }, 1000);
      }
    };

    // إرسال النموذج
    form.submit();
  });
}

function sendWhatsAppMessage(name, phone, date, time) {
  const message = `حجز موعد جديد:%0Aالاسم: ${name}%0Aرقم الهاتف: ${phone}%0Aالتاريخ: ${date}%0Aالوقت: ${time}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(whatsappUrl, "_blank");
}
