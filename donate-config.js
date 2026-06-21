/* ============================================================
   ตั้งค่าช่องทางบริจาค/สนับสนุน  ← แก้ไขเฉพาะไฟล์นี้ไฟล์เดียว
   ============================================================
   วิธีตั้งค่า QR (เลือกอย่างใดอย่างหนึ่ง):
   • วิธีที่ 1 (ง่ายสุด): ใส่ "เบอร์พร้อมเพย์" ที่ promptpayId แล้วแอปจะสร้าง QR ให้อัตโนมัติ
       - เบอร์มือถือ เช่น "0812345678"
       - หรือเลขบัตรประชาชน 13 หลัก เช่น "1234567890123"
   • วิธีที่ 2: เซฟรูป QR พร้อมเพย์จากแอปธนาคารมาวางที่  assets/donate-qr.png
       แล้ว "เว้นว่าง" promptpayId ไว้ (ระบบจะใช้รูปแทน)
   ============================================================ */
window.DONATE = {
  enabled: true,                                   // false = ซ่อนปุ่มบริจาคทั้งหมด
  name: "สนับสนุนผู้พัฒนา",                          // ชื่อที่แสดงบนป๊อปอัป
  message: "ถ้าแอปนี้มีประโยชน์ เลี้ยงกาแฟผู้พัฒนาสักแก้วได้นะครับ ☕",

  promptpayId: "",                                 // เว้นว่าง = ใช้รูป QR ด้านล่าง
  qrImage: "assets/donate-qr.png",                 // ← ใช้รูป QR พร้อมเพย์ (TrueMoney) ที่วางไว้

  payeeName: "สัจจา ชัยแสนพา",                       // ชื่อบัญชีผู้รับ แสดงใต้ QR
  bankName: "พร้อมเพย์ (TrueMoney)",                // ป้ายช่องทาง
  bankAccount: "",                                  // (เว้นว่าง — สแกน QR ได้เลย)

  suggestedAmounts: [20, 50, 100],                 // ปุ่มจำนวนเงินแนะนำ (ใช้ได้เมื่อตั้ง promptpayId)

  // ผู้พัฒนา — แสดงลิงก์ Facebook ใต้ QR (กดที่ชื่อเพื่อไปหน้าโปรไฟล์)
  developerFacebookName: "Satja Chaiseanpha",
  developerFacebookUrl: "https://www.facebook.com/search/top?q=Satja%20Chaiseanpha",  // ← แนะนำให้เปลี่ยนเป็นลิงก์โปรไฟล์จริงของคุณ เช่น https://www.facebook.com/your.profile

  // เปิดแท็บใหม่เมื่อกด "ส่งคำตอบ" — สุ่มลิงก์จาก shopeeUrls (ว่าง = ไม่เปิด / ไม่แสดง Ad)
  shopeeUrls: [
    "https://s.shopee.co.th/8pja1egnWL",
    "https://s.shopee.co.th/50WrV4PDSx",
    "https://s.shopee.co.th/2LW6KDTtU0",
    "https://s.shopee.co.th/50WrVKRgq2",
    "https://s.shopee.co.th/3Vi3iomVyZ",
    "https://s.shopee.co.th/2g8wjNXWMM"
  ],
  shopeeIcon: "assets/shopee-icon.svg",
  shopeeNote: "คลิกเพื่อเปิด Shopee ชั่วคราวตามนโยบายรักษาความเร็วเซิร์ฟเวอร์ Pro เกิน Limit (กดเปิดแล้วสลับจอกลับมาได้เลย)"
};
