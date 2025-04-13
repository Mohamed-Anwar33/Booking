// تكوين Google Sheets API
const SPREADSHEET_ID = "11wNQXKFqsb1ZILXNGJBiGJAgJGf0yX9yt73ABjBPnn4";
const WHATSAPP_NUMBER = "1234567890"; // استبدل هذا برقم WhatsApp الخاص بك
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw3Vrf3_mAw8GmsmY2djAc68P9dUVrs8vvoX7mCzWwgh009pkoXJFyJ53F_bL2w9O8o/exec";

// استخدام cors-anywhere كـ proxy
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";

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

      // التحقق من توفر الموعد
      const isAvailable = await checkBooking(date, time);

      if (!isAvailable) {
        alert("عذراً، هذا الموعد محجوز مسبقاً. الرجاء اختيار موعد آخر.");
        return;
      }

      // حفظ الحجز
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

async function checkBooking(date, time) {
  try {
    const url = `${GOOGLE_SCRIPT_URL}?action=checkBooking&date=${date}&time=${time}`;
    const response = await fetch(`${PROXY_URL}${url}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return !data.isBooked; // نعكس القيمة لأن الكود في Google Apps Script يعيد isBooked
  } catch (error) {
    console.error("Error checking booking:", error);
    throw error;
  }
}

async function saveBooking(name, phone, date, time) {
  try {
    const url = `${GOOGLE_SCRIPT_URL}`;
    const response = await fetch(`${PROXY_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        date,
        time,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return data === "Success";
  } catch (error) {
    console.error("Error saving booking:", error);
    throw error;
  }
}

function sendWhatsAppMessage(name, phone, date, time) {
  const message = `حجز موعد جديد:%0Aالاسم: ${name}%0Aرقم الهاتف: ${phone}%0Aالتاريخ: ${date}%0Aالوقت: ${time}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(whatsappUrl, "_blank");
}
