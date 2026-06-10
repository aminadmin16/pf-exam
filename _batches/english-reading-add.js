/* ชุดข้อสอบภาษาอังกฤษ — Reading Comprehension (แนวอ่านจับใจความ ก.พ.)
   2 ชุดแรกคือชุดที่ผู้ใช้ส่งภาพมา (ร้านอาหาร + ความฝัน) ที่เหลือเป็นชุดใหม่แนวเดียวกัน
   answer = ดัชนีเริ่มที่ 0 (0 = ตัวเลือกแรก) — ตรงกับ schema ของ questions.js
   build ด้วย _batches/build-eng-reading.js (กระจาย passage ลงทุกข้อ + ใส่ id ต่อท้าย) */
module.exports = [

  /* ======================= ชุดที่ 1 (FIXED) — อีเมลร้องเรียนร้านอาหาร ======================= */
  {
    title: "Restaurant Complaint Email",
    year: 2567,
    freq: 5,
    passage:
      "Directions: Read the following passage and choose the best answer for items 1-5.\n\n" +
      "Dear Restaurant Manager,\n\n" +
      "I am writing this email because I was unhappy with the service at your restaurant last Friday night. People say your restaurant is a wonderful, five-star place, so I expected to have a great time. Sadly, it was not good at all.\n\n" +
      "My husband and I got there at 8:00 p.m. and got a table right away. However, we waited for nearly 30 minutes before anyone came to take our order. Also, some workers were not very friendly and ignored us when we needed help.\n\n" +
      "When we finally got our food, one meal was cold, and another dish was wrong. We told the staff about it, but they took a very long time to bring the correct food. Because of this, we did not enjoy our dinner.\n\n" +
      "I know that restaurants can get very busy. Still, I think you should give the good service that your restaurant is famous for. I hope you will check what happened and fix these problems for future customers.\n\n" +
      "Thank you for reading my email. I hope to hear from you soon.\n\n" +
      "Best regards,\nIssabella Jones",
    questions: [
      {
        q: "What is the main purpose of this email?",
        c: [
          "To describe a pleasant dining experience",
          "To explain why the writer likes the restaurant",
          "To report problems and request better service",
          "To recommend the restaurant to others"
        ],
        a: 2,
        e: "ตอบ To report problems and request better service\n\nใจความของอีเมลคือการ \"รายงานปัญหา\" (พนักงานช้า อาหารเย็น อาหารผิดจาน) และช่วงท้ายมีการ \"ขอร้อง\" ให้แก้ไข — \"I hope you will check what happened and fix these problems for future customers.\"\n\nทำไมข้ออื่นผิด: A/B ผิดเพราะเธอเขียนว่า \"Sadly, it was not good at all.\" ไม่ได้ชมหรือชอบร้าน · D ผิดเพราะบริการแย่ขนาดนี้ เธอย่อมไม่เขียนเพื่อแนะนำให้คนอื่นมากิน"
      },
      {
        q: "Which of the following was NOT a problem mentioned about the food?",
        c: [
          "One of the meals served was cold.",
          "One of the dishes was different from what they ordered.",
          "The staff took a very long time to bring the correct food.",
          "The food tasted way too salty and spicy to eat."
        ],
        a: 3,
        e: "ตอบ The food tasted way too salty and spicy to eat.\n\nทริค: ข้อที่ถามว่า \"NOT\" ให้หาตัวเลือกที่ \"ไม่ได้ระบุไว้\" ในเนื้อเรื่อง\n\nในบทความระบุจริงทั้งสามข้อ: one meal was cold (เย็น) · another dish was wrong (ผิดจาน) · they took a very long time to bring the correct food (ช้า) — แต่ \"เค็มและเผ็ดเกินไป\" ไม่มีกล่าวถึงเลย จึงเป็นคำตอบ"
      },
      {
        q: "How did the staff behave when Issabella asked for assistance?",
        c: [
          "They smiled warmly and gave them free drinks.",
          "They were unfriendly and ignored them.",
          "They apologized immediately and fixed the problem.",
          "They asked Issabella to leave the restaurant."
        ],
        a: 1,
        e: "ตอบ They were unfriendly and ignored them.\n\nย่อหน้า 2 ระบุว่า \"some workers were not very friendly and ignored us when we needed help.\" (พนักงานบางคนไม่ค่อยเป็นมิตรและเมินเฉยเมื่อเราต้องการความช่วยเหลือ) ตรงกับตัวเลือกนี้พอดี"
      },
      {
        q: "What can we infer about the restaurant from paragraph 4?",
        c: [
          "It is usually an empty and unpopular restaurant.",
          "It is a famous place that can get very busy.",
          "It only serves food to famous people and celebrities.",
          "It plans to close down next week because of the problems."
        ],
        a: 1,
        e: "ตอบ It is a famous place that can get very busy.\n\nทริค: ข้อ infer ต้อง \"อนุมาน\" จากข้อความ ไม่ใช่หาคำตรงๆ\n\nย่อหน้า 4 เขียนว่า \"I know that restaurants can get very busy\" และ \"the good service that your restaurant is famous for\" — สื่อว่าร้านนี้มีชื่อเสียงและคนเยอะได้ จึงอนุมานได้ว่าเป็นร้านดังที่บางครั้งลูกค้าแน่น"
      },
      {
        q: "What does Issabella hope the manager will do after reading the email?",
        c: [
          "Investigate the situation and ensure better quality for upcoming visitors.",
          "Train the current staff to handle orders faster during busy hours.",
          "Offer a special discount to her family for their next weekend dinner.",
          "Contact her immediately to apologize for the wrong dishes."
        ],
        a: 0,
        e: "ตอบ Investigate the situation and ensure better quality for upcoming visitors.\n\nประโยคสำคัญ: \"I hope you will check what happened and fix these problems for future customers.\" — check what happened = ตรวจสอบเรื่องที่เกิด, for future customers = เพื่อลูกค้าในอนาคต ตรงกับ \"investigate ... for upcoming visitors\" (เป็นการพูดความหมายเดียวกันด้วยคำพ้อง)"
      }
    ]
  },

  /* ======================= ชุดที่ 2 (FIXED) — บทความ The Secret World of Dreams ======================= */
  {
    title: "The Secret World of Dreams",
    year: 2567,
    freq: 5,
    passage:
      "Directions: Read the following passage and choose the best answer for items 1-5.\n\n" +
      "The Secret World of Dreams\n\n" +
      "Have you ever thought about what happens when you sleep? While your body is resting, your brain is still active. It creates stories and pictures in your mind. These are called dreams. In the past, many people thought dreams were special messages or signs about the future. Today, scientists believe that dreaming is a normal part of sleep.\n\n" +
      "Scientists say that most dreams happen during REM sleep. During this stage, your eyes move quickly under your eyelids. Your brain is very active, almost like when you are awake. Your heart beats faster, but your muscles cannot move. This helps stop you from acting out your dreams and keeps you safe while sleeping.\n\n" +
      "Why do we dream? One idea is that dreams help our memory. Every day, we learn many new things. While we sleep, the brain sorts information. It keeps important memories and removes things we do not need. This may help us learn better. Another idea is that dreams help us prepare for difficult situations by letting us practice our feelings and reactions in a safe way.\n\n" +
      "Even though we dream several times each night, we usually forget our dreams quickly. This is because the part of the brain that controls memory is less active while we are dreaming. That is also why dreams can seem strange or confusing.\n\n" +
      "In conclusion, dreams are not magic. They are a natural part of sleep and may help our brains learn, remember, and prepare for a new day.",
    questions: [
      {
        q: "What did people in the past believe about dreams?",
        c: [
          "They believed dreams were a normal and healthy part of sleep.",
          "They believed dreams were special messages or signs about the future.",
          "They believed dreams only happened when a person was wide awake.",
          "They believed dreams could move a sleeping person's body."
        ],
        a: 1,
        e: "ตอบ They believed dreams were special messages or signs about the future.\n\nย่อหน้าแรกระบุ \"In the past, many people thought dreams were special messages or signs about the future.\" (ในอดีตหลายคนคิดว่าความฝันเป็นสารพิเศษหรือสัญญาณบอกอนาคต)\n\nทริค: ระวังคำว่า In the past (อดีต) กับ Today (ปัจจุบัน) — ตัวเลือก A คือสิ่งที่ \"นักวิทยาศาสตร์ยุคนี้\" เชื่อ ไม่ใช่ความเชื่อในอดีต"
      },
      {
        q: "According to the passage, what happens to your muscles during REM sleep?",
        c: [
          "They move quickly to act out the dream.",
          "They cannot move.",
          "They become much stronger than usual.",
          "They make the heart beat slower."
        ],
        a: 1,
        e: "ตอบ They cannot move.\n\nย่อหน้า 2: \"Your heart beats faster, but your muscles cannot move.\" (หัวใจเต้นเร็วขึ้น แต่กล้ามเนื้อขยับไม่ได้) ซึ่งช่วยกันไม่ให้เราลุกขึ้นทำตามความฝันและทำให้ปลอดภัยขณะหลับ"
      },
      {
        q: "Which of the following is mentioned as a possible reason why we dream?",
        c: [
          "Dreams help our body grow taller while we sleep.",
          "Dreams help our memory and help us prepare for difficult situations.",
          "Dreams send real messages to other people.",
          "Dreams make our eyes stop moving completely."
        ],
        a: 1,
        e: "ตอบ Dreams help our memory and help us prepare for difficult situations.\n\nย่อหน้า 3 ให้เหตุผล 2 ข้อ: (1) \"dreams help our memory\" สมองช่วยจัดเรียงข้อมูล เก็บความจำสำคัญ และ (2) \"dreams help us prepare for difficult situations\" ให้เราซ้อมความรู้สึกและปฏิกิริยาอย่างปลอดภัย — ตรงกับตัวเลือกนี้"
      },
      {
        q: "According to the passage, why do we usually forget our dreams quickly?",
        c: [
          "Because we only dream once or twice a year.",
          "Because the part of the brain that controls memory is less active while we dream.",
          "Because our heart stops beating during dreams.",
          "Because dreams happen only when we are awake."
        ],
        a: 1,
        e: "ตอบ Because the part of the brain that controls memory is less active while we dream.\n\nย่อหน้า 4: \"we usually forget our dreams quickly. This is because the part of the brain that controls memory is less active while we are dreaming.\" (สมองส่วนที่ควบคุมความจำทำงานน้อยลงขณะฝัน เราจึงลืมความฝันเร็ว)"
      },
      {
        q: "What is the main idea of the passage?",
        c: [
          "Dreams are magical messages that can predict the future.",
          "Dreams are a natural part of sleep that may help the brain.",
          "Dreams are dangerous and can harm people while they sleep.",
          "Dreams only happen to people who do not sleep well."
        ],
        a: 1,
        e: "ตอบ Dreams are a natural part of sleep that may help the brain.\n\nย่อหน้าสรุป: \"dreams are not magic. They are a natural part of sleep and may help our brains learn, remember, and prepare for a new day.\" จึงเป็นใจความหลักของทั้งบทความ\n\nทริค: หา main idea ให้ดูประโยคสรุป (In conclusion...) มักรวบใจความทั้งเรื่องไว้"
      }
    ]
  },

  /* ======================= ชุดที่ 3 — ประกาศห้องสมุด ======================= */
  {
    title: "City Library New Opening Hours (Notice)",
    year: 2566,
    freq: 4,
    passage:
      "Directions: Read the following notice and choose the best answer for items 1-5.\n\n" +
      "NOTICE: Greenfield City Library\n\n" +
      "Starting from 1 March, the Greenfield City Library will change its opening hours. From Monday to Friday, the library will open from 9:00 a.m. to 8:00 p.m. On Saturdays, it will open from 10:00 a.m. to 6:00 p.m. The library will now be closed every Sunday so that staff can organise the books and clean the building.\n\n" +
      "Members can borrow up to five books at one time for two weeks. If you return a book late, you must pay a fine of 5 baht per day. The new self-service machines near the main door allow members to borrow and return books without waiting in line.\n\n" +
      "For more information, please call 02-123-4567 or visit our website.",
    questions: [
      {
        q: "What is the main purpose of this notice?",
        c: [
          "To advertise new books at the library",
          "To inform members about new opening hours and rules",
          "To ask members to pay for a new library card",
          "To explain how to become a library member"
        ],
        a: 1,
        e: "ตอบ To inform members about new opening hours and rules\n\nประกาศนี้แจ้ง \"เวลาเปิด-ปิดใหม่\" และกฎการยืม-คืน (ยืมได้ 5 เล่ม, ค่าปรับวันละ 5 บาท) จึงเป็นการแจ้งข้อมูลแก่สมาชิก ไม่ใช่โฆษณาหนังสือหรือชวนสมัครสมาชิก"
      },
      {
        q: "According to the notice, when is the library closed?",
        c: [
          "Every Saturday",
          "Every Sunday",
          "Every Monday",
          "Every Friday evening"
        ],
        a: 1,
        e: "ตอบ Every Sunday\n\n\"The library will now be closed every Sunday so that staff can organise the books and clean the building.\" (ปิดทุกวันอาทิตย์เพื่อให้เจ้าหน้าที่จัดหนังสือและทำความสะอาด)"
      },
      {
        q: "Which of the following is NOT mentioned in the notice?",
        c: [
          "The fine for returning a book late",
          "The number of books a member can borrow",
          "The price of buying a new book",
          "The new self-service machines"
        ],
        a: 2,
        e: "ตอบ The price of buying a new book\n\nทริค: ข้อ NOT ให้กวาดหาตัวเลือกที่ \"ไม่มีในเนื้อเรื่อง\"\n\nประกาศพูดถึงค่าปรับ (5 บาท/วัน), จำนวนที่ยืมได้ (5 เล่ม), และเครื่องบริการตนเอง — แต่ \"ราคาซื้อหนังสือใหม่\" ไม่ได้กล่าวถึงเลย (ห้องสมุดให้ยืม ไม่ได้ขายหนังสือ)"
      },
      {
        q: "Why will the library close on that one day each week?",
        c: [
          "So that members can rest at home",
          "So that staff can organise books and clean the building",
          "Because no one visits the library on that day",
          "Because the library has no electricity on that day"
        ],
        a: 1,
        e: "ตอบ So that staff can organise books and clean the building\n\nระบุไว้ตรงๆ ว่า \"...closed every Sunday so that staff can organise the books and clean the building.\""
      },
      {
        q: "What can a member do at the self-service machines?",
        c: [
          "Buy food and drinks",
          "Borrow and return books without waiting in line",
          "Print documents for free",
          "Pay for a new mobile phone"
        ],
        a: 1,
        e: "ตอบ Borrow and return books without waiting in line\n\n\"The new self-service machines ... allow members to borrow and return books without waiting in line.\" (ยืม-คืนหนังสือได้เองโดยไม่ต้องต่อแถว)"
      }
    ]
  },

  /* ======================= ชุดที่ 4 — โฆษณาค่ายภาษาอังกฤษ ======================= */
  {
    title: "Sunshine Summer English Camp (Advertisement)",
    year: 2565,
    freq: 4,
    passage:
      "Directions: Read the following advertisement and choose the best answer for items 1-5.\n\n" +
      "Sunshine Summer English Camp - Learn and Have Fun!\n\n" +
      "Do you want to improve your English during the school holiday? Join the Sunshine Summer English Camp this April! Our camp is open to students aged 10 to 15. Classes are small, with only ten students in each group, so every learner gets attention from the teacher.\n\n" +
      "At our camp, you will not just sit and study. You will play games, sing songs, act in short plays, and join fun activities that help you speak English with confidence. All of our teachers are friendly and experienced.\n\n" +
      "The camp runs for two weeks, from 1 to 14 April, every day from 9:00 a.m. to 3:00 p.m. Lunch and snacks are included. The fee is 3,500 baht. If you sign up before 20 March, you will get a special discount of 500 baht.\n\n" +
      "Places are limited, so book early! Call 081-234-5678 today.",
    questions: [
      {
        q: "Who is this advertisement mainly for?",
        c: [
          "University students who are looking for a job",
          "Children aged 10 to 15 who want to improve their English",
          "Teachers who are looking for work",
          "Parents who want to learn English at night"
        ],
        a: 1,
        e: "ตอบ Children aged 10 to 15 who want to improve their English\n\n\"Our camp is open to students aged 10 to 15.\" และเป้าหมายคือฝึกภาษาอังกฤษช่วงปิดเทอม จึงมุ่งไปที่เด็กวัย 10-15 ปี"
      },
      {
        q: "According to the advertisement, why are the classes good for learning?",
        c: [
          "Because the classes are very large",
          "Because each class has only ten students, so learners get attention",
          "Because the students study alone without a teacher",
          "Because the lessons are all online"
        ],
        a: 1,
        e: "ตอบ Because each class has only ten students, so learners get attention\n\n\"Classes are small, with only ten students in each group, so every learner gets attention from the teacher.\" กลุ่มเล็กทำให้ครูดูแลได้ทั่วถึง"
      },
      {
        q: "How can a student get a discount of 500 baht?",
        c: [
          "By bringing a friend to the camp",
          "By signing up before 20 March",
          "By paying in cash on the first day",
          "By staying for four weeks instead of two"
        ],
        a: 1,
        e: "ตอบ By signing up before 20 March\n\n\"If you sign up before 20 March, you will get a special discount of 500 baht.\" (สมัครก่อน 20 มี.ค. ลด 500 บาท)"
      },
      {
        q: "Which of the following is NOT included in the camp fee?",
        c: [
          "Lunch",
          "Snacks",
          "Transport to the camp",
          "Lessons and activities"
        ],
        a: 2,
        e: "ตอบ Transport to the camp\n\nทริค: ข้อ NOT — หาสิ่งที่ \"ไม่ได้รวมอยู่\"\n\nค่าธรรมเนียมรวม lunch, snacks และกิจกรรม/บทเรียน แต่ไม่มีกล่าวถึง \"การเดินทาง/รถรับส่ง\" จึงเป็นคำตอบ"
      },
      {
        q: "What does the phrase \"Places are limited\" suggest?",
        c: [
          "The camp can accept only a small number of students",
          "The camp is held in a very small room",
          "Students cannot move around during the camp",
          "The camp will run for many months"
        ],
        a: 0,
        e: "ตอบ The camp can accept only a small number of students\n\n\"Places are limited\" = ที่นั่งมีจำกัด จึงสื่อว่ารับได้จำนวนไม่มาก ตามด้วย \"book early!\" (รีบจอง) ยิ่งยืนยันความหมายนี้"
      }
    ]
  },

  /* ======================= ชุดที่ 5 — อีเมลยืนยันการจองโรงแรม ======================= */
  {
    title: "Hotel Booking Confirmation (Email)",
    year: 2566,
    freq: 4,
    passage:
      "Directions: Read the following email and choose the best answer for items 1-5.\n\n" +
      "Dear Mr. Anan,\n\n" +
      "Thank you for choosing Blue Bay Hotel. We are happy to confirm your booking. You have reserved one deluxe room with a sea view for two nights, from 15 to 17 June. Check-in time is 2:00 p.m. and check-out time is 12:00 noon.\n\n" +
      "Your room rate is 2,000 baht per night, and breakfast is included for two guests. Free parking and Wi-Fi are available for all guests. Please note that the hotel does not allow pets.\n\n" +
      "If you need to cancel your booking, please tell us at least three days before your arrival to get a full refund. If you cancel later than this, we will charge you for one night.\n\n" +
      "We look forward to welcoming you. If you have any questions, please reply to this email.\n\n" +
      "Best regards,\nBlue Bay Hotel Reservations Team",
    questions: [
      {
        q: "What is the main purpose of this email?",
        c: [
          "To advertise a new hotel restaurant",
          "To confirm a guest's room booking",
          "To ask the guest to pay a fine",
          "To invite the guest to a party"
        ],
        a: 1,
        e: "ตอบ To confirm a guest's room booking\n\n\"We are happy to confirm your booking.\" อีเมลทั้งฉบับคือการยืนยันรายละเอียดการจองห้องพัก (ประเภทห้อง วันเข้าพัก ราคา เงื่อนไข)"
      },
      {
        q: "How much will Mr. Anan pay for the room in total (not including extra services)?",
        c: [
          "2,000 baht",
          "4,000 baht",
          "6,000 baht",
          "1,000 baht"
        ],
        a: 1,
        e: "ตอบ 4,000 baht\n\nราคา 2,000 บาท/คืน × 2 คืน (15-17 มิ.ย.) = 4,000 บาท\n\nทริค: ข้อคำนวณ ให้จับตัวเลขสองจุด — ราคาต่อคืน (2,000) และจำนวนคืน (two nights) แล้วคูณกัน"
      },
      {
        q: "Which of the following is true according to the email?",
        c: [
          "Guests can bring their pets to the hotel",
          "Breakfast is included for two guests",
          "Check-out time is 2:00 p.m.",
          "Parking costs an extra fee"
        ],
        a: 1,
        e: "ตอบ Breakfast is included for two guests\n\n\"breakfast is included for two guests\" — ตรงตามข้อความ\n\nตัวเลือกอื่นผิด: โรงแรม \"does not allow pets\" (ห้ามสัตว์เลี้ยง) · check-out คือ 12:00 noon ไม่ใช่ 14:00 · parking ฟรี (Free parking)"
      },
      {
        q: "What must Mr. Anan do to get a full refund if he cancels?",
        c: [
          "Cancel on the day of arrival",
          "Cancel at least three days before arrival",
          "Pay for one night first",
          "Send a letter to the hotel manager"
        ],
        a: 1,
        e: "ตอบ Cancel at least three days before arrival\n\n\"please tell us at least three days before your arrival to get a full refund.\" (แจ้งล่วงหน้าอย่างน้อย 3 วันก่อนถึง จึงจะได้เงินคืนเต็ม) ถ้าช้ากว่านั้นจะถูกคิดค่าห้อง 1 คืน"
      },
      {
        q: "The word \"refund\" in the email is closest in meaning to ____.",
        c: [
          "getting your money back",
          "a free gift from the hotel",
          "a special discount card",
          "an extra night for free"
        ],
        a: 0,
        e: "ตอบ getting your money back\n\nทริค: เดาความหมายจากบริบท — ข้อความพูดเรื่องการยกเลิกการจอง คำว่า refund (การคืนเงิน) จึงหมายถึง \"ได้เงินที่จ่ายไปกลับคืนมา\""
      }
    ]
  },

  /* ======================= ชุดที่ 6 — บทความ ประโยชน์ของการเดิน ======================= */
  {
    title: "Why Walking Is Good for You (Article)",
    year: 2565,
    freq: 4,
    passage:
      "Directions: Read the following passage and choose the best answer for items 1-5.\n\n" +
      "Many people think that they need to do hard exercise to stay healthy. However, doctors say that simple walking can also bring many benefits. Walking is free, easy, and safe for almost everyone.\n\n" +
      "First, walking is good for the heart. When you walk every day, your heart becomes stronger and your blood flows better. This can lower the risk of heart disease. Second, walking can help you control your weight, because it burns energy without putting too much stress on your knees.\n\n" +
      "Walking is also good for the mind. A short walk in a park can reduce stress and help you feel happier. Some people say they get their best ideas while walking. Finally, walking outside lets you enjoy nature and meet other people in your neighbourhood.\n\n" +
      "Experts suggest walking for about thirty minutes a day. You do not need special equipment - just a comfortable pair of shoes.",
    questions: [
      {
        q: "What is the main idea of this passage?",
        c: [
          "Walking is a simple activity with many health benefits",
          "Only hard exercise can make people healthy",
          "Walking is dangerous for people with weak knees",
          "People should buy special equipment to walk"
        ],
        a: 0,
        e: "ตอบ Walking is a simple activity with many health benefits\n\nทั้งบทความยกประโยชน์ของการเดินหลายด้าน (หัวใจ น้ำหนัก จิตใจ สังคม) และย้ำว่าทำง่าย ฟรี ปลอดภัย จึงเป็นใจความหลัก"
      },
      {
        q: "According to the passage, how does walking help the heart?",
        c: [
          "It makes the heart beat slower and stops it from working",
          "It makes the heart stronger and helps blood flow better",
          "It has no effect on the heart at all",
          "It makes the heart weaker over time"
        ],
        a: 1,
        e: "ตอบ It makes the heart stronger and helps blood flow better\n\n\"your heart becomes stronger and your blood flows better. This can lower the risk of heart disease.\" (หัวใจแข็งแรงขึ้น เลือดไหลเวียนดีขึ้น ลดความเสี่ยงโรคหัวใจ)"
      },
      {
        q: "Which of the following is mentioned as a benefit for the mind?",
        c: [
          "Walking helps you sleep for twelve hours",
          "Walking can reduce stress and help you feel happier",
          "Walking makes you forget all your problems forever",
          "Walking helps you earn more money"
        ],
        a: 1,
        e: "ตอบ Walking can reduce stress and help you feel happier\n\n\"A short walk in a park can reduce stress and help you feel happier.\" เป็นประโยชน์ด้านจิตใจที่ระบุไว้ตรงๆ"
      },
      {
        q: "Which of the following is NOT mentioned as a benefit of walking?",
        c: [
          "It helps control weight",
          "It is good for the heart",
          "It improves your eyesight",
          "It lets you enjoy nature"
        ],
        a: 2,
        e: "ตอบ It improves your eyesight\n\nทริค: ข้อ NOT — ตัดตัวเลือกที่บทความพูดถึงออกทีละข้อ\n\nบทความพูดถึงการคุมน้ำหนัก หัวใจ และการได้ใกล้ชิดธรรมชาติ แต่ไม่เคยกล่าวถึง \"สายตา/การมองเห็น\" จึงเป็นคำตอบ"
      },
      {
        q: "How long do experts suggest walking each day?",
        c: [
          "About ten minutes",
          "About thirty minutes",
          "About two hours",
          "The whole day"
        ],
        a: 1,
        e: "ตอบ About thirty minutes\n\n\"Experts suggest walking for about thirty minutes a day.\" (ผู้เชี่ยวชาญแนะนำให้เดินประมาณวันละ 30 นาที)"
      }
    ]
  },

  /* ======================= ชุดที่ 7 — บทความ ลดการใช้พลาสติก ======================= */
  {
    title: "Cutting Down on Plastic (Article)",
    year: 2566,
    freq: 4,
    passage:
      "Directions: Read the following passage and choose the best answer for items 1-5.\n\n" +
      "Plastic is used everywhere in our daily lives, from shopping bags to water bottles. It is cheap and useful, but it also causes serious problems for the environment. Most plastic does not break down easily. It can stay in the ground or in the sea for hundreds of years.\n\n" +
      "A lot of plastic waste ends up in the ocean. Sea animals, such as turtles and fish, sometimes eat small pieces of plastic by mistake. This can make them sick or even kill them. When we eat seafood, these tiny pieces of plastic may also come back to us.\n\n" +
      "The good news is that everyone can help. We can carry our own cloth bags when we go shopping. We can use bottles that we can fill again instead of buying new ones every day. We can also say no to plastic straws.\n\n" +
      "Small changes by many people can make a big difference for our planet.",
    questions: [
      {
        q: "What is the writer's main purpose in this passage?",
        c: [
          "To explain why plastic is cheap to produce",
          "To encourage people to use less plastic",
          "To describe how plastic bottles are made",
          "To sell a new kind of plastic bag"
        ],
        a: 1,
        e: "ตอบ To encourage people to use less plastic\n\nบทความชี้ปัญหาของพลาสติกต่อสิ่งแวดล้อม แล้วเสนอวิธีที่ทุกคนช่วยได้ (ถุงผ้า ขวดเติมซ้ำ งดหลอด) จุดมุ่งหมายคือกระตุ้นให้ลดการใช้พลาสติก"
      },
      {
        q: "According to the passage, why is plastic a problem for the environment?",
        c: [
          "It is too expensive for most people",
          "It does not break down easily and can last for hundreds of years",
          "It melts quickly in the sun",
          "It is difficult to buy in shops"
        ],
        a: 1,
        e: "ตอบ It does not break down easily and can last for hundreds of years\n\n\"Most plastic does not break down easily. It can stay in the ground or in the sea for hundreds of years.\" (ย่อยสลายยาก คงอยู่ได้นับร้อยปี)"
      },
      {
        q: "How can plastic in the ocean affect people?",
        c: [
          "It makes the sea water taste sweet",
          "Tiny pieces of plastic may come back to us through seafood",
          "It helps people catch more fish",
          "It cleans the water for swimming"
        ],
        a: 1,
        e: "ตอบ Tiny pieces of plastic may come back to us through seafood\n\n\"When we eat seafood, these tiny pieces of plastic may also come back to us.\" (เมื่อกินอาหารทะเล เศษพลาสติกเล็กๆ อาจย้อนกลับมาสู่ตัวเรา)"
      },
      {
        q: "Which of the following is suggested as a way to use less plastic?",
        c: [
          "Buy a new water bottle every day",
          "Carry your own cloth bag when shopping",
          "Use more plastic straws",
          "Throw plastic into the sea"
        ],
        a: 1,
        e: "ตอบ Carry your own cloth bag when shopping\n\n\"We can carry our own cloth bags when we go shopping.\" เป็นหนึ่งในวิธีที่บทความแนะนำ (อีกตัวเลือกล้วนตรงข้ามกับคำแนะนำ)"
      },
      {
        q: "What does the last sentence mainly tell us?",
        c: [
          "Only the government can solve the problem",
          "Small actions by many people can help the planet",
          "Plastic can never be reduced",
          "People should stop eating seafood completely"
        ],
        a: 1,
        e: "ตอบ Small actions by many people can help the planet\n\n\"Small changes by many people can make a big difference for our planet.\" สื่อว่าการกระทำเล็กๆ ของคนจำนวนมากรวมกันสร้างความเปลี่ยนแปลงใหญ่ได้"
      }
    ]
  },

  /* ======================= ชุดที่ 8 — บันทึกข้อความ วันอบรมพนักงาน ======================= */
  {
    title: "Staff Training Day Announcement (Memo)",
    year: 2567,
    freq: 4,
    passage:
      "Directions: Read the following memo and choose the best answer for items 1-5.\n\n" +
      "MEMO\n\n" +
      "To: All Staff\n" +
      "From: Human Resources Department\n" +
      "Date: 5 May\n" +
      "Subject: Annual Staff Training Day\n\n" +
      "This is to inform all staff that our Annual Training Day will be held on Friday, 23 May, in the main meeting room on the third floor. The training will start at 9:00 a.m. and finish at 4:00 p.m.\n\n" +
      "This year's training will focus on customer service and the use of our new computer system. In the morning, an expert from outside the company will give a talk. In the afternoon, staff will practise using the new system in small groups.\n\n" +
      "All staff are required to attend. Please inform your manager before 16 May if you cannot come for an important reason. Lunch will be provided, but please bring your own notebook and pen.\n\n" +
      "If you have any questions, please contact the Human Resources Department.",
    questions: [
      {
        q: "What is the main purpose of this memo?",
        c: [
          "To announce a staff party",
          "To give information about the Annual Training Day",
          "To introduce a new manager",
          "To ask staff to buy new computers"
        ],
        a: 1,
        e: "ตอบ To give information about the Annual Training Day\n\nหัวเรื่อง (Subject) และเนื้อหาทั้งหมดเป็นการแจ้งรายละเอียดวันอบรมประจำปี (วัน เวลา สถานที่ หัวข้อ เงื่อนไขการเข้าร่วม)"
      },
      {
        q: "What will staff do in the afternoon?",
        c: [
          "Listen to a talk by an outside expert",
          "Practise using the new computer system in small groups",
          "Go home early",
          "Clean the meeting room"
        ],
        a: 1,
        e: "ตอบ Practise using the new computer system in small groups\n\n\"In the afternoon, staff will practise using the new system in small groups.\" ส่วนการฟังผู้เชี่ยวชาญบรรยายเป็นช่วงเช้า (ระวังสลับเช้า/บ่าย)"
      },
      {
        q: "What should staff do if they cannot attend?",
        c: [
          "Send an email to all staff",
          "Inform their manager before 16 May for an important reason",
          "Pay a fine to the company",
          "Come on a different day"
        ],
        a: 1,
        e: "ตอบ Inform their manager before 16 May for an important reason\n\n\"Please inform your manager before 16 May if you cannot come for an important reason.\" (ถ้ามาไม่ได้ด้วยเหตุจำเป็น ให้แจ้งหัวหน้าก่อน 16 พ.ค.)"
      },
      {
        q: "Which of the following will staff need to bring themselves?",
        c: [
          "Lunch",
          "A notebook and pen",
          "A computer",
          "A chair"
        ],
        a: 1,
        e: "ตอบ A notebook and pen\n\n\"Lunch will be provided, but please bring your own notebook and pen.\" (อาหารกลางวันจัดให้ แต่ต้องนำสมุดและปากกามาเอง)"
      },
      {
        q: "The word \"required\" in \"All staff are required to attend\" is closest in meaning to ____.",
        c: [
          "must",
          "allowed",
          "happy",
          "afraid"
        ],
        a: 0,
        e: "ตอบ must\n\nทริค: เดาจากบริบท — \"are required to attend\" หมายถึง \"ต้องเข้าร่วม\" (เป็นข้อบังคับ) จึงใกล้เคียงกับ must มากที่สุด"
      }
    ]
  },

  /* ======================= ชุดที่ 9 — บทความ การช้อปปิ้งออนไลน์ ======================= */
  {
    title: "Shopping Online: Good and Bad Sides (Article)",
    year: 2566,
    freq: 4,
    passage:
      "Directions: Read the following passage and choose the best answer for items 1-5.\n\n" +
      "In the past, people had to go to a shop to buy what they needed. Today, many people shop online using their phones or computers. Online shopping has become very popular because it is convenient.\n\n" +
      "There are many good things about shopping online. You can buy products at any time, even late at night. You do not have to travel or wait in long lines. It is also easy to compare prices from different shops before you decide to buy.\n\n" +
      "However, online shopping also has some bad sides. You cannot touch or try the product before it arrives, so it may not be what you expected. Sometimes the product takes a long time to be delivered. There is also a risk that dishonest sellers may cheat buyers.\n\n" +
      "To shop safely online, you should buy from shops that have good reviews and never share your password with anyone.",
    questions: [
      {
        q: "What is this passage mainly about?",
        c: [
          "How to start your own online shop",
          "The good and bad sides of online shopping",
          "Why shops in the city are closing",
          "The history of the first computer"
        ],
        a: 1,
        e: "ตอบ The good and bad sides of online shopping\n\nบทความแบ่งชัดเป็นข้อดี (สะดวก ซื้อได้ทุกเวลา เทียบราคาง่าย) และข้อเสีย (จับสินค้าไม่ได้ ส่งช้า เสี่ยงโดนโกง) จึงเป็นเรื่อง \"ข้อดี-ข้อเสียของการช้อปออนไลน์\""
      },
      {
        q: "According to the passage, what is one advantage of online shopping?",
        c: [
          "You can touch the product before buying",
          "You can buy products at any time, even late at night",
          "The product always arrives in one minute",
          "It is always cheaper than shops"
        ],
        a: 1,
        e: "ตอบ You can buy products at any time, even late at night\n\n\"You can buy products at any time, even late at night.\" เป็นข้อดีที่ระบุไว้ตรงๆ (การจับสินค้าก่อนซื้อกลับเป็นข้อเสียของออนไลน์)"
      },
      {
        q: "Which of the following is mentioned as a bad side of online shopping?",
        c: [
          "You can compare prices easily",
          "You cannot try the product before it arrives",
          "You can shop from home",
          "You do not have to wait in lines"
        ],
        a: 1,
        e: "ตอบ You cannot try the product before it arrives\n\n\"You cannot touch or try the product before it arrives, so it may not be what you expected.\" เป็นข้อเสีย ส่วนตัวเลือกอื่นล้วนเป็นข้อดี"
      },
      {
        q: "What advice does the writer give for shopping safely online?",
        c: [
          "Share your password with the seller",
          "Buy from shops that have good reviews",
          "Always pay with cash at the door",
          "Buy the most expensive product"
        ],
        a: 1,
        e: "ตอบ Buy from shops that have good reviews\n\n\"you should buy from shops that have good reviews and never share your password with anyone.\" (ซื้อจากร้านที่รีวิวดี และห้ามบอกรหัสผ่านแก่ใคร)"
      },
      {
        q: "What can be inferred about online shopping from the passage?",
        c: [
          "It is perfect and has no problems",
          "It is useful but buyers should still be careful",
          "It is only for young people",
          "It will soon disappear completely"
        ],
        a: 1,
        e: "ตอบ It is useful but buyers should still be careful\n\nทริค: ข้อ infer — รวมภาพทั้งเรื่อง บทความบอกทั้งข้อดีและข้อเสีย พร้อมคำแนะนำให้ช้อปอย่างปลอดภัย จึงอนุมานได้ว่า \"มีประโยชน์แต่ผู้ซื้อต้องระวัง\""
      }
    ]
  },

  /* ======================= ชุดที่ 10 — จดหมายเชิญร่วมเก็บขยะชุมชน ======================= */
  {
    title: "Invitation to a Community Clean-Up (Letter)",
    year: 2565,
    freq: 4,
    passage:
      "Directions: Read the following letter and choose the best answer for items 1-5.\n\n" +
      "Dear Neighbours,\n\n" +
      "Our community group would like to invite you to join a special clean-up day at Riverside Park on Sunday, 8 June. We will meet at the park entrance at 8:00 a.m. and work together until about 11:00 a.m.\n\n" +
      "Our park is a lovely place where children play and families relax. Lately, however, there has been a lot of rubbish around the river. We believe that if we all help, we can make our park clean and beautiful again.\n\n" +
      "You do not need to bring anything special. We will provide gloves, rubbish bags, and cold drinking water. We only ask that you wear comfortable clothes and a hat, because the weather can be hot.\n\n" +
      "After we finish, we will share a simple lunch together. This is a great chance to help our community and to meet your neighbours. We hope to see you there!\n\n" +
      "Warm regards,\nThe Riverside Community Group",
    questions: [
      {
        q: "Why was this letter written?",
        c: [
          "To invite neighbours to a clean-up day at the park",
          "To ask neighbours to pay for a new park",
          "To complain about noisy children",
          "To sell tickets for a concert"
        ],
        a: 0,
        e: "ตอบ To invite neighbours to a clean-up day at the park\n\n\"Our community group would like to invite you to join a special clean-up day at Riverside Park...\" จุดประสงค์คือเชิญเพื่อนบ้านมาร่วมวันเก็บขยะที่สวน"
      },
      {
        q: "What time will the activity finish?",
        c: [
          "At 8:00 a.m.",
          "At about 11:00 a.m.",
          "At 2:00 p.m.",
          "In the evening"
        ],
        a: 1,
        e: "ตอบ At about 11:00 a.m.\n\n\"We will meet at the park entrance at 8:00 a.m. and work together until about 11:00 a.m.\" — 8:00 คือเวลาเริ่ม ส่วนเลิกประมาณ 11:00 (ระวังสลับเวลาเริ่ม/เลิก)"
      },
      {
        q: "What will the community group provide for the volunteers?",
        c: [
          "New clothes and shoes",
          "Gloves, rubbish bags, and drinking water",
          "Money for each hour of work",
          "A free trip to another city"
        ],
        a: 1,
        e: "ตอบ Gloves, rubbish bags, and drinking water\n\n\"We will provide gloves, rubbish bags, and cold drinking water.\" (จัดเตรียมถุงมือ ถุงขยะ และน้ำดื่มเย็นให้)"
      },
      {
        q: "Why are people asked to wear a hat?",
        c: [
          "Because the weather can be hot",
          "Because it is a formal event",
          "Because the park has many insects",
          "Because it is a rule of the city"
        ],
        a: 0,
        e: "ตอบ Because the weather can be hot\n\n\"...wear comfortable clothes and a hat, because the weather can be hot.\" (ให้ใส่หมวกเพราะอากาศอาจร้อน)"
      },
      {
        q: "Besides cleaning the park, what is another benefit mentioned in the letter?",
        c: [
          "Volunteers will receive a prize",
          "It is a chance to meet your neighbours",
          "Volunteers can take park plants home",
          "It will make people famous"
        ],
        a: 1,
        e: "ตอบ It is a chance to meet your neighbours\n\n\"This is a great chance to help our community and to meet your neighbours.\" นอกจากช่วยทำความสะอาดแล้ว ยังเป็นโอกาสได้รู้จักเพื่อนบ้าน"
      }
    ]
  }

];
