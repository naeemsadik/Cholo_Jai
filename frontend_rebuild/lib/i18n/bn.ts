// Bangla dictionary — voice mirrors the brand book:
//
//   Relaxed · Conversational · Exciting · Approachable · Helpful
//
// "Ghurighuri is the friend who always knows what's on" — that friend in Dhaka
// speaks colloquial Bangla. We avoid formal newspaper register ("অনুষ্ঠিত হবে")
// and prefer the way a young Dhaka resident would actually text a friend.
//
// Conventions:
//   - Sentence case, no "।" after titles. Body copy uses "।" (U+0964) for
//     full stops and "," without the trailing space English would use.
//   - Numbers stay Western in code-heavy contexts (₿/৳ amounts, dates in
//     URL params) but the date formatter renders Bengali numerals for human
//     reading.
//   - Loanwords are kept where Dhaka readers expect them ("ক্যাফে", "পপ-আপ",
//     "ইনস্টাগ্রাম") rather than transliterated.
//   - The word "ghurighuri" is left as-is in BN — it's a brand coinage, not
//     a Bangla noun. We don't try to "translate" it.

import type { Dictionary } from "./types";

export const bn: Dictionary = {
  // ── Common / shared UI ─────────────────────────────────────────────
  common: {
    appName: "ঘুরিঘুরি",
    tagline: "ঢাকায় ঘুরে বেড়ানোর পরের ঠিকানা",
    learnMore: "আরও জানুন",
    readMore: "বিস্তারিত",
    seeAll: "সব দেখুন",
    back: "ফিরে যান",
    next: "পরেরটি",
    close: "বন্ধ",
    open: "খুলুন",
    save: "সেভ করুন",
    saved: "সেভ হয়েছে",
    saving: "সেভ হচ্ছে…",
    cancel: "বাতিল",
    delete: "মুছে ফেলুন",
    edit: "সম্পাদনা",
    publish: "প্রকাশ করুন",
    unpublish: "অপ্রকাশিত করুন",
    archive: "আর্কাইভ",
    restore: "ফিরিয়ে আনুন",
    preview: "প্রিভিউ",
    loading: "লোড হচ্ছে…",
    retry: "আবার চেষ্টা করুন",
    search: "খুঁজুন",
    submit: "জমা দিন",
    optional: "ঐচ্ছিক",
    required: "আবশ্যক",
    free: "ফ্রি",
    paid: "টিকেট",
    todayLabel: "আজ",
    tomorrowLabel: "কাল",
    thisWeekend: "এই সপ্তাহান্তে",
    daysSingular: "{n} দিন",
    daysPlural: "{n} দিন",
    hoursSingular: "{n} ঘণ্টা",
    hoursPlural: "{n} ঘণ্টা",
    relativeNow: "এইমাত্র",
    relativeMinuteAgo: "{n} মিনিট আগে",
    relativeMinutesAgo: "{n} মিনিট আগে",
    relativeHourAgo: "{n} ঘণ্টা আগে",
    relativeHoursAgo: "{n} ঘণ্টা আগে",
    relativeDayAgo: "{n} দিন আগে",
    relativeDaysAgo: "{n} দিন আগে",
    relativeWeekAgo: "{n} সপ্তাহ আগে",
    relativeWeeksAgo: "{n} সপ্তাহ আগে",
    countItems: "{n}টি",
    empty: "এখানে এখনো কিছু নেই",
    comingSoon: "শিঘ্রই আসছে",
  },

  // ── Navigation ─────────────────────────────────────────────────────
  nav: {
    allEvents: "সব ইভেন্ট",
    thisWeekend: "এই সপ্তাহান্তে",
    featured: "এডিটরস পছন্দ",
    about: "আমাদের কথা",
    submitAnEvent: "ইভেন্ট জমা দিন",
    admin: "অ্যাডমিন",
    openMenu: "মেনু খুলুন",
    searchEvents: "ইভেন্ট খুঁজুন",
    findSomethingToDo: "কিছু করার খোঁজে?",
    searchPlaceholder: "লিখুন ‘ওয়ার্কশপ ধানমন্ডি’…",
    searchDescription: "টাইটেল, ভেন্যু বা এলাকা দিয়ে খুঁজুন।",
    orTryOneOfThese: "অথবা এগুলো দেখুন",
    quickFreeEntry: "ফ্রি ইভেন্ট",
    quickThisWeekend: "এই সপ্তাহান্তে",
    quickFeatured: "এডিটরস পছন্দ",
    quickToday: "আজকের ইভেন্ট",
  },

  // ── Home / hero ────────────────────────────────────────────────────
  home: {
    thisWeekBadge: "এই সপ্তাহে",
    cityHandPicked: "ঢাকা · বাছাই করা",
    thingsWorthStepping: "ঘুরে আসার মতো {n}টি জায়গা",
    heroH1: "চলো না কোথাও ঘুরে আসি, ",
    heroH1Italic: "কোথাও",
    heroH1Tail: "?",
    heroSubA:
      "ঘুরিঘুরি হলো সেই বন্ধু — যে সবসময় জানে শহরে কী হচ্ছে। কনসার্ট, ক্যাফে, ওয়ার্কশপ, উইকেন্ড মার্কেট — যেগুলো সত্যিই দেখার মতো, সেগুলোই বাছাই করে রাখি।",
    heroSubB:
      "কোনো অ্যালগরিদম নেই। ইভেন্টব্রাইটের ভিড় নেই। শুধু একটা ছোট্ট লিস্ট — যেগুলোতে আমরা নিজেরাও যেতাম। আয়োজকরা পাঠান, আমরা মানুষ দিয়ে যাচাই করি।",
    seeWhatsOn: "আজকে কী আছে দেখুন",
    gotAnEvent: "কিছু করছেন? জানান →",
    inTheMoodFor: "কী মুডে আছেন?",
    seeEverything: "সব দেখুন →",
    tonightTomorrow: "আজ রাত · আগামীকাল",
    wannaGoSomewhere: "কোথাও যাবেন?",
    moreEditorsPicks: "আরও পছন্দ",
    marqueeItems: [
      "খুঁজে দেখো। ঘুরে দেখো। উপভোগ করো।",
      "ঢাকায় ঘুরে বেড়ানোর পরের ঠিকানা",
      "শুক্রবার থেকে রবিবার — আপনার জন্য বাছাই",
      "ঢাকায় তৈরি, ভালোবাসায় তৈরি",
    ],
    wouldGoEyebrow: "আমরা যেতাম",
    wouldGoH2: "এই সপ্তাহে একটা ফাঁকা সন্ধ্যা পেলে।",
    readFullListing: "পুরোটা পড়ুন",
    curatorsPick: "এডিটরস পছন্দ",
    freeEntryBadge: "ফ্রি ইভেন্ট",
    featuredDefault: "বিশেষ",
    whenLabel: "কখন",
    whereLabel: "কোথায়",
    costLabel: "খরচ",
    eventsCount: "{n}টি ইভেন্ট",
  },

  // ── Events list / detail / filter ──────────────────────────────────
  events: {
    pageTitle: "সব ইভেন্ট",
    pageDescription:
      "ঢাকার সব বাছাই করা ইভেন্ট এক জায়গায়। এলাকা, ক্যাটাগরি, উইকেন্ড বা ফ্রি — যেভাবে খুশি ফিল্টার করুন।",
    noMatchesTitle: "এই ফিল্টারে কোনো ইভেন্ট নেই।",
    noMatchesBody: "একটা-দুটো ফিল্টার সরিয়ে আবার দেখুন।",
    noEventsYet: "এই সেকশনে এখনো কিছু নেই।",
    noEventsInArea: "এই এলাকায় এখনো কোনো ইভেন্ট নেই।",
    clearFilters: "সব ফিল্টার মুছুন",
    showOnlyThisWeekend: "এই সপ্তাহান্তে",
    showOnlyFeatured: "এডিটরস পছন্দ",
    showOnlyFree: "ফ্রি",
    sortBy: "সাজান",
    sortSoonest: "সবার আগে যেটা",
    sortNewest: "নতুন আগে",
    sortAZ: "ক থেকে খ",
    gridView: "গ্রিড",
    listView: "তালিকা",
    resultsCount: "{n}টি ইভেন্ট",
    resultsCountOne: "১টি ইভেন্ট",
    loadMore: "আরও দেখুন",
    subscribeToWeekend: "উইকেন্ডের বাছাই ইমেইলে পান",
    subscribeBody:
      "প্রতি শুক্রবার একটা ছোট্ট ইমেইল — ঢাকায় আমরা নিজেরাও যেগুলোতে যেতাম, সেই পাঁচটা জায়গা।",
    subscribePlaceholder: "you@email.com",
    subscribeSuccess: "হয়ে গেছে। শুক্রবার আসছে।",
    subscribeCta: "সাবস্ক্রাইব",
    venue: "ভেন্যু",
    area: "এলাকা",
    mapsLink: "ম্যাপে দেখুন",
    category: "ক্যাটাগরি",
    categories: "ক্যাটাগরি",
    audienceTags: "যাদের জন্য",
    price: "খরচ",
    date: "তারিখ",
    time: "সময়",
    startTime: "শুরু",
    endTime: "শেষ",
    organizer: "আয়োজক",
    contactOrganizer: "আয়োজকের সাথে যোগাযোগ",
    share: "শেয়ার",
    shareCopyLink: "লিংক কপি করুন",
    linkCopied: "লিংক কপি হয়েছে",
    shareOnFacebook: "ফেসবুকে শেয়ার",
    shareOnWhatsapp: "হোয়াটসঅ্যাপে শেয়ার",
    shareByEmail: "ইমেইলে শেয়ার",
    relatedEvents: "এগুলোও দেখতে পারেন",
    addToCalendar: "ক্যালেন্ডারে যোগ করুন",
    eventRemoved: "ইভেন্টটি আর নেই",
    when: "কখন",
    where: "কোথায়",
    cost: "খরচ",
  },

  // ── Submit form (public) ───────────────────────────────────────────
  submit: {
    pageTitle: "ইভেন্ট জমা দিন",
    pageDescription:
      "ঘুরে আসার মতো কিছু আয়োজন করছেন? জানান। প্রতিটা জমা পড়ে পড়ি, মানানসই হলে ৪৮ ঘণ্টার মধ্যে প্রকাশ করি।",
    sectionBasics: "মূল তথ্য",
    sectionWhen: "কখন, কোথায়",
    sectionPeople: "কে আয়োজন করছেন",
    sectionLinks: "লিংক ও নোট",
    titleEn: "ইভেন্টের নাম (ইংরেজি)",
    titleBn: "ইভেন্টের নাম (বাংলা) — ঐচ্ছিক",
    descriptionEn: "বিবরণ (ইংরেজি)",
    descriptionBn: "বিবরণ (বাংলা) — ঐচ্ছিক",
    descriptionHint:
      "কী নিয়ে ইভেন্ট? কাদের জন্য? কিছু আনতে হবে বা জানতে হবে?",
    startDate: "শুরুর তারিখ",
    startTime: "শুরুর সময়",
    endDate: "শেষের তারিখ",
    endTime: "শেষের সময়",
    city: "শহর",
    subArea: "এলাকা",
    subAreaPlaceholder: "এলাকা বাছাই করুন",
    venueName: "ভেন্যুর নাম",
    areaDetails: "ভেন্যু কীভাবে খুঁজে পাবেন",
    mapsLink: "গুগল ম্যাপ লিংক — ঐচ্ছিক",
    organizerName: "আয়োজকের নাম",
    organizerPhone: "ফোন নম্বর",
    organizerEmail: "ইমেইল — ঐচ্ছিক",
    organizerSocial: "ইনস্টাগ্রাম / ওয়েবসাইট — ঐচ্ছিক",
    outboundLink: "রেজিস্ট্রেশন / টিকিট / অফিসিয়াল পেজ লিংক",
    outboundLinkHint:
      "যেখানে মানুষকে পাঠাব — পোস্টার না, যেখানে তারা আসলে সাইন আপ করবে সেই লিংক।",
    expectedAttendance: "আনুমানিক দর্শক — ঐচ্ছিক",
    priceType: "খরচ",
    priceFree: "ফ্রি",
    pricePaid: "টিকেট",
    priceNote: "খরচের বিবরণ (যেমন ৳৫০০ প্রতি জন)",
    categories: "ক্যাটাগরি",
    audienceTags: "দর্শকের ধরন",
    audienceTagsHint: "কাদের জন্য? যেটা মানায় সেটা বাছাই করুন।",
    additionalNotes: "আর কিছু জানাতে চাইলে?",
    wantsPromotionSupport: "ফিচার্ড প্লেসমেন্ট চাই",
    wantsPromotionSupportHint:
      "জায়গা ফাঁকা হলে যোগাযোগ করব — গ্যারান্টি নেই।",
    submitCta: "রিভিউতে পাঠান",
    submittedTitle: "হয়ে গেছে। যোগাযোগ করব।",
    submittedBody:
      "প্রতিটা জমা পড়ি। মানানসই হলে ৪৮ ঘণ্টার মধ্যে প্রকাশ করি। না হলে সৎভাবে জানিয়ে দিই।",
    submittedAnother: "আরেকটা জমা দিন",
    errorTitle: "পাঠানো যায়নি",
    errorBody: "চিহ্নিত ঘরগুলো ঠিক করে আবার চেষ্টা করুন।",
    previewPoster: "পোস্টার প্রিভিউ",
    posterUploadHint:
      "৪:৫ পোর্ট্রেট ছবি ব্যবহার করুন, ১০৮০×১৩৫০ বা তার বেশি। আমরা সঠিক অনুপাতে ক্রপ করে দেব।",
    copyEnToBn: "ইংরেজি থেকে কপি করুন",
    bnFallbackHint:
      "বাংলা ভার্সন না থাকলে ঘরটা ফাঁকা রাখুন। প্রকাশের আগে আমাদের এডিটররা পূরণ করে দেবে।",
  },

  // ── About page ─────────────────────────────────────────────────────
  about: {
    pageTitle: "আমাদের কথা",
    pageDescription:
      "ঘুরিঘুরি হলো সেই বন্ধু — যে সবসময় জানে শহরে কী হচ্ছে। আমরা কীভাবে বাছাই করি, কী রাখি, কী রাখি না — সব এখানে।",
    eyebrow: "আমাদের কথা",
    h1: "হ্যাঁ — আমরাই ঘুরিঘুরি।",
    intro:
      "আমরা সেই বন্ধু — যে সবসময় জানে শহরে কী হচ্ছে। প্রতি সপ্তাহে ঢাকার ঘুরে আসার মতো পাঁচটা জায়গা — কোনো পেওয়াল নেই, কোনো প্রচার নেই।",
    missionEyebrow: "কিউরেশনের থিসিস",
    missionH2: "সব না — শুধু ভালোগুলো।",
    missionP1:
      "ঢাকায় এত ইভেন্ট হয় যে কেউ সবগুলোতে যেতে পারে না। আমরা সব লিস্ট করতে চাই না — শুধু যেগুলো সত্যিই দেখার মতো, সেগুলো তুলে আনতে চাই। ছোট ওয়ার্কশপ, বড় কর্পোরেট কনফারেন্স না। এলাকার আয়োজন, ভিড়ের উৎসব না। যেখানে শ্রমের মূল্য দেওয়া হয়, আর যেখানে দর্শকের সময়ের সম্মান দেওয়া হয়।",
    missionP2:
      "সাইটের প্রতিটা ইভেন্ট একজন মানুষ যাচাই করেন। ভেন্যু ঠিকানা, আয়োজকের পরিচয় — সব দেখা হয়। কিছু সন্দেহজনক মনে হলে লিস্টিং থেকে সরিয়ে দিই। সবার জন্য সবকিছু হতে চাই না — শুধু এই সপ্তাহে কী চলছে, তার একটা সৎ গাইড হতে চাই।",
    missionP3:
      "প্রথম ৩০ দিন একটা টেস্ট। মানুষ কি আসছে, ক্লিক কি হচ্ছে — সেটা দিয়ে না, আমরা বুঝতে চাই এটা চালিয়ে যাওয়া উচিত, পরিবর্তন করা উচিত, নাকি থামানো উচিত।",
    whatWeListEyebrow: "আমরা কী রাখি",
    whatWeListH2: "যেগুলোতে আমরা নিজেরাও যেতাম।",
    seeEvents: "ইভেন্ট দেখুন →",
    audienceEyebrow: "কাদের জন্য",
    audienceH2: "প্ল্যান খুঁজতে স্ক্রল করতে যাদের আর ভালো লাগে না।",
    audienceBody:
      "অডিয়েন্স ট্যাগ হলো ফিল্টার, সাজেশন না। পরিবার-বান্ধব, একা, ফ্রি, ইনডোর, নিরিবিলি — যেটা মানায় সেটা বেছে নিন।",
    faqEyebrow: "সাধারণ প্রশ্ন",
    faqH2: "যেগুলো বেশি শুনি।",
    organizerEyebrow: "আয়োজকদের জন্য",
    organizerH2: "কিছু করছেন? জানান।",
    organizerBody:
      "প্রতিটা জমা পড়ি। মানানসই হলে ৪৮ ঘণ্টার মধ্যে প্রকাশ করি। না হলে সৎভাবে জানিয়ে দিই — ‘পরে জানাব’ বলে ঝুলিয়ে রাখি না। ফিচার্ড প্লেসমেন্ট শুধু যাদের সাথে সরাসরি কাজ করি তাদের জন্য।",
    submitYourEvent: "আপনার ইভেন্ট জমা দিন →",
    faq: [
      {
        question: "ঘুরিঘুরি কী?",
        answer:
          "ঘুরিঘুরি হলো ঢাকার ইভেন্ট, জায়গা আর অভিজ্ঞতার একটা বাছাই করা সাপ্তাহিক গাইড। প্রতি সপ্তাহে আমরা পাঁচটা জিনিস বাছাই করি — কনসার্ট, ক্যাফে, ওয়ার্কশপ, উইকেন্ড মার্কেট, নিরিবিলি কোণাকুণি। শহরের সব ইভেন্ট আমরা লিস্ট করি না — শুধু যেগুলোতে আমরা নিজেরাও যেতাম, সেগুলোই রাখি।",
      },
      {
        question: "ইভেন্ট কীভাবে বাছাই করেন?",
        answer:
          "প্রতিটা ইভেন্ট একজন এডিটর দেখেন। ভেন্যু, আয়োজকের পরিচয় — সব যাচাই করা হয়। কিছু সন্দেহজনক মনে হলে লিস্টিং থেকে সরিয়ে দিই। আমরা ছোট ওয়ার্কশপকে বড় কর্পোরেট কনফারেন্সের চেয়ে বেশি গুরুত্ব দিই, এলাকার আয়োজনকে ভিড়ের উৎসবের চেয়ে বেশি, যেখানে শ্রমের মূল্য দেওয়া হয় সেখানে, আর যেখানে দর্শকের সময়ের সম্মান দেওয়া হয় সেখানে।",
      },
      {
        question: "ব্রাউজ করতে কি অ্যাকাউন্ট লাগে?",
        answer:
          "না। ঘুরিঘুরিতে ইভেন্ট দেখা, ফিল্টার করা, পড়া — সব ফ্রি, কোনো লগইন লাগে না। শুধু শুক্রবারের ডিসপ্যাচ নিউজলেটারটা চাইলে ইমেইল দেবেন।",
      },
      {
        question: "টিকিট কীভাবে পাব?",
        answer:
          "ঘুরিঘুরি টিকিট বিক্রি করে না। ইভেন্ট পছন্দ হলে আউটবাউন্ড বাটনে চাপ দিলেই আপনাকে সরাসরি আয়োজকের অফিসিয়াল পেজে পাঠিয়ে দিই — সেখানে রেজিস্ট্রেশন, টিকিট বা যোগাযোগের তথ্য থাকে।",
      },
      {
        question: "ইভেন্ট কীভাবে জমা দেব?",
        answer:
          "‘ইভেন্ট জমা দিন’ পেজে যান। প্রতিটা জমা পড়ি, মানানসই হলে ৪৮ ঘণ্টার মধ্যে প্রকাশ করি। না হলে সৎভাবে জানিয়ে দিই — ‘পরে জানাব’ বলে ঝুলিয়ে রাখি না।",
      },
    ],
  },

  // ── Footer ─────────────────────────────────────────────────────────
  footer: {
    madeIn: "ঢাকায় তৈরি, ভালোবাসায় তৈরি",
    copyright: "© {year} ঘুরিঘুরি। সর্বস্বত্ব সংরক্ষিত।",
    browseEvents: "ইভেন্ট দেখুন",
    submitEvent: "ইভেন্ট জমা দিন",
    about: "আমাদের কথা",
    contact: "যোগাযোগ",
    instagram: "ইনস্টাগ্রাম",
    privacy: "প্রাইভেসি",
    terms: "শর্তাবলী",
  },

  // ── Errors / system messages ───────────────────────────────────────
  errors: {
    somethingWentWrong: "কিছু একটা হয়েছে। আবার চেষ্টা করুন।",
    networkDown: "সার্ভারে পৌঁছানো যাচ্ছে না। নমুনা ইভেন্ট দেখাচ্ছে।",
    notFoundTitle: "এই পেজটা খুঁজে পাচ্ছি না।",
    notFoundBody:
      "লিংকটা পুরনো হতে পারে, অথবা ইভেন্টটা অপ্রকাশিত হয়ে থাকতে পারে। হোমপেজে ফিরে যান।",
    backHome: "হোমপেজে ফিরে যান",
    eventNotFound: "এই ইভেন্টটা আর সাইটে নেই।",
    invalidEmail: "ইমেইলটা সঠিক মনে হচ্ছে না।",
    fieldRequired: "এই ঘরটা পূরণ করতে হবে।",
    fillRequiredFields: "চিহ্নিত ঘরগুলো পূরণ করুন।",
    selectAtLeastOneCategory: "অন্তত একটা ক্যাটাগরি বাছাই করুন।",
    submitError: "পাঠানো যায়নি। আবার চেষ্টা করুন।",
    saveError: "সেভ করা যায়নি। আবার চেষ্টা করুন।",
    loadError: "লোড করা যায়নি। আবার চেষ্টা করুন।",
  },

  // ── Days / months (used by date formatters) ────────────────────────
  calendar: {
    days: [
      "রবিবার",
      "সোমবার",
      "মঙ্গলবার",
      "বুধবার",
      "বৃহস্পতিবার",
      "শুক্রবার",
      "শনিবার",
    ],
    daysShort: ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"],
    months: [
      "জানুয়ারি",
      "ফেব্রুয়ারি",
      "মার্চ",
      "এপ্রিল",
      "মে",
      "জুন",
      "জুলাই",
      "আগস্ট",
      "সেপ্টেম্বর",
      "অক্টোবর",
      "নভেম্বর",
      "ডিসেম্বর",
    ],
    monthsShort: [
      "জানু",
      "ফেব্রু",
      "মার্চ",
      "এপ্রি",
      "মে",
      "জুন",
      "জুলা",
      "আগ",
      "সেপ্ট",
      "অক্টো",
      "নভে",
      "ডিসে",
    ],
  },

  // ── Admin (also used by the admin panel) ───────────────────────────
  admin: {
    dashboard: "ড্যাশবোর্ড",
    events: "ইভেন্ট",
    submissions: "জমা",
    analytics: "অ্যানালিটিক্স",
    home: "হোম",
    cms: "কন্টেন্ট",
    settings: "সেটিংস",
    signedInAs: "অ্যাডমিন হিসেবে সাইন ইন",
    signOut: "সাইন আউট",
    viewPublicSite: "পাবলিক সাইট দেখুন",
    expandSidebar: "সাইডবার বড় করুন",
    collapseSidebar: "সাইডবার ছোট করুন",
    openNavigation: "নেভিগেশন খুলুন",
    loginTitle: "অ্যাডমিন সাইন-ইন",
    loginEmail: "ইমেইল",
    loginPassword: "পাসওয়ার্ড",
    loginSubmit: "সাইন ইন",
    loginHint: "শুধুমাত্র অ্যাডমিন — টিমের ইমেইল দিয়ে সাইন ইন করুন।",
    loginError: "সাইন ইন করা যায়নি। ইমেইল ও পাসওয়ার্ড যাচাই করুন।",
  },
};
