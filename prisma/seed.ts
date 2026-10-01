// Seed: demo teachers, users, students, content library, demo lessons/revisions
// Run: bun run seed
import { PrismaClient } from "@prisma/client";
import { createHash, randomBytes } from "crypto";

const db = new PrismaClient();

// scrypt hash (must match src/lib/auth.ts)
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(salt + password).digest("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("Seeding...");

  // ---- Admin ----
  const admin = await db.user.upsert({
    where: { email: "admin@irshademadina.com" },
    update: {},
    create: {
      email: "admin@irshademadina.com",
      name: "Madrasah Admin",
      passwordHash: hashPassword("admin123"),
      role: "ADMIN",
    },
  });

  // ---- Teachers ----
  const t1User = await db.user.upsert({
    where: { email: "qari@irshademadina.com" },
    update: {},
    create: {
      email: "qari@irshademadina.com",
      name: "Qari Muhammad Iqbal",
      passwordHash: hashPassword("teacher123"),
      role: "TEACHER",
      timezone: "Asia/Karachi",
    },
  });
  const t1 = await db.teacher.upsert({
    where: { userId: t1User.id },
    update: {},
    create: {
      userId: t1User.id,
      title: "Qari",
      bio: "Founder of Madrasah Irshad-e-Madina, Lahore (2011). Over 25 years of experience teaching Qur'an with tajweed to children and adults. Trained in the line of Sheikh Sayyed Hafiz Irshad Hussain Naqshbandi.",
      ijazah: "Sanad in Qur'an recitation through the Naqshbandi line of Sheikh Sayyed Hafiz Irshad Hussain",
      experience: 25,
      languages: "Urdu, English",
      teachesBest: "Beginner children, Qaida, Nazra and Tajweed",
      gender: "male",
      published: true,
    },
  });

  const t2User = await db.user.upsert({
    where: { email: "hafiza@irshademadina.com" },
    update: {},
    create: {
      email: "hafiza@irshademadina.com",
      name: "Hafiza Ayesha Iqbal",
      passwordHash: hashPassword("teacher123"),
      role: "TEACHER",
      timezone: "Asia/Karachi",
    },
  });
  const t2 = await db.teacher.upsert({
    where: { userId: t2User.id },
    update: {},
    create: {
      userId: t2User.id,
      title: "Hafiza",
      bio: "Co-founder. Hafiza of the Qur'an, teaching girls and children since 2011 with gentle, structured methods.",
      ijazah: "Hifz-e-Qur'an completed under the supervision of Qari Muhammad Iqbal",
      experience: 14,
      languages: "Urdu, English",
      teachesBest: "Girls of all ages, beginner Qaida, Hifz preparation",
      gender: "female",
      published: true,
    },
  });

  // ---- Parent + Students ----
  const parent = await db.user.upsert({
    where: { email: "parent@example.com" },
    update: {},
    create: {
      email: "parent@example.com",
      name: "Fatima Khan",
      passwordHash: hashPassword("parent123"),
      role: "PARENT",
      timezone: "Europe/London",
    },
  });

  const s1 = await db.student.upsert({
    where: { id: "demo-student-1" },
    update: {},
    create: {
      id: "demo-student-1",
      name: "Ayesha K.",
      age: 9,
      level: "NAZRA",
      teacherId: t2.id,
      parentUserId: parent.id,
      guardianUserId: parent.id,
      timezone: "Europe/London",
      status: "ACTIVE",
    },
  });
  const s2 = await db.student.upsert({
    where: { id: "demo-student-2" },
    update: {},
    create: {
      id: "demo-student-2",
      name: "Yusuf K.",
      age: 11,
      level: "TAJWEED",
      teacherId: t1.id,
      parentUserId: parent.id,
      guardianUserId: parent.id,
      timezone: "Europe/London",
      status: "ACTIVE",
    },
  });

  // Student login (child account)
  const studentUser = await db.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      name: "Ayesha K.",
      passwordHash: hashPassword("student123"),
      role: "STUDENT",
      timezone: "Europe/London",
    },
  });
  await db.student.update({ where: { id: s1.id }, data: {} });
  // link by name convention (in production this would be a proper relation)
  console.log("student user:", studentUser.email);

  // ---- Content library ----
  const contentCount = await db.contentItem.count();
  if (contentCount === 0) {
    const items: Array<{
      category: string; title: string; arabic?: string; transliteration?: string; translation?: string; notes?: string; order: number;
    }> = [
      { category: "KALIMA", title: "First Kalima — Tayyabah", arabic: "لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُولُ اللهِ", transliteration: "Lā ilāha illā-llāhu Muhammadur rasūlu-llāh", translation: "There is no god but Allah, and Muhammad is the Messenger of Allah.", order: 1 },
      { category: "KALIMA", title: "Second Kalima — Shahadat", arabic: "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", transliteration: "Ash-hadu an lā ilāha illā-llāhu wa ash-hadu anna Muhammadan 'abduhu wa rasūluh", translation: "I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and messenger.", order: 2 },
      { category: "KALIMA", title: "Third Kalima — Tamjeed", arabic: "سُبْحَانَ اللهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلٰهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ", transliteration: "Subhānallāhi wal-hamdu lillāhi wa lā ilāha illā-llāhu wallāhu akbar", translation: "Glory be to Allah, all praise is for Allah, there is no god but Allah, and Allah is the greatest.", order: 3 },
      { category: "KALIMA", title: "Fourth Kalima — Tauheed", arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ", transliteration: "Lā hawla wa lā quwwata illā billāhil-'aliyyil-'azīm", translation: "There is no might nor power except with Allah, the Most High, the Most Great.", order: 4 },
      { category: "KALIMA", title: "Fifth Kalima — Astaghfar", arabic: "أَسْتَغْفِرُ اللهَ رَبِّي وَأَتُوبُ إِلَيْهِ", transliteration: "Astaghfirullāha rabbī wa atūbu ilayh", translation: "I seek forgiveness from Allah, my Lord, and I turn to Him in repentance.", order: 5 },
      { category: "KALIMA", title: "Sixth Kalima — Rad-e-Kufr", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ بِهِ", transliteration: "Allāhumma innī a'ūdhu bika min an ushrika bika shay'an wa ana a'lamu bih", translation: "O Allah, I seek refuge in You from associating anything with You knowingly.", order: 6 },
      { category: "DUA", title: "Dua before eating", arabic: "بِسْمِ اللهِ وَعَلَى بَرَكَةِ اللهِ", transliteration: "Bismillāhi wa 'alā barakatillāh", translation: "In the name of Allah and with the blessings of Allah.", order: 10 },
      { category: "DUA", title: "Dua after eating", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا", transliteration: "Al-hamdu lillāhil-ladhī at'amana wa saqānā", translation: "All praise is for Allah who gave us food and drink.", order: 11 },
      { category: "DUA", title: "Dua before sleeping", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", transliteration: "Bismika Allāhumma amūtu wa ahyā", translation: "In Your name, O Allah, I die and I live.", order: 12 },
      { category: "DUA", title: "Dua when waking up", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", transliteration: "Al-hamdu lillāhil-ladhī ahyānā ba'da mā amātanā wa ilayhin-nushūr", translation: "All praise is for Allah who gave us life after death, and to Him is the return.", order: 13 },
      { category: "DUA", title: "Dua for parents", arabic: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", transliteration: "Rabbighfir lī wa li-wāidayya warhamhumā kamā rabbayānī saghīrā", translation: "My Lord, forgive me and my parents, and have mercy on them as they raised me when I was small.", order: 14 },
      { category: "NAMAZ", title: "Salah — the five daily prayers", notes: "Fajr (2), Zuhr (4), Asr (4), Maghrib (3), Isha (4). Teach wudu first, then the positions: qiyam, ruku, sajdah, jalsa, salam.", order: 20 },
      { category: "NAMAZ", title: "Attahiyyaat", arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ", transliteration: "Attahiyyātu lillāhi was-salawātu wat-tayyibāt, assalāmu 'alayka ayyuhan-nabiyyu wa rahmatullāhi wa barakātuh", translation: "All greetings, prayers and good things are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings.", order: 21 },
      { category: "NAMAZ", title: "Durood Ibrahim", arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ", transliteration: "Allāhumma salli 'alā Muhammadin wa 'alā āli Muhammadin kamā sallayta 'alā Ibrāhīma wa 'alā āli Ibrāhīm", translation: "O Allah, send blessings upon Muhammad and the family of Muhammad as You sent blessings upon Ibrahim and the family of Ibrahim.", order: 22 },
      { category: "QAIDA", title: "Noorani Qaida — Lesson 1: Arabic letters", notes: "Individual letters alif to yaa. Focus on correct makhraj. Practice 10 letters per session.", order: 30 },
      { category: "QAIDA", title: "Noorani Qaida — Lesson 2: Joint letters", notes: "Letters in joined forms. Focus on recognising shapes at start, middle, end.", order: 31 },
      { category: "QAIDA", title: "Noorani Qaida — Lesson 3: Harakaat (fatha, kasra, damma)", notes: "Vowel movements with letters. Insist on length: 1 harakah each.", order: 32 },
      { category: "QAIDA", title: "Noorani Qaida — Lesson 4: Maddah, Leen, Tanween", notes: "Long vowels and tanween sounds. Use listening drills.", order: 33 },
      { category: "SURAH", title: "Surah Al-Fatiha (recitation with meaning)", notes: "7 ayat. Recite in every salah — must reach Mastered.", order: 40 },
      { category: "SURAH", title: "Surah Al-Ikhlas", notes: "4 ayat. Pair with meaning discussion: tawhid.", order: 41 },
      { category: "SURAH", title: "Surah Al-Falaq & An-Nas", notes: "Pair the two last surahs; recite before sleeping.", order: 42 },
      { category: "SURAH", title: "Surah Al-Asr & Al-Fil", notes: "Short surahs with brief story context.", order: 43 },
      { category: "ADAB", title: "Islamic manners: greeting, eating, respect for elders", notes: "Salam, bismillah before eating, respect and kindness. Weave into lessons.", order: 50 },
    ];
    for (const it of items) {
      await db.contentItem.create({ data: it });
    }
  }

  // ---- Demo lessons (Ayesha: Nazra in Surah Al-Baqara area; Yusuf: Tajweed Surah Yaseen) ----
  const lessonCount = await db.lesson.count();
  if (lessonCount === 0) {
    // Global ayah ids: Surah 2 starts at global 8 (1:1-7 = ids 1..7). 2:21..25 -> 28..32
    // Surah 36 starts at global 3706 => 36:1..5 -> 3706..3710
    const l1 = await db.lesson.create({
      data: {
        studentId: s1.id,
        teacherId: t2.id,
        title: "Nazra — Surah Al-Baqarah 2:21-25",
        type: "QURAN",
        startAyah: 28, // global id for 2:21
        endAyah: 32,   // global id for 2:25
        status: "READY_FOR_REVIEW",
        instructions: "Read slowly with tajweed. Focus on the madd in آيات. Mark ready when you can read all 5 ayat without stopping.",
        feedback: "Good effort. Watch the madd in رَبِّكُمُ and the qalqalah in بَدَأَ.",
        assignedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        dueAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });
    await db.ayahCorrection.create({
      data: {
        lessonId: l1.id,
        ayah: 30, // 2:23
        note: "Stretch the madd in فَإِنَّ to 2 counts.",
      },
    });
    // passed lesson from last week (for revision queue demo)
    const l2 = await db.lesson.create({
      data: {
        studentId: s1.id,
        teacherId: t2.id,
        title: "Nazra — Surah Al-Baqarah 2:1-20 revision",
        type: "QURAN",
        startAyah: 8,
        endAyah: 27,
        status: "PASSED",
        instructions: "Revision of the first passage.",
        assignedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000),
        completedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
        reviewedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
        feedback: "Fluent now. Keep the ghunnah on مُصِيبَة clear.",
      },
    });
    // revisions for l2: 1d done, 3d done, 7d pending overdue, 14d pending
    await db.revision.createMany({
      data: [
        { lessonId: l2.id, studentId: s1.id, stage: 0, dueAt: new Date(Date.now() - 6 * 24 * 3600 * 1000), status: "DONE", doneAt: new Date(Date.now() - 6 * 24 * 3600 * 1000) },
        { lessonId: l2.id, studentId: s1.id, stage: 1, dueAt: new Date(Date.now() - 4 * 24 * 3600 * 1000), status: "DONE", doneAt: new Date(Date.now() - 4 * 24 * 3600 * 1000) },
        { lessonId: l2.id, studentId: s1.id, stage: 2, dueAt: new Date(Date.now() - 1 * 24 * 3600 * 1000), status: "PENDING" },
        { lessonId: l2.id, studentId: s1.id, stage: 3, dueAt: new Date(Date.now() + 6 * 24 * 3600 * 1000), status: "PENDING" },
      ],
    });
    await db.progressUpdate.create({
      data: {
        studentId: s1.id,
        lessonId: l2.id,
        summary: "Revised 2:1-20 with focus on ghunnah. Ayesha read fluently and passed to revision cycle. Next: continue from 2:21.",
        rating: 5,
      },
    });
    // Yusuf: tajweed lesson in Surah Yaseen 36:1-5 — global ids: surah 36 starts at 2833? (sum 1..35 = 2832, so first = 2833)
    await db.lesson.create({
      data: {
        studentId: s2.id,
        teacherId: t1.id,
        title: "Tajweed — Surah Yaseen 36:1-5",
        type: "QURAN",
        startAyah: 3706,
        endAyah: 3710,
        status: "PRACTICING",
        instructions: "Apply the rules of madd and qalqalah. Record yourself once and listen back.",
        assignedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
        dueAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
      },
    });
    // Islamic studies lesson for Ayesha (content ref)
    await db.lesson.create({
      data: {
        studentId: s1.id,
        teacherId: t2.id,
        title: "Kalimas — First Kalima",
        type: "ISLAMIC",
        contentRef: "First Kalima — Tayyabah",
        instructions: "Memorise the First Kalima with meaning. Be ready to recite it in the next class.",
        status: "PRACTICING",
        assignedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      },
    });
  }

  // ---- Demo enrollment pipeline entries ----
  const enrCount = await db.enrollment.count();
  if (enrCount === 0) {
    await db.enrollment.create({
      data: {
        studentName: "Zayd Ali",
        studentAge: 7,
        level: "BEGINNER",
        parentName: "Imran Ali",
        email: "imran@example.com",
        phone: "+44 7700 900123",
        whatsapp: "+44 7700 900123",
        timezone: "Europe/London",
        country: "UK",
        program: "QAIDA",
        preferredTeacherGender: "any",
        message: "Zayd is a complete beginner. We would like a female teacher if possible for his sister too.",
        status: "NEW",
        trialStatus: "REQUESTED",
      },
    });
    await db.enrollment.create({
      data: {
        studentName: "Maryam Ahmed",
        studentAge: 10,
        level: "NAZRA",
        parentName: "Ahmed Hassan",
        email: "ahmed@example.com",
        phone: "+1 555 010 2233",
        timezone: "America/New_York",
        country: "USA",
        program: "TAJWEED",
        preferredTeacherGender: "female",
        message: "Maryam has finished Qaida and reads Nazra. We want to improve her tajweed.",
        status: "ASSESSMENT",
        trialStatus: "SCHEDULED",
        trialAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
      },
    });
  }

  // ---- Demo invoice ----
  const invCount = await db.invoice.count();
  if (invCount === 0) {
    await db.invoice.create({
      data: {
        number: "INV-2026-001",
        amountCents: 4000,
        currency: "GBP",
        period: "Monthly — 2 children, 5 lessons/week",
        status: "PAID",
        method: "card",
        paidAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      },
    });
    await db.invoice.create({
      data: {
        number: "INV-2026-002",
        amountCents: 4000,
        currency: "GBP",
        period: "Monthly — 2 children, 5 lessons/week",
        status: "PENDING",
      },
    });
  }

  // ---- Welcome notification for parent ----
  const notifCount = await db.notification.count();
  if (notifCount === 0) {
    await db.notification.create({
      data: {
        userId: parent.id,
        title: "Welcome to Madrasah Irshad-e-Madina",
        body: "Your children Ayesha and Yusuf have been matched with their teachers. Today's learning is ready.",
        link: "/portal/parent",
      },
    });
    await db.notification.create({
      data: {
        userId: parent.id,
        title: "Lesson passed 🎉",
        body: "Ayesha passed Surah Al-Baqarah 2:1-20 and it has entered the revision cycle.",
        link: "/portal/parent",
      },
    });
  }

  console.log("Seed complete.");
  console.log("Logins: admin@irshademadina.com/admin123, qari@irshademadina.com/teacher123, hafiza@irshademadina.com/teacher123, parent@example.com/parent123, student@example.com/student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
