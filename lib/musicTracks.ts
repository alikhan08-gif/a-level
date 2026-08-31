// Hand-picked study/break background tracks — every entry below was checked by
// hand against the source channel before being added here. Only add new
// tracks the same way: verify the channel and content directly, don't wire
// up open-ended search against all of YouTube.
export type MusicTrack = {
  id: string; // YouTube video id
  title: string;
  category: "Lofi" | "Jazz" | "Pianino" | "Ambient" | "Fokus" | "O'zbek";
  live?: boolean; // 24/7 stream — no fixed duration, so hide the seek bar
};

export const MUSIC_TRACKS: MusicTrack[] = [
  // O'zbek qo'shiqlari — ro'yxat boshida
  { id: "vSA7yMrTETg", title: "Xamdam Sobirov — Peshta", category: "O'zbek" },
  { id: "JPYXpBS1dv4", title: "Xamdam Sobirov — Malohat", category: "O'zbek" },
  { id: "-QBnFEVL9Jo", title: "Xamdam Sobirov — Kapalagim", category: "O'zbek" },
  { id: "TSPGlIkTsVk", title: "Xamdam Sobirov — Esla meni", category: "O'zbek" },
  { id: "RRaZwB56djI", title: "Xamdam Sobirov — Maktabimda", category: "O'zbek" },
  { id: "dTWEFx3DeM8", title: "Mirjalol Nematov — Anor", category: "O'zbek" },
  { id: "II8th4NZJLM", title: "Mirjalol Nematov — Qaro ko'z", category: "O'zbek" },
  { id: "76mw_PI1bgw", title: "Sardor Rahimxon — Onam", category: "O'zbek" },
  { id: "OSndSyFsbCU", title: "Munisa Rizayeva — Yonar", category: "O'zbek" },
  { id: "MmIwuq_jctk", title: "Munisa Rizayeva — O'zbek", category: "O'zbek" },
  { id: "T_tyeZfxoXE", title: "Ummon — Dengiz", category: "O'zbek" },
  { id: "ocnbRyNTG3s", title: "Ummon — Jonim yur", category: "O'zbek" },
  { id: "PP2sy7bc5qo", title: "Yulduz Usmonova — Onamga aytmang", category: "O'zbek" },
  { id: "Ou9QsGVF3Ec", title: "Yulduz Usmonova — Yoningdaman", category: "O'zbek" },

  // Xorijiy — o'quv/fokus musiqasi
  { id: "rFZHOHl-L8A", title: "Lofi hip-hop — o'qishga mos sokin ritm", category: "Lofi", live: true },
  { id: "E2vONfzoyRI", title: "Jazz lofi — konsentratsiya uchun jazz ohanglari", category: "Jazz", live: true },
  { id: "JCKBaJDRMw4", title: "Ish uchun sokin musiqa — unumli bo'lish uchun", category: "Fokus" },
  { id: "fhL67fnDXcU", title: "Kod yozish uchun musiqa — synthwave ritmlari", category: "Fokus" },
  { id: "3G3vzexbf64", title: "Tinch pianino — o'qish uchun yengil kuylar", category: "Pianino" },
  { id: "LTiqKDrjqr4", title: "Chuqur uyqu musiqasi — tinch ambient ohanglar", category: "Ambient", live: true },
  { id: "2oJqY4nhL-c", title: "15 daqiqalik dam — kuch to'plash uchun uyqu", category: "Ambient" },
  { id: "XVFUtEh9zrY", title: "Yozgi lofi — dam olish uchun sokin ritm", category: "Lofi" },
  { id: "yUXwdnOJ_z0", title: "Yulduzlar ostida uyqu — 8 soatlik tinch ambient", category: "Ambient" },
];
