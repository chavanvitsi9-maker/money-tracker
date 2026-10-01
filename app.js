// ==========================================================================
// MoneyTracker - เน้นการจดบันทึกรายรับ-รายจ่ายที่ง่ายและรวดเร็ว (Ledger & Fast Entry)
// ==========================================================================

const STORAGE_KEY_TRANSACTIONS = 'moneytracker_transactions_v1';
const STORAGE_KEY_CATEGORIES = 'moneytracker_categories_v1';
const STORAGE_KEY_PRESETS = 'moneytracker_presets_v2';
const STORAGE_KEY_SOUND = 'moneytracker_sound_v1';
const STORAGE_KEY_USER_KEYWORDS = 'moneytracker_user_keywords_v1';
const STORAGE_KEY_GSHEET = 'moneytracker_gsheet_v1';

// หมวดหมู่เริ่มต้น (Default Categories)
const DEFAULT_CATEGORIES = {
  income: [
    { id: 'salary', name: 'เงินเดือน', icon: 'fa-money-bill-wave', color: '#10B981' },
    { id: 'freelance', name: 'รายได้เสริม / ฟรีแลนซ์', icon: 'fa-laptop-code', color: '#06B6D4' },
    { id: 'business', name: 'ธุรกิจ / ค้าขาย', icon: 'fa-store', color: '#3B82F6' },
    { id: 'investment', name: 'การลงทุน / ดอกเบี้ย', icon: 'fa-chart-line', color: '#8B5CF6' },
    { id: 'savings_withdrawal', name: 'ถอนเงินออม / ดึงเงินเก็บ', icon: 'fa-hand-holding-dollar', color: '#0284C7' },
    { id: 'bonus', name: 'โบนัส / ของขวัญ', icon: 'fa-gift', color: '#EC4899' },
    { id: 'other_income', name: 'รายรับอื่นๆ', icon: 'fa-coins', color: '#64748B' }
  ],
  expense: [
    { id: 'food', name: 'อาหารและเครื่องดื่ม', icon: 'fa-utensils', color: '#F97316' },
    { id: 'transport', name: 'เดินทาง / ค่าน้ำมัน', icon: 'fa-car', color: '#0284C7' },
    { id: 'shopping', name: 'ช้อปปิ้ง / ของใช้', icon: 'fa-bag-shopping', color: '#EC4899' },
    { id: 'housing', name: 'ค่าที่พัก / ค่าน้ำ-ไฟ-เน็ต', icon: 'fa-house-chimney', color: '#EF4444' },
    { id: 'savings', name: 'เงินออม / ลงทุน', icon: 'fa-piggy-bank', color: '#0D9488' },
    { id: 'entertainment', name: 'บันเทิง / กิจกรรม', icon: 'fa-gamepad', color: '#A855F7' },
    { id: 'health', name: 'สุขภาพ / ยารักษาโรค', icon: 'fa-heart-pulse', color: '#14B8A6' },
    { id: 'education', name: 'การศึกษา / พัฒนาตนเอง', icon: 'fa-graduation-cap', color: '#6366F1' },
    { id: 'family', name: 'ครอบครัว / ให้พ่อแม่', icon: 'fa-users', color: '#F59E0B' },
    { id: 'other_expense', name: 'รายจ่ายอื่นๆ', icon: 'fa-tags', color: '#64748B' }
  ]
};

// รายการโปรดบันทึกด่วน 1 คลิก (1-Click Favorite Presets)
const DEFAULT_PRESETS = [
  { id: 'p1', name: 'กาแฟ', amount: 45, type: 'expense', category: 'food', icon: '☕', payment: 'cash' },
  { id: 'p2', name: 'ข้าวแกง', amount: 50, type: 'expense', category: 'food', icon: '🍛', payment: 'promptpay' },
  { id: 'p3', name: 'รถไฟฟ้า', amount: 35, type: 'expense', category: 'transport', icon: '🚆', payment: 'promptpay' },
  { id: 'p4', name: 'เติมน้ำมัน', amount: 500, type: 'expense', category: 'transport', icon: '⛽', payment: 'credit_card' },
  { id: 'p5', name: '7-Eleven', amount: 120, type: 'expense', category: 'shopping', icon: '🏪', payment: 'wallet' },
  { id: 'p6', name: 'โอนเงินออม', amount: 3000, type: 'expense', category: 'savings', icon: '🐷', payment: 'bank' },
  { id: 'p7', name: 'ถอนเงินออม', amount: 1000, type: 'income', category: 'savings_withdrawal', icon: '💸', payment: 'bank' }
];

// พจนานุกรมคำเพื่อเดาหมวดหมู่อัตโนมัติ (Smart Natural Language Category Detection)
const KEYWORD_CATEGORY_MAP = {
  // Expense
  savings: [
    'โอนเข้าบัญชีเงินออม', 'บัญชีเงินออม', 'โอนเงินออม', 'โอนไปเก็บ', 'โอนเก็บ', 'เงินออม', 'ออมเงิน', 'เก็บเงิน',
    'ฝากประจำ', 'เงินฝากประจำ', 'เงินฝาก', 'ฝากเงิน', 'กองทุนรวม', 'ซื้อกองทุน', 'ssf', 'rmf', 'กองทุน',
    'ออมทอง', 'ซื้อทอง', 'พอร์ตหุ้น', 'เก็บออม', 'เงินสำรองฉุกเฉิน', 'เงินสำรอง', 'ออม'
  ],
  transport: [
    'ค่ารถตู้', 'รถตู้', 'ค่ารถเมล์', 'รถเมล์', 'ค่าสองแถว', 'รถสองแถว', 'สองแถว', 'รถกระป๊อ', 'กระป๊อ',
    'ค่ารถทัวร์', 'รถทัวร์', 'ค่ารถบัส', 'รถบัส', 'มินิบัส', 'ค่ารถไฟฟ้า', 'รถไฟฟ้า', 'bts', 'mrt', 'arl', 'srt',
    'airport link', 'แอร์พอร์ตลิงก์', 'ค่ารถไฟ', 'รถไฟ', 'ตั๋วรถไฟ', 'หัวลำโพง', 'ค่าแท็กซี่', 'แท็กซี่', 'แทกซี่',
    'taxi', 'grab', 'แกร็บ', 'bolt', 'โบล์ท', 'lineman', 'indrive', 'ค่าวิน', 'วินมอไซค์', 'วินมอเตอร์ไซค์', 'วิน',
    'มอเตอร์ไซค์รับจ้าง', 'ค่าทางด่วน', 'ทางด่วน', 'โทลล์เวย์', 'toll', 'mflow', 'm-flow', 'easypass', 'easy pass',
    'mpass', 'm-pass', 'ค่าผ่านทาง', 'ค่าน้ำมัน', 'เติมน้ำมัน', 'น้ำมัน', 'ปั๊ม', 'ปั้ม', 'ปตท', 'ptt', 'บางจาก',
    'shell', 'caltex', 'esso', 'แก๊ส', 'lpg', 'ngv', 'ชาร์จรถ', 'ev car', 'ค่าเรือ', 'เรือด่วน', 'เรือข้ามฟาก',
    'เรือคลองแสนแสบ', 'เรือ', 'ตั๋วเครื่องบิน', 'ค่าตั๋วเครื่องบิน', 'เครื่องบิน', 'สายการบิน', 'แอร์เอเชีย', 'นกแอร์',
    'สนามบิน', 'ค่าล้างรถ', 'ล้างรถ', 'คาร์แคร์', 'car care', 'ค่าจอดรถ', 'ค่าจอด', 'จอดรถ', 'ซ่อมรถ', 'เช็กระยะ',
    'เปลี่ยนน้ำมันเครื่อง', 'น้ำมันเครื่อง', 'เปลี่ยนยาง', 'ยางรถ', 'ปะยาง', 'พ.ร.บ.', 'พรบ', 'ประกันรถ', 'ทะเบียนรถ',
    'ค่ารถ', 'ค่าเดินทาง', 'ค่าโดยสาร', 'การเดินทาง', 'ตั๋วโดยสาร', 'รถ'
  ],
  food: [
    'ข้าวกะเพรา', 'กะเพรา', 'หมูกรอบ', 'ไข่ดาว', 'ไข่เจียว', 'ข้าวผัด', 'ข้าวมันไก่', 'ข้าวหมูแดง', 'ข้าวหมูกรอบ',
    'ข้าวขาหมู', 'เป็ดย่าง', 'ข้าวหน้าเป็ด', 'อาหารตามสั่ง', 'แกงเขียวหวาน', 'ต้มยำ', 'ต้มข่า', 'ผัดผัก', 'ต้มเลือดหมู',
    'โจ๊ก', 'ข้าวต้ม', 'ข้าวแกง', 'แกงส้ม', 'ผัดซีอิ๊ว', 'ผัดไท', 'ราดหน้า', 'สุกี้', 'สเต็ก', 'steak',
    'ก๋วยเตี๋ยว', 'บะหมี่เกี๊ยว', 'บะหมี่', 'เกี๊ยว', 'ก๋วยจั๊บ', 'เส้นใหญ่', 'เส้นเล็ก', 'เส้นหมี่', 'วุ้นเส้น',
    'เย็นตาโฟ', 'ราเมง', 'ramen', 'อูด้ง', 'มาม่า', 'ส้มตำ', 'ลาบ', 'น้ำตก', 'คอหมูย่าง', 'ไก่ย่าง', 'ข้าวเหนียว',
    'หมูกระทะ', 'หมูกะทะ', 'ปิ้งย่าง', 'ชาบู', 'shabu', 'บุฟเฟ่ต์', 'buffet', 'หมูจุ่ม', 'แจ่วฮ้อน', 'haidilao',
    'mk', 'kfc', 'mcdonald', 'แมคโดนัลด์', 'burger', 'เบอร์เกอร์', 'pizza', 'พิซซ่า', 'โดนัท', 'ไก่ทอด',
    'ซูชิ', 'sushi', 'sashimi', 'ซาชิมิ', 'กาแฟ', 'coffee', 'cafe', 'คาเฟ่', 'อเมซอน', 'amazon', 'starbucks',
    'สตาร์บัคส์', 'เต่าบิน', 'all cafe', 'ชาเขียว', 'ชานมไข่มุก', 'ชานม', 'ชาไทย', 'มัทฉะ', 'โกโก้', 'ช็อกโกแลต',
    'น้ำเปล่า', 'น้ำดื่ม', 'น้ำแร่', 'น้ำผลไม้', 'น้ำปั่น', 'สมูทตี้', 'น้ำอัดลม', 'โค้ก', 'เป๊ปซี่', 'เบียร์',
    'เหล้า', 'ไวน์', 'ไอติม', 'ไอศกรีม', 'ice cream', 'เบเกอรี่', 'เค้ก', 'cake', 'โรตี', 'วาฟเฟิล', 'บิงซู',
    'ขนมปัง', 'ครัวซองต์', 'ผลไม้', 'ลูกชิ้น', 'ไส้กรอก', 'เฟรนช์ฟรายส์', 'ของกินเล่น', 'กินเล่น', 'กับแกล้ม',
    'เซเว่น', '7-11', '7-eleven', 'seven', 'jiffy', 'lawson', 'ค่ากิน', 'ค่าอาหาร', 'ค่าข้าว', 'ค่ากาแฟ',
    'ค่าขนม', 'ขนม', 'ของหวาน', 'กับข้าว', 'อาหาร', 'กินข้าว', 'ทานข้าว', 'มื้อเช้า', 'มื้อเที่ยง', 'มื้อเย็น',
    'มื้อดึก', 'กิน', 'มื้อ', 'ข้าว', 'ชา'
  ],
  shopping: [
    'shopee', 'lazada', 'tiktok shop', 'tiktok', 'สั่งของ', 'ซื้อของ', 'ช้อปปิ้ง', 'ช้อป', 'shopping', 'shop',
    'เซ็นทรัล', 'central', 'โลตัส', 'lotus', 'big c', 'บิ๊กซี', 'watson', 'วัตสัน', 'boots', 'บู๊ทส์',
    'แม็คโคร', 'makro', 'tops', 'ท็อปส์', 'ห้าง', 'เสื้อผ้า', 'เสื้อยืด', 'เสื้อเชิ้ต', 'เสื้อ', 'กางเกงยีนส์',
    'กางเกง', 'กระโปรง', 'ชุดเดรส', 'ชุด', 'รองเท้าผ้าใบ', 'รองเท้าแตะ', 'รองเท้า', 'ถุงเท้า', 'กระเป๋าสะพาย',
    'กระเป๋าสตางค์', 'กระเป๋า', 'เป้', 'หมวก', 'เข็มขัด', 'แว่นตากันแดด', 'แว่นตา', 'ต่างหู', 'สร้อยคอ',
    'สร้อย', 'นาฬิกา', 'uniqlo', 'ยูนิโคล่', 'h&m', 'zara', 'เครื่องสำอาง', 'ลิปสติก', 'ลิป', 'แป้งพัฟ',
    'รองพื้น', 'สกินแคร์', 'skincare', 'เซรั่ม', 'ครีมกันแดด', 'ครีม', 'โฟมล้างหน้า', 'น้ำหอม', 'ทำเล็บ',
    'ต่อขนตา', 'ของใช้ส่วนตัว', 'ของใช้ในบ้าน', 'ของใช้', 'สบู่', 'ยาสระผม', 'แชมพู', 'ยาสีฟัน', 'แปรงสีฟัน',
    'ผ้าเช็ดตัว', 'มีดโกน', 'ผ้าอนามัย', 'กระดาษทิชชู่', 'ทิชชู่', 'เคสมือถือ', 'สายชาร์จ', 'พาวเวอร์แบงก์',
    'หูฟัง', 'เครื่องเขียน', 'ปากกา', 'สมุด'
  ],
  housing: [
    'ค่าเช่าห้อง', 'ค่าเช่าบ้าน', 'ค่าเช่าคอนโด', 'ค่าเช่า', 'ค่าหอพัก', 'ค่าหอ', 'หอพัก', 'ค่าห้อง', 'ผ่อนคอนโด',
    'ผ่อนบ้าน', 'ค่าคอนโด', 'ค่าบ้าน', 'ค่าส่วนกลาง', 'ส่วนกลาง', 'นิติบุคคล', 'นิติ', 'ค่าไฟฟ้า', 'ค่าไฟ',
    'ค่าน้ำประปา', 'ค่าน้ำ', 'ค่าน้ำไฟ', 'ค่าอินเทอร์เน็ต', 'เน็ตบ้าน', 'ค่าเน็ต', 'wifi', 'ais fibre',
    'true online', '3bb', 'ค่าโทรศัพท์', 'ค่ามือถือ', 'รายเดือน', 'เติมเงินมือถือ', 'ซิม', 'ซ่อมแซมบ้าน',
    'ซ่อมบ้าน', 'ซ่อมห้อง', 'เฟอร์นิเจอร์', 'ikea', 'อิเกีย', 'โฮมโปร', 'homepro', 'ไทวัสดุ', 'หลอดไฟ',
    'ปลั๊กไฟ', 'ผงซักฟอก', 'น้ำยาปรับผ้านุ่ม', 'น้ำยาถูพื้น', 'น้ำยาล้างจาน', 'ถุงขยะ', 'ล้างแอร์', 'ซ่อมแอร์',
    'ซักผ้าหยอดเหรียญ', 'ซักผ้า', 'คอนโด'
  ],
  entertainment: [
    'netflix', 'เน็ตฟลิกซ์', 'เน็ตฟลิก', 'spotify', 'สปอติฟาย', 'youtube premium', 'youtube', 'ยูทูป',
    'disney+', 'disney', 'hbo go', 'hbo', 'viu', 'เติมเกม', 'steam', 'สตีม', 'playstation', 'ps5',
    'nintendo', 'rov', 'genshin', 'valorant', 'เกม', 'game', 'ไปเที่ยว', 'ท่องเที่ยว', 'เที่ยว', 'ทริป',
    'trip', 'โรงแรม', 'รีสอร์ท', 'agoda', 'booking', 'airbnb', 'ที่พัก', 'คาราโอเกะ', 'คอนเสิร์ต',
    'concert', 'ตั๋วคอนเสิร์ต', 'ตั๋วหนัง', 'โรงหนัง', 'major cineplex', 'major', 'sf cinema', 'sf',
    'หนัง', 'ปาร์ตี้', 'บาร์', 'bar', 'pub', 'ผับ', 'ร้านนวด', 'นวดแผนไทย', 'นวดตัว', 'นวดเท้า',
    'นวด', 'สปา', 'spa'
  ],
  health: [
    'ค่ายา', 'ยาพารา', 'พารา', 'ยาแก้แพ้', 'ยาแก้หวัด', 'ยาแก้ไอ', 'ยาแก้อักเสบ', 'วิตามิน', 'อาหารเสริม',
    'ร้านขายยา', 'ยา', 'หาหมอ', 'ค่าหมอ', 'หมอ', 'คลินิกทันตกรรม', 'คลินิก', 'clinic', 'โรงพยาบาล',
    'รพ.', 'รพ', 'ตรวจสุขภาพ', 'ตรวจเลือด', 'ฉีดวัคซีน', 'วัคซีน', 'ทำฟัน', 'จัดฟัน', 'ดัดฟัน',
    'ขูดหินปูน', 'อุดฟัน', 'ถอนฟัน', 'ผ่าฟันคุด', 'รีเทนเนอร์', 'ฟัน', 'ตัดแว่นสายตา', 'ตัดแว่น',
    'แว่นสายตา', 'แว่นตา', 'คอนแทคเลนส์', 'ฟิตเนส', 'fitness', 'ยิม', 'gym', 'โยคะ', 'กายภาพบำบัด',
    'ยาดม', 'ยาหม่อง', 'พลาสเตอร์', 'เบตาดีน', 'ศัลยกรรม'
  ],
  education: [
    'ค่าหนังสือ', 'หนังสือเรียน', 'หนังสือ', 'คอร์สเรียน', 'คอร์ส', 'course', 'ค่าเรียนพิเศษ', 'ค่าเรียน',
    'เรียนพิเศษ', 'เรียน', 'อบรมสัมมนา', 'อบรม', 'สัมมนา', 'workshop', 'ค่าติว', 'ติว', 'ค่าสอบ',
    'สอบ', 'toefl', 'ielts', 'toeic', 'สอบก.พ.', 'ค่าเทอม', 'อุปกรณ์การเรียน', 'udemy', 'skilllane',
    'ebook'
  ],
  family: [
    'ให้เงินแม่', 'ให้เงินพ่อ', 'เงินเดือนแม่', 'เงินเดือนพ่อ', 'ให้แม่', 'ให้พ่อ', 'ของใช้พ่อแม่', 'ครอบครัว',
    'ค่าขนมลูก', 'ของเล่นลูก', 'ผ้าอ้อมเด็ก', 'ผ้าอ้อม', 'แพมเพิส', 'นมผง', 'ลูก', 'อาหารแมว', 'อาหารหมา',
    'ทรายแมว', 'ขนมแมวเลีย', 'วัคซีนแมว', 'วัคซีนสุนัข', 'หมอสัตว์', 'คลินิกสัตว์', 'สัตวแพทย์', 'อาบน้ำตัดขน',
    'สัตว์เลี้ยง', 'แมว', 'หมา', 'สุนัข', 'พ่อ', 'แม่'
  ],
  other_expense: [
    'ทำบุญตักบาตร', 'ทำบุญ', 'บริจาคเงิน', 'บริจาค', 'ซองผ้าป่า', 'ซองงานแต่ง', 'งานแต่งงาน', 'งานแต่ง',
    'งานบวช', 'งานศพ', 'ช่วยงาน', 'ภาษีสังคม', 'ภาษีเงินได้', 'ภาษี', 'ค่าธรรมเนียมโอน', 'ค่าธรรมเนียม',
    'ค่าปรับจราจร', 'ค่าปรับ', 'ดอกเบี้ยบัตร', 'เงินหาย', 'ทำหาย', 'จิปาถะ'
  ],

  // Income
  salary: [
    'เงินเดือนประจำ', 'เงินเดือนออก', 'เงินเดือนเข้า', 'เงินเดือน', 'salary', 'ค่าจ้างรายเดือน', 'เงินเข้า'
  ],
  freelance: [
    'ฟรีแลนซ์', 'freelance', 'งานนอก', 'รับจ้างทั่วไป', 'รับจ้าง', 'ค่าจ้างทำงาน', 'ค่าจ้าง', 'คอมมิชชั่น',
    'commission', 'งานเสริม', 'โอที', 'ot', 'ค่าล่วงเวลา', 'พาร์ทไทม์', 'part-time', 'ขายของได้',
    'ลูกค้าโอนเงิน', 'ลูกค้าโอน', 'ค่าแบบ', 'เขียนโค้ด', 'รายได้พิเศษ', 'ยอดขาย'
  ],
  business: [
    'ยอดขายหน้าร้าน', 'ยอดขายร้าน', 'ยอดขาย', 'เปิดร้าน', 'ค้าขาย', 'ธุรกิจส่วนตัว', 'ธุรกิจ', 'ออเดอร์',
    'order', 'กำไรขายของ', 'กำไรสุทธิ', 'กำไร'
  ],
  investment: [
    'เงินปันผลหุ้น', 'เงินปันผล', 'ปันผล', 'ดอกเบี้ยเงินฝาก', 'ดอกเบี้ย', 'กำไรหุ้น', 'ขายหุ้น', 'หุ้น',
    'คริปโต', 'crypto', 'กองทุนรวม', 'กองทุน', 'กำไรเทรด', 'เทรด', 'bitcoin', 'btc', 'eth', 'forex'
  ],
  savings_withdrawal: [
    'ถอนเงินออมมาใช้', 'ดึงเงินออมมาใช้', 'เอาเงินออมมาใช้', 'ดึงเงินเก็บมาใช้', 'เอาเงินเก็บมาใช้',
    'ถอนเงินออม', 'ดึงเงินออม', 'เอาเงินออม', 'โอนเงินออมกลับ', 'โอนเงินเก็บกลับ', 'ถอนเงินเก็บ',
    'ดึงเงินเก็บ', 'เอาเงินเก็บ', 'ถอนออม', 'ยืมเงินออม', 'ถอนเงินฝาก', 'ถอนกองทุน', 'ขายกองทุน'
  ],
  bonus: [
    'เงินโบนัส', 'โบนัส', 'bonus', 'ของขวัญ', 'แต๊ะเอีย', 'อั่งเปา', 'ถูกลอตเตอรี่', 'ลอตเตอรี่', 'ถูกหวย',
    'หวย', 'สลากกินแบ่ง', 'สลากออมสิน', 'เงินรางวัล', 'รางวัล', 'เงินคืนแคชแบ็ก', 'เงินคืน', 'cashback',
    'แม่ให้เงิน', 'พ่อให้เงิน', 'แม่ให้', 'พ่อให้', 'ญาติให้', 'เงินรับไหว้', 'ได้คืน'
  ]
};

// คำตรวจจับว่าเป็นรายรับ (Income Detection Keywords)
const INCOME_KEYWORDS = [
  'เงินเดือน', 'salary', 'รายได้', 'รับเงิน', 'ได้เงิน', 'เงินเข้า', 'ฟรีแลนซ์', 'freelance',
  'ขายได้', 'ขายของได้', 'ปันผล', 'ดอกเบี้ย', 'โบนัส', 'แต๊ะเอีย', 'อั่งเปา', 'ค่าจ้าง', 'ลูกค้าโอน',
  'แม่ให้', 'พ่อให้', 'ได้คืน', 'เงินคืน', 'ถูกรางวัล', 'ถูกหวย', 'ลอตเตอรี่', 'กำไร', 'ยอดขาย',
  'ถอนเงินออม', 'ดึงเงินออม', 'ถอนเงินเก็บ', 'ดึงเงินเก็บ', 'เอาเงินเก็บ', 'เอาเงินออม', 'โอนเงินออมกลับ', 'ถอนออม'
];

// คำตรวจจับช่องทางการชำระเงิน (Payment Method Keywords)
const PAYMENT_KEYWORDS = {
  credit_card: ['บัตรเครดิต', 'บัตรเดบิต', 'บัตร', 'credit', 'visa', 'mastercard'],
  promptpay: ['พร้อมเพย์', 'promptpay', 'สแกน', 'scan', 'qr', 'qr code'],
  bank: ['โอนเงิน', 'โอน', 'แบงก์', 'แบงค์', 'mobile banking', 'kbank', 'scb', 'bbl', 'ktb', 'ttb', 'ธนาคาร'],
  wallet: ['วอลเล็ท', 'ทรูมันนี่', 'wallet', 'truemoney', 'true wallet', 'rabbit', 'line pay', 'shopeepay', 'เป๋าตัง'],
  cash: ['เงินสด', 'cash']
};

// ช่องทางการชำระเงิน
const PAYMENT_METHODS = {
  cash: { name: 'เงินสด', icon: 'fa-money-bill-1' },
  bank: { name: 'โอนเงิน / แบงก์กิ้ง', icon: 'fa-building-columns' },
  promptpay: { name: 'พร้อมเพย์', icon: 'fa-qrcode' },
  credit_card: { name: 'บัตรเครดิต/เดบิต', icon: 'fa-credit-card' },
  wallet: { name: 'E-Wallet', icon: 'fa-wallet' }
};

// Application State
const state = {
  transactions: [],
  categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
  presets: JSON.parse(JSON.stringify(DEFAULT_PRESETS)),
  userKeywords: {}, // เรียนรู้และจำคำศัพท์ของผู้ใช้ (Self-learning custom dictionary)
  soundEnabled: true,
  ledgerVisibleDays: 15,
  currentTab: 'ledger', // 'ledger' | 'summary'
  summaryMonth: '', // 'YYYY-MM'
  summarySortBy: 'amount', // 'amount' | 'count'
  expandedCategories: new Set(),
  entryForm: {
    type: 'expense',
    selectedCategoryId: 'food',
    selectedPayment: 'promptpay',
    editingId: null
  },
  filter: {
    period: 'this_month', // all, today, this_week, this_month, this_year, custom
    customStartDate: '',
    customEndDate: '',
    type: 'all', // all, income, expense
    search: ''
  },
  showAnalytics: false,
  googleSheet: {
    url: '',
    autoSync: true,
    sheetTitle: '',
    lastSync: null
  }
};


// Audio Synthesizer (Web Audio API - 0 latency, 0 external files)
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSuccessChime() {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Note 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Note 2: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.08);
    gain2.gain.setValueAtTime(0.09, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.28);
  } catch (e) {
    // Ignore audio errors
  }
}

function playClickSound() {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    // Ignore audio errors
  }
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  localStorage.setItem(STORAGE_KEY_SOUND, state.soundEnabled ? '1' : '0');
  updateSoundButtonUI();
  if (state.soundEnabled) {
    playSuccessChime();
    showToast('เปิดเสียงตอบสนองแล้ว 🔔', 'info');
  } else {
    showToast('ปิดเสียงตอบสนองแล้ว 🔕', 'info');
  }
}

function updateSoundButtonUI() {
  const icon = document.getElementById('soundToggleIcon');
  const btn = document.getElementById('soundToggleBtn');
  if (icon && btn) {
    if (state.soundEnabled) {
      icon.className = 'fa-solid fa-volume-high text-xs text-indigo-600';
      btn.classList.add('sound-btn-active');
      btn.title = 'ปิดเสียงเอฟเฟกต์ (กด M)';
    } else {
      icon.className = 'fa-solid fa-volume-xmark text-xs text-slate-400';
      btn.classList.remove('sound-btn-active');
      btn.title = 'เปิดเสียงเอฟเฟกต์ (กด M)';
    }
  }
}

// Math Expression Evaluator
function evaluateMathExpression(expr) {
  if (!expr || typeof expr !== 'string') return null;
  const clean = expr.trim();
  if (/^-?\d+(\.\d+)?$/.test(clean)) {
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  }
  // Only allow digits, operators, dots, parentheses, whitespace
  if (!/^[0-9+\-*/().\s]+$/.test(clean)) return null;

  try {
    const result = new Function(`'use strict'; return (${clean});`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.round(result * 100) / 100;
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Utility: Debounce
function debounce(fn, delay = 180) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Chart Instances
let categoryChartInstance = null;
let trendChartInstance = null;

// ==========================================================================
// Initialization & Storage
// ==========================================================================

function initApp() {
  loadFromStorage();
  
  // Set default dates
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const customStartEl = document.getElementById('customStartDate');
  const customEndEl = document.getElementById('customEndDate');
  if (customStartEl) customStartEl.value = formatDateToISO(firstDay);
  if (customEndEl) customEndEl.value = formatDateToISO(lastDay);

  // Set default summary month (current month)
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  state.summaryMonth = currentYearMonth;
  const summaryMonthPicker = document.getElementById('summaryMonthPicker');
  if (summaryMonthPicker) summaryMonthPicker.value = currentYearMonth;

  // Set default form date/time
  setDefaultFormDateTime();

  // Setup Event Listeners & Shortcuts
  setupEventListeners();
  setupKeyboardShortcuts();

  // Render UI Components
  renderQuickPresets();
  renderCategoryChips();
  updateSoundButtonUI();

  // Initial render
  render();
  updateSmartLivePreview();
  updateGoogleSheetUIStatus();

  // Auto focus on smart input for immediate typing!
  const smartInput = document.getElementById('smartInput');
  if (smartInput) smartInput.focus();
}

function loadFromStorage() {
  try {
    const rawTx = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (rawTx) {
      const list = JSON.parse(rawTx);
      // Clean out any sample data (tx_s1 to tx_s5)
      state.transactions = Array.isArray(list) ? list.filter(t => !String(t.id).startsWith('tx_s')) : [];
      if (Array.isArray(list) && list.length !== state.transactions.length) {
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(state.transactions));
      }
    } else {
      state.transactions = [];
    }

    const rawCat = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (rawCat) {
      state.categories = JSON.parse(rawCat);
      if (!Array.isArray(state.categories.expense)) {
        state.categories.expense = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES.expense));
      }
      if (!Array.isArray(state.categories.income)) {
        state.categories.income = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES.income));
      }

      // Auto-migrate: ถ้ายังไม่มีหมวด savings ใน expense ให้เพิ่มเข้าไป
      if (!state.categories.expense.some(c => c.id === 'savings')) {
        state.categories.expense.splice(4, 0, {
          id: 'savings',
          name: 'เงินออม / ลงทุน',
          icon: 'fa-piggy-bank',
          color: '#0D9488'
        });
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(state.categories));
      }
      // Auto-migrate: ถ้ายังไม่มีหมวด savings_withdrawal ใน income ให้เพิ่มเข้าไป
      if (!state.categories.income.some(c => c.id === 'savings_withdrawal')) {
        state.categories.income.splice(4, 0, {
          id: 'savings_withdrawal',
          name: 'ถอนเงินออม / ดึงเงินเก็บ',
          icon: 'fa-hand-holding-dollar',
          color: '#0284C7'
        });
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(state.categories));
      }
    }

    const rawPresets = localStorage.getItem(STORAGE_KEY_PRESETS);
    if (rawPresets) {
      state.presets = JSON.parse(rawPresets);
      if (!state.presets.some(p => p.id === 'p6' || p.category === 'savings')) {
        state.presets.push({
          id: 'p6',
          name: 'โอนเงินออม',
          amount: 3000,
          type: 'expense',
          category: 'savings',
          icon: '🐷',
          payment: 'bank'
        });
        localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(state.presets));
      }
      if (!state.presets.some(p => p.id === 'p7' || p.category === 'savings_withdrawal')) {
        state.presets.push({
          id: 'p7',
          name: 'ถอนเงินออม',
          amount: 1000,
          type: 'income',
          category: 'savings_withdrawal',
          icon: '💸',
          payment: 'bank'
        });
        localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(state.presets));
      }
    }

    const rawSound = localStorage.getItem(STORAGE_KEY_SOUND);
    if (rawSound !== null) {
      state.soundEnabled = rawSound === '1';
    }

    const rawUserKw = localStorage.getItem(STORAGE_KEY_USER_KEYWORDS);
    if (rawUserKw) {
      state.userKeywords = JSON.parse(rawUserKw);
    }

    const rawGsheet = localStorage.getItem(STORAGE_KEY_GSHEET);
    if (rawGsheet) {
      try {
        const parsed = JSON.parse(rawGsheet);
        state.googleSheet = {
          url: parsed.url || '',
          autoSync: parsed.autoSync !== false,
          sheetTitle: parsed.sheetTitle || '',
          lastSync: parsed.lastSync || null
        };
      } catch (e) {}
    }
  } catch (err) {
    console.error('Error loading localStorage:', err);
    state.transactions = [];
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(state.transactions));
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(state.categories));
    localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(state.presets));
    localStorage.setItem(STORAGE_KEY_SOUND, state.soundEnabled ? '1' : '0');
    localStorage.setItem(STORAGE_KEY_USER_KEYWORDS, JSON.stringify(state.userKeywords || {}));
    localStorage.setItem(STORAGE_KEY_GSHEET, JSON.stringify(state.googleSheet));
  } catch (err) {
    console.error('Error saving localStorage:', err);
    showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
  }
}

function setDefaultFormDateTime() {
  const now = new Date();
  const txDateInput = document.getElementById('txDate');
  const txTimeInput = document.getElementById('txTime');
  
  if (txDateInput && !txDateInput.value) txDateInput.value = formatDateToISO(now);
  if (txTimeInput && !txTimeInput.value) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    txTimeInput.value = `${hours}:${minutes}`;
  }
}

// ==========================================================================
// Fast Entry Form, Presets & Category Chips
// ==========================================================================

function renderQuickPresets() {
  const container = document.getElementById('quickPresetsContainer');
  if (!container) return;

  if (!state.presets || state.presets.length === 0) {
    container.innerHTML = '<span class="text-xs text-slate-400 py-1">ยังไม่มีรายการด่วน กดปุ่ม "+ ปรับแต่ง" เพื่อเพิ่มได้</span>';
    return;
  }

  container.innerHTML = state.presets.map(p => `
    <button type="button" onclick="recordPreset('${p.id}')" class="preset-pill" title="คลิกเพื่อบันทึก ${p.name} ทันทีใน 1 วินาที">
      <span>${p.icon || '⚡'}</span>
      <span>${escapeHtml(p.name)}</span>
      <span class="text-indigo-600 font-bold">฿${formatNumber(p.amount)}</span>
    </button>
  `).join('');
}

function recordPreset(presetId) {
  const preset = state.presets.find(p => p.id === presetId);
  if (!preset) return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;
  const date = formatDateToISO(now);

  const newTx = {
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type: preset.type || 'expense',
    amount: preset.amount,
    category: preset.category || 'food',
    paymentMethod: preset.payment || 'promptpay',
    date,
    time,
    note: preset.name,
    createdAt: Date.now()
  };

  state.transactions.unshift(newTx);
  playSuccessChime();
  saveToStorage();
  render();
  showToast(`⚡ จดด่วน "${preset.name}" ฿${formatNumber(preset.amount)} สำเร็จ! (1-Click)`, 'success');
  syncSingleTransactionToSheet(newTx);
}

function renderCategoryChips() {
  const container = document.getElementById('categoryChipsContainer');
  if (!container) return;

  const currentType = state.entryForm.type;
  const categories = state.categories[currentType] || [];

  // If current selected category is not in this type, pick the first one
  if (!categories.some(c => c.id === state.entryForm.selectedCategoryId)) {
    state.entryForm.selectedCategoryId = categories[0]?.id || '';
  }

  container.innerHTML = categories.map((cat, index) => {
    const isSelected = cat.id === state.entryForm.selectedCategoryId;
    const activeClass = isSelected
      ? 'active border-indigo-600 bg-indigo-50/80 text-indigo-900 ring-2 ring-indigo-500/30'
      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
    const shortcutBadge = index < 9 ? `<span class="shortcut-badge ml-auto font-mono text-[9px]">Alt+${index + 1}</span>` : '';

    return `
      <button type="button" onclick="selectCategory('${cat.id}')"
        class="cat-chip flex items-center gap-2 px-3 py-2 rounded-xl text-xs border ${activeClass} transition-all">
        <span class="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] shrink-0" style="background-color: ${cat.color}">
          <i class="fa-solid ${cat.icon}"></i>
        </span>
        <span class="font-medium truncate">${cat.name}</span>
        ${shortcutBadge}
      </button>
    `;
  }).join('') + `
    <button type="button" onclick="openNewCategoryModal()"
      class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors">
      <i class="fa-solid fa-plus text-xs"></i>
      <span>เพิ่มหมวดหมู่</span>
    </button>
  `;
}

// ==========================================================================
// Smart Natural Language Expense Parser (Thai & English)
// ==========================================================================

function parseNaturalExpenseText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      note: '',
      amount: 0,
      type: state.entryForm.type || 'expense',
      categoryId: state.entryForm.selectedCategoryId || 'food',
      paymentMethod: state.entryForm.selectedPayment || 'promptpay',
      hasAmount: false
    };
  }

  let text = rawText.trim();
  if (!text) {
    return {
      note: '',
      amount: 0,
      type: state.entryForm.type || 'expense',
      categoryId: state.entryForm.selectedCategoryId || 'food',
      paymentMethod: state.entryForm.selectedPayment || 'promptpay',
      hasAmount: false
    };
  }

  // 1. Detect Payment Method
  let detectedPayment = state.entryForm.selectedPayment || 'promptpay';
  let paymentKeywordMatched = false;
  const isProtectedTransferAction = /โอนเข้าบัญชี|โอนเงินออม|โอนไปเก็บ|โอนเก็บ|โอนเงินออมกลับ|ค่าธรรมเนียมโอน|ลูกค้าโอน/i.test(text);

  for (const [pmKey, keywords] of Object.entries(PAYMENT_KEYWORDS)) {
    for (const kw of keywords) {
      const reg = new RegExp(`\\b${kw}\\b|${kw}`, 'gi');
      if (reg.test(text)) {
        detectedPayment = pmKey;
        if (!(isProtectedTransferAction && (kw === 'โอน' || kw === 'โอนเงิน'))) {
          text = text.replace(reg, ' ');
        }
        paymentKeywordMatched = true;
        break;
      }
    }
    if (paymentKeywordMatched) break;
  }

  // 2. Protect Store Names containing numbers/dashes (e.g. 7-11, 7-eleven)
  const storePlaceholders = [];
  text = text.replace(/7-11|7-eleven|seven-eleven|เซเว่น-อีเลฟเว่น/gi, (match) => {
    storePlaceholders.push(match);
    return `__STORE_PH_${storePlaceholders.length - 1}__`;
  });

  // 3. Detect Income vs Expense
  let detectedType = null;
  const lowerText = text.toLowerCase();
  for (const kw of INCOME_KEYWORDS) {
    if (lowerText.includes(kw.toLowerCase())) {
      detectedType = 'income';
      break;
    }
  }
  if (!detectedType) {
    detectedType = state.entryForm.type === 'income' ? 'income' : 'expense';
  }

  // 4. Extract Amount & Math Expression
  let detectedAmount = 0;
  let hasAmount = false;
  const candidateRegex = /([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?(?:\s*[+\-*/]\s*[0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)*)\s*(?:บาท|บ\.|.-|บ)?/g;
  
  let matches = [];
  let m;
  while ((m = candidateRegex.exec(text)) !== null) {
    const rawVal = m[1].trim();
    if (rawVal && /[0-9]/.test(rawVal)) {
      matches.push({
        rawVal,
        fullMatch: m[0],
        index: m.index,
        length: m[0].length
      });
    }
  }

  if (matches.length > 0) {
    // If multiple numbers (e.g. "ซื้อเสื้อ 2 ตัว 500"), pick the last number as price
    const bestMatch = matches[matches.length - 1];
    const cleanExpr = bestMatch.rawVal.replace(/,/g, '');
    const calculated = evaluateMathExpression(cleanExpr);
    if (calculated !== null && calculated > 0) {
      detectedAmount = calculated;
      hasAmount = true;
      text = text.substring(0, bestMatch.index) + ' ' + text.substring(bestMatch.index + bestMatch.length);
    }
  }

  // 5. Restore protected store names
  text = text.replace(/__STORE_PH_(\d+)__/g, (_, idx) => storePlaceholders[parseInt(idx, 10)] || '7-Eleven');

  // Clean remaining note text
  let cleanedNote = text
    .replace(/(?:บาท|บ\.|.-)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 6. Detect Category from note and rawText
  let detectedCategory = null;
  const searchCorpus = `${cleanedNote} ${rawText}`.toLowerCase();

  // 6.1 ตรวจสอบคำศัพท์ที่ผู้ใช้เคยสอน/เคยเลือกไว้ก่อนหน้า (User Custom Memory - ลำดับความสำคัญสูงสุด)
  if (state.userKeywords && typeof state.userKeywords === 'object') {
    let bestUserMatchLen = 0;
    for (const [kw, catId] of Object.entries(state.userKeywords)) {
      const lowerKw = kw.toLowerCase();
      if (searchCorpus.includes(lowerKw) && lowerKw.length > bestUserMatchLen) {
        bestUserMatchLen = lowerKw.length;
        detectedCategory = catId;
      }
    }
  }

  // 6.2 ตรวจสอบพจนานุกรมคำศัพท์ระบบด้วยอัลกอริทึม Longest-Match Specificity (คำยาวและเฉพาะเจาะจงชนะเสมอ)
  if (!detectedCategory) {
    let bestMatchLen = 0;
    let bestMatchCat = null;

    for (const [catId, keywords] of Object.entries(KEYWORD_CATEGORY_MAP)) {
      for (const kw of keywords) {
        const lowerKw = kw.toLowerCase();
        if (searchCorpus.includes(lowerKw)) {
          // ถ้าความยาวคำนี้มากกว่าคำที่เคยแมตช์ ให้เลือกหมวดหมู่นี้แทน เพราะมีความเฉพาะเจาะจงสูงกว่า
          if (lowerKw.length > bestMatchLen) {
            bestMatchLen = lowerKw.length;
            bestMatchCat = catId;
          }
        }
      }
    }
    if (bestMatchCat) {
      detectedCategory = bestMatchCat;
    }
  }

  // Verify category belongs to income or expense
  if (detectedCategory) {
    const isIncomeCat = (DEFAULT_CATEGORIES.income || []).some(c => c.id === detectedCategory);
    const isExpenseCat = (DEFAULT_CATEGORIES.expense || []).some(c => c.id === detectedCategory);

    if (isIncomeCat && !isExpenseCat) {
      detectedType = 'income';
    } else if (isExpenseCat && !isIncomeCat) {
      detectedType = 'expense';
    }
  } else {
    detectedCategory = detectedType === 'income' ? 'salary' : 'food';
  }

  // If note is empty but amount exists, use category name
  if (!cleanedNote && hasAmount) {
    const catObj = getCategoryObj(detectedType, detectedCategory);
    cleanedNote = catObj ? catObj.name : (detectedType === 'income' ? 'รายรับทั่วไป' : 'รายจ่ายทั่วไป');
  }

  return {
    note: cleanedNote,
    amount: detectedAmount,
    type: detectedType,
    categoryId: detectedCategory,
    paymentMethod: detectedPayment,
    hasAmount: hasAmount
  };
}

// Live Preview Update based on Natural Input
function updateSmartLivePreview(preserveManualSelection = false) {
  const smartInput = document.getElementById('smartInput');
  const clearBtn = document.getElementById('clearSmartInputBtn');
  const rawText = smartInput ? smartInput.value : '';

  // Toggle clear button
  if (clearBtn) {
    if (rawText.trim().length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  }

  // Parse text
  const parsed = parseNaturalExpenseText(rawText);

  // If user has not manually overridden or we are not strictly preserving manual override
  if (!preserveManualSelection) {
    if (parsed.type && parsed.type !== state.entryForm.type) {
      state.entryForm.type = parsed.type;
      updateTypeButtonsUI();
      renderCategoryChips();
    }
    if (parsed.categoryId && parsed.categoryId !== state.entryForm.selectedCategoryId) {
      state.entryForm.selectedCategoryId = parsed.categoryId;
      renderCategoryChips();
    }
    if (parsed.paymentMethod && parsed.paymentMethod !== state.entryForm.selectedPayment) {
      state.entryForm.selectedPayment = parsed.paymentMethod;
      const txPayment = document.getElementById('txPayment');
      if (txPayment) txPayment.value = parsed.paymentMethod;
    }
  }

  const currentType = state.entryForm.type;
  const currentCatId = state.entryForm.selectedCategoryId;
  const currentCat = getCategoryObj(currentType, currentCatId);
  const currentPaymentKey = state.entryForm.selectedPayment || 'promptpay';
  const paymentObj = PAYMENT_METHODS[currentPaymentKey] || { name: 'พร้อมเพย์', icon: 'fa-qrcode' };

  // DOM preview elements
  const typeBadgeEl = document.getElementById('previewTypeBadge');
  const catIconEl = document.getElementById('previewCatIcon');
  const catNameEl = document.getElementById('previewCatName');
  const noteEl = document.getElementById('previewNote');
  const amountEl = document.getElementById('previewAmount');
  const paymentEl = document.getElementById('previewPayment');

  if (typeBadgeEl) {
    if (currentType === 'income') {
      typeBadgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 animate-fade-in';
      typeBadgeEl.innerHTML = 'รายรับ 🟢';
    } else {
      typeBadgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 animate-fade-in';
      typeBadgeEl.innerHTML = 'รายจ่าย 🔴';
    }
  }

  if (catIconEl) {
    catIconEl.style.backgroundColor = currentCat.color || '#F97316';
    catIconEl.innerHTML = `<i class="fa-solid ${currentCat.icon || 'fa-tag'}"></i>`;
  }

  if (catNameEl) {
    catNameEl.innerText = `หมวดหมู่: ${currentCat.name || 'ทั่วไป'}`;
  }

  if (noteEl) {
    if (parsed.note) {
      noteEl.innerText = parsed.note;
      noteEl.classList.remove('text-slate-400');
      noteEl.classList.add('text-slate-800');
    } else {
      noteEl.innerText = rawText.trim() ? (currentCat.name || 'ยังไม่ได้ระบุชื่อ') : 'ยังไม่ได้พิมพ์รายการ';
      noteEl.classList.add('text-slate-400');
      noteEl.classList.remove('text-slate-800');
    }
  }

  if (amountEl) {
    if (parsed.hasAmount && parsed.amount > 0) {
      amountEl.innerText = `฿${formatNumber(parsed.amount)}`;
      amountEl.className = currentType === 'income'
        ? 'text-base font-black text-emerald-600'
        : 'text-base font-black text-rose-600';
    } else {
      amountEl.innerText = '฿0.00';
      amountEl.className = 'text-base font-bold text-slate-300';
    }
  }

  if (paymentEl) {
    paymentEl.innerHTML = `<i class="fa-solid ${paymentObj.icon} text-[9px] mr-1"></i>${paymentObj.name}`;
  }

  // Update compatibility hidden inputs
  const hiddenAmt = document.getElementById('txAmount');
  if (hiddenAmt) hiddenAmt.value = parsed.hasAmount ? parsed.amount : '';
  const hiddenNote = document.getElementById('txNote');
  if (hiddenNote) hiddenNote.value = parsed.note;

  // Toggle live preview visibility (Clean & Minimal: hide when empty)
  const previewCard = document.getElementById('smartPreviewCard');
  if (previewCard) {
    if (!rawText.trim()) {
      previewCard.classList.add('hidden');
    } else {
      previewCard.classList.remove('hidden');
    }
  }
}

function updateTypeButtonsUI() {
  const btnExpense = document.getElementById('btnTypeExpense');
  const btnIncome = document.getElementById('btnTypeIncome');
  if (!btnExpense || !btnIncome) return;

  if (state.entryForm.type === 'expense') {
    btnExpense.className = 'flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-rose-600 text-white shadow-md shadow-rose-200';
    btnIncome.className = 'flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 text-slate-600 hover:bg-slate-200/60';
  } else {
    btnIncome.className = 'flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-emerald-600 text-white shadow-md shadow-emerald-200';
    btnExpense.className = 'flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 text-slate-600 hover:bg-slate-200/60';
  }
}

function learnUserKeyword(keyword, categoryId) {
  if (!keyword || !categoryId) return;
  const clean = keyword.trim().toLowerCase();
  // อย่าเรียนรู้ถ้าเป็นตัวเลขล้วน หรือสั้น/ยาวเกินไป
  if (clean.length >= 2 && clean.length <= 40 && !/^\d+$/.test(clean)) {
    if (!state.userKeywords) state.userKeywords = {};
    state.userKeywords[clean] = categoryId;
    saveToStorage();
  }
}

function selectCategory(categoryId) {
  state.entryForm.selectedCategoryId = categoryId;

  // Auto-learn: ถ้าขณะนี้มีข้อความพิมพ์อยู่ แล้วผู้ใช้คลิกเลือกหมวดนี้ ให้จดจำคำนี้ไว้ใช้ครั้งหน้า
  const smartInput = document.getElementById('smartInput');
  const rawText = smartInput ? smartInput.value.trim() : '';
  if (rawText) {
    const parsed = parseNaturalExpenseText(rawText);
    if (parsed.note && parsed.note.length >= 2) {
      learnUserKeyword(parsed.note, categoryId);
    }
  }

  renderCategoryChips();
  updateSmartLivePreview(true);
}

function setEntryType(type) {
  state.entryForm.type = type;
  const smartInput = document.getElementById('smartInput');
  const rawText = smartInput ? smartInput.value.trim() : '';
  if (rawText) {
    const parsed = parseNaturalExpenseText(rawText);
    if (parsed.type === type && parsed.categoryId) {
      state.entryForm.selectedCategoryId = parsed.categoryId;
    }
  }
  updateTypeButtonsUI();
  renderCategoryChips();
  updateSmartLivePreview(false);
  document.getElementById('smartInput')?.focus();
}

function addQuickAmount(val) {
  const smartInput = document.getElementById('smartInput');
  if (!smartInput) return;

  const currentText = smartInput.value.trim();
  if (!currentText) {
    smartInput.value = String(val);
  } else {
    const parsed = parseNaturalExpenseText(currentText);
    if (parsed.hasAmount && parsed.amount > 0) {
      const newAmt = parsed.amount + val;
      smartInput.value = parsed.note ? `${parsed.note} ${newAmt}` : String(newAmt);
    } else {
      smartInput.value = `${currentText} ${val}`;
    }
  }

  playClickSound();
  updateSmartLivePreview();
  smartInput.focus();
}

function clearSmartInput() {
  const smartInput = document.getElementById('smartInput');
  if (smartInput) {
    smartInput.value = '';
    smartInput.focus();
  }
  updateSmartLivePreview();
  playClickSound();
}

// ==========================================================================
// Event Listeners Setup
// ==========================================================================

function setupEventListeners() {
  // Form submission
  const form = document.getElementById('fastEntryForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Smart Natural Language Input Listeners
  const smartInput = document.getElementById('smartInput');
  if (smartInput) {
    smartInput.addEventListener('input', () => updateSmartLivePreview());
    smartInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleFormSubmit(e);
      }
    });
  }

  // Clear Smart Input button
  document.getElementById('clearSmartInputBtn')?.addEventListener('click', clearSmartInput);

  // Payment Method Dropdown change
  document.getElementById('txPayment')?.addEventListener('change', (e) => {
    state.entryForm.selectedPayment = e.target.value;
    updateSmartLivePreview(true);
  });

  // Type Toggle Buttons
  document.getElementById('btnTypeExpense')?.addEventListener('click', () => setEntryType('expense'));
  document.getElementById('btnTypeIncome')?.addEventListener('click', () => setEntryType('income'));

  // Cancel edit button
  document.getElementById('cancelEditBtn')?.addEventListener('click', cancelEditing);

  // Period Filter Buttons
  const periodButtons = document.querySelectorAll('.period-btn');
  periodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      periodButtons.forEach(b => b.classList.remove('active', 'bg-indigo-600', 'text-white'));
      periodButtons.forEach(b => b.classList.add('bg-white', 'text-slate-600'));
      btn.classList.add('active', 'bg-indigo-600', 'text-white');
      btn.classList.remove('bg-white', 'text-slate-600');

      const period = btn.dataset.period;
      state.filter.period = period;
      
      const customBox = document.getElementById('customDateRangeBox');
      if (period === 'custom') {
        customBox.classList.remove('hidden');
      } else {
        customBox.classList.add('hidden');
      }
      render();
    });
  });

  // Custom date inputs
  const customStartEl = document.getElementById('customStartDate');
  const customEndEl = document.getElementById('customEndDate');
  if (customStartEl && customEndEl) {
    const handleDateChange = () => {
      state.filter.customStartDate = customStartEl.value;
      state.filter.customEndDate = customEndEl.value;
      render();
    };
    customStartEl.addEventListener('change', handleDateChange);
    customEndEl.addEventListener('change', handleDateChange);
  }

  // Type filter dropdown for history
  document.getElementById('filterType')?.addEventListener('change', (e) => {
    state.filter.type = e.target.value;
    renderLedger();
  });

  // Debounced search input
  const debouncedSearch = debounce((query) => {
    state.filter.search = query;
    renderLedger();
  }, 180);

  document.getElementById('searchInput')?.addEventListener('input', (e) => {
    debouncedSearch(e.target.value.trim().toLowerCase());
  });

  // Main Navigation Tabs
  document.getElementById('navTabLedger')?.addEventListener('click', () => switchTab('ledger'));
  document.getElementById('navTabSummary')?.addEventListener('click', () => switchTab('summary'));

  // Summary Month Controls
  document.getElementById('summaryPrevMonthBtn')?.addEventListener('click', prevSummaryMonth);
  document.getElementById('summaryNextMonthBtn')?.addEventListener('click', nextSummaryMonth);
  document.getElementById('summaryCurrentMonthBtn')?.addEventListener('click', resetSummaryCurrentMonth);
  document.getElementById('summaryMonthPicker')?.addEventListener('change', (e) => {
    if (e.target.value) setSummaryMonth(e.target.value);
  });
  document.getElementById('summaryPrintBtn')?.addEventListener('click', handlePrintSummary);

  // Summary Ranking Sort Buttons
  document.getElementById('sortRankByAmountBtn')?.addEventListener('click', () => setSummarySortBy('amount'));
  document.getElementById('sortRankByCountBtn')?.addEventListener('click', () => setSummarySortBy('count'));

  // Toggle Analytics Section (Shortcut from top bar to Summary View)
  document.getElementById('toggleAnalyticsBtn')?.addEventListener('click', () => {
    if (state.currentTab === 'ledger') {
      switchTab('summary');
    } else {
      switchTab('ledger');
    }
  });

  // Category modal
  document.getElementById('saveNewCategoryBtn')?.addEventListener('click', handleAddNewCategory);

  // Shortcuts & Sound Buttons
  document.getElementById('shortcutsBtn')?.addEventListener('click', openShortcutsModal);
  document.getElementById('soundToggleBtn')?.addEventListener('click', toggleSound);

  // Presets Modal buttons
  document.getElementById('addNewPresetBtn')?.addEventListener('click', handleAddNewPreset);

  // Pagination Load More
  document.getElementById('loadMoreLedgerBtn')?.addEventListener('click', () => {
    state.ledgerVisibleDays += 15;
    renderLedger();
  });

  // Data Actions inside Data Management Modal
  document.getElementById('exportCsvBtn')?.addEventListener('click', exportToCSV);
  document.getElementById('exportJsonBtn')?.addEventListener('click', exportToJSON);
  document.getElementById('importJsonInput')?.addEventListener('change', (e) => {
    importFromJSON(e);
    closeDataManagementModal();
  });
  document.getElementById('printReportBtn')?.addEventListener('click', () => {
    closeDataManagementModal();
    setTimeout(() => window.print(), 150);
  });

  // Google Sheets integration
  document.getElementById('googleSheetBtn')?.addEventListener('click', () => {
    closeDataManagementModal();
    openGoogleSheetModal();
  });
  document.getElementById('testGsheetBtn')?.addEventListener('click', testGoogleSheetConnection);
  document.getElementById('saveGsheetBtn')?.addEventListener('click', handleSaveGoogleSheetSettings);
  document.getElementById('uploadAllGsheetBtn')?.addEventListener('click', handleBatchUploadGoogleSheet);
  document.getElementById('pullAllGsheetBtn')?.addEventListener('click', handlePullFromGoogleSheet);
  document.getElementById('copyAppsScriptBtn')?.addEventListener('click', handleCopyAppsScriptCode);

  // Data Management Modal Trigger Button
  const toolsBtn = document.getElementById('toolsDropdownBtn');
  toolsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openDataManagementModal();
  });

  // Collapsible More Options Toggle
  const toggleMoreBtn = document.getElementById('toggleMoreOptionsBtn');
  const moreContent = document.getElementById('moreOptionsContent');
  const moreChevron = document.getElementById('moreOptionsChevron');
  toggleMoreBtn?.addEventListener('click', () => {
    const isHidden = moreContent.classList.toggle('hidden');
    if (moreChevron) {
      moreChevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  });

  document.getElementById('clearAllBtn')?.addEventListener('click', () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลบันทึกทั้งหมด?')) {
      state.transactions = [];
      saveToStorage();
      render();
      showToast('ล้างข้อมูลทั้งหมดแล้ว', 'info');
    }
  });
}

// ==========================================================================
// Form Submission & Editing
// ==========================================================================

function handleFormSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const smartInput = document.getElementById('smartInput');
  const rawText = smartInput ? smartInput.value.trim() : '';

  if (!rawText) {
    showToast('กรุณาพิมพ์บอกรายการ เช่น ข้าวกะเพรา 65, กาแฟ 50 โอน, เติมน้ำมัน 800', 'info');
    smartInput?.focus();
    return;
  }

  const parsed = parseNaturalExpenseText(rawText);

  if (!parsed.hasAmount || parsed.amount <= 0) {
    showToast(`กรุณาระบุจำนวนเงิน เช่น "${rawText} 50"`, 'error');
    smartInput?.focus();
    return;
  }

  let type = state.entryForm.type || parsed.type || 'expense';
  let category = state.entryForm.selectedCategoryId || parsed.categoryId;

  // Consistency Check: ensure category actually belongs to type!
  const isCatInType = (state.categories[type] || []).some(c => c.id === category);
  if (!isCatInType) {
    if (parsed.categoryId && (state.categories[type] || []).some(c => c.id === parsed.categoryId)) {
      category = parsed.categoryId;
    } else {
      category = state.categories[type]?.[0]?.id || (type === 'income' ? 'salary' : 'food');
    }
  }

  const paymentMethod = state.entryForm.selectedPayment || parsed.paymentMethod || 'promptpay';
  
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

  let date = document.getElementById('txDate')?.value || formatDateToISO(now);
  let time = document.getElementById('txTime')?.value;
  if (!state.entryForm.editingId) {
    if (!time || date === formatDateToISO(now)) {
      time = currentTime;
    }
  } else {
    if (!time) time = currentTime;
  }

  const note = parsed.note || (getCategoryObj(type, category)?.name || (type === 'income' ? 'รายรับ' : 'รายจ่าย'));
  const amount = parsed.amount;

  if (state.entryForm.editingId) {
    // อัปเดตรายการเดิม
    const idx = state.transactions.findIndex(t => t.id === state.entryForm.editingId);
    if (idx !== -1) {
      state.transactions[idx] = {
        ...state.transactions[idx],
        type,
        amount,
        category,
        paymentMethod,
        date,
        time,
        note,
        updatedAt: Date.now()
      };
      playSuccessChime();
      showToast(`อัปเดต "${note}" ฿${formatNumber(amount)} เรียบร้อยแล้ว`, 'success');
      syncSingleTransactionToSheet(state.transactions[idx]);
    }
    cancelEditing();
  } else {
    // บันทึกรายการใหม่
    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type,
      amount,
      category,
      paymentMethod,
      date,
      time,
      note,
      createdAt: Date.now()
    };
    state.transactions.unshift(newTx);
    playSuccessChime();
    const catName = getCategoryObj(type, category)?.name || '';
    showToast(`⚡ จด "${note}" ฿${formatNumber(amount)} [${catName}] สำเร็จ!`, 'success');
    syncSingleTransactionToSheet(newTx);

    // เรียนรู้คำนี้ไว้สำหรับครั้งต่อไป (Learn this keyword for future entries)
    learnUserKeyword(note, category);

    // รีเซ็ต smart input เพื่อให้พร้อมพิมพ์รายการต่อไปได้ทันทีโดยไม่ต้องคลิกใหม่!
    if (smartInput) smartInput.value = '';
    updateSmartLivePreview();
    smartInput?.focus();
  }

  saveToStorage();
  render();
}

function startEditing(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;

  state.entryForm.editingId = id;
  state.entryForm.type = tx.type;
  state.entryForm.selectedCategoryId = tx.category;
  state.entryForm.selectedPayment = tx.paymentMethod || 'promptpay';

  // Set values
  setEntryType(tx.type);
  selectCategory(tx.category);

  const smartInput = document.getElementById('smartInput');
  if (smartInput) {
    smartInput.value = `${tx.note || ''} ${tx.amount}`.trim();
  }

  const txPayment = document.getElementById('txPayment');
  if (txPayment) txPayment.value = tx.paymentMethod || 'promptpay';

  const txDate = document.getElementById('txDate');
  if (txDate) txDate.value = tx.date;

  const txTime = document.getElementById('txTime');
  if (txTime) txTime.value = tx.time || '12:00';

  updateSmartLivePreview(true);

  // Show editing banner
  const editingBanner = document.getElementById('editingBanner');
  if (editingBanner) editingBanner.classList.remove('hidden');

  const submitBtn = document.getElementById('submitEntryBtn');
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fa-solid fa-check text-xs"></i>';
    submitBtn.className = 'absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-2xs transition-all active:scale-95';
    submitBtn.title = 'บันทึกการแก้ไข (Enter)';
  }

  // Open more options so user can easily adjust categories, date, etc.
  document.getElementById('moreOptionsContent')?.classList.remove('hidden');
  const moreChevron = document.getElementById('moreOptionsChevron');
  if (moreChevron) moreChevron.style.transform = 'rotate(180deg)';

  // Scroll to form smoothly
  document.getElementById('fastEntryCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  smartInput?.focus();
}

function cancelEditing() {
  state.entryForm.editingId = null;

  const editingBanner = document.getElementById('editingBanner');
  if (editingBanner) editingBanner.classList.add('hidden');

  const submitBtn = document.getElementById('submitEntryBtn');
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fa-solid fa-arrow-up text-xs"></i>';
    submitBtn.className = 'absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-2xs transition-all active:scale-95';
    submitBtn.title = 'บันทึก (Enter)';
  }

  // Collapse more options
  document.getElementById('moreOptionsContent')?.classList.add('hidden');
  const moreChevron = document.getElementById('moreOptionsChevron');
  if (moreChevron) moreChevron.style.transform = 'rotate(0deg)';

  const smartInput = document.getElementById('smartInput');
  if (smartInput) smartInput.value = '';
  setDefaultFormDateTime();
  updateSmartLivePreview();
  smartInput?.focus();
}

function deleteTransaction(id) {
  if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    if (state.entryForm.editingId === id) {
      cancelEditing();
    }
    deleteFromGoogleSheet(id);
    saveToStorage();
    render();
    showToast('ลบรายการเรียบร้อยแล้ว', 'info');
  }
}

function duplicateTransaction(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;
  const date = formatDateToISO(now);

  const duplicated = {
    ...tx,
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    date,
    time,
    createdAt: Date.now()
  };

  state.transactions.unshift(duplicated);
  playSuccessChime();
  syncSingleTransactionToSheet(duplicated);
  saveToStorage();
  render();
  showToast(`⚡ คัดลอกรายการลงใน "วันนี้" เรียบร้อยแล้ว`, 'success');
}

// ==========================================================================
// Filtering & Calculation
// ==========================================================================

function getFilteredTransactions() {
  const { period, customStartDate, customEndDate, type, search } = state.filter;
  const now = new Date();

  return state.transactions.filter(tx => {
    const txDate = new Date(tx.date);

    // Period filter
    if (period === 'today') {
      if (tx.date !== formatDateToISO(now)) return false;
    } else if (period === 'this_week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      if (txDate < startOfWeek || txDate > endOfWeek) return false;
    } else if (period === 'this_month') {
      if (txDate.getFullYear() !== now.getFullYear() || txDate.getMonth() !== now.getMonth()) {
        return false;
      }
    } else if (period === 'this_year') {
      if (txDate.getFullYear() !== now.getFullYear()) return false;
    } else if (period === 'custom') {
      if (customStartDate && tx.date < customStartDate) return false;
      if (customEndDate && tx.date > customEndDate) return false;
    }

    // Type filter
    if (type !== 'all' && tx.type !== type) return false;

    // Search filter
    if (search) {
      const cat = getCategoryObj(tx.type, tx.category);
      const catName = (cat?.name || '').toLowerCase();
      const note = (tx.note || '').toLowerCase();
      const amtStr = String(tx.amount);
      if (!catName.includes(search) && !note.includes(search) && !amtStr.includes(search)) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    const dtA = `${a.date}T${a.time || '00:00'}`;
    const dtB = `${b.date}T${b.time || '00:00'}`;
    return dtB.localeCompare(dtA);
  });
}

function calculateSummary(list) {
  let totalIncome = 0;
  let genuineIncome = 0;
  let totalExpense = 0;
  let totalSavings = 0;
  let totalSavingsWithdrawal = 0;
  let actualSpending = 0;
  const expenseByCategory = {};
  const incomeByCategory = {};

  list.forEach(tx => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
      incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount;
      if (tx.category === 'savings_withdrawal') {
        totalSavingsWithdrawal += tx.amount;
      } else {
        genuineIncome += tx.amount;
      }
    } else {
      totalExpense += tx.amount;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
      if (tx.category === 'savings') {
        totalSavings += tx.amount;
      } else {
        actualSpending += tx.amount;
      }
    }
  });

  const netSavings = Math.max(0, totalSavings - totalSavingsWithdrawal);
  const netBalance = totalIncome - totalExpense;
  const incomeBase = genuineIncome > 0 ? genuineIncome : totalIncome;
  const dedicatedSavingsRate = incomeBase > 0 ? ((netSavings / incomeBase) * 100) : 0;
  const totalSavingsRate = incomeBase > 0 ? (((netSavings + Math.max(0, netBalance)) / incomeBase) * 100) : 0;

  return {
    totalIncome,
    genuineIncome,
    totalExpense,
    actualSpending,
    totalSavings: netSavings,
    totalSavingsDeposited: totalSavings,
    totalSavingsWithdrawal,
    netBalance,
    savingsRate: totalSavingsRate.toFixed(1),
    dedicatedSavingsRate: dedicatedSavingsRate.toFixed(1),
    expenseByCategory,
    incomeByCategory,
    count: list.length
  };
}

// ==========================================================================
// Rendering (Ledger Stream & Compact Summary)
// ==========================================================================

function render() {
  const filtered = getFilteredTransactions();
  const summary = calculateSummary(filtered);

  renderCompactHeaderSummary(summary);
  renderLedger(filtered);

  if (state.showAnalytics) {
    renderCharts(filtered, summary);
  }

  // Update Summary Dashboard if on summary tab
  if (state.currentTab === 'summary') {
    renderSummaryView();
  }
}

function renderCompactHeaderSummary(summary) {
  const netBalanceEl = document.getElementById('summaryNetBalance');
  const totalIncomeEl = document.getElementById('summaryTotalIncome');
  const totalExpenseEl = document.getElementById('summaryTotalExpense');
  const totalSavingsEl = document.getElementById('summaryTotalSavings');
  const savingsRateBadgeEl = document.getElementById('summarySavingsRateBadge');
  const txCountEl = document.getElementById('summaryTxCount');

  if (netBalanceEl) {
    netBalanceEl.innerText = formatMoney(summary.netBalance);
    netBalanceEl.className = summary.netBalance >= 0 ? 'text-sm sm:text-base font-bold text-emerald-600' : 'text-sm sm:text-base font-bold text-rose-600';
  }
  
  if (totalIncomeEl) {
    totalIncomeEl.innerText = `+${formatMoney(summary.totalIncome)}`;
    if (summary.totalSavingsWithdrawal > 0) {
      totalIncomeEl.title = `รายรับรวม ฿${formatNumber(summary.totalIncome)} (รายได้หลัก ฿${formatNumber(summary.genuineIncome)} + ดึงเงินออมมาใช้ ฿${formatNumber(summary.totalSavingsWithdrawal)})`;
    } else {
      totalIncomeEl.title = `รายรับรวม ฿${formatNumber(summary.totalIncome)}`;
    }
  }
  
  if (totalExpenseEl) {
    if (summary.totalSavingsDeposited > 0) {
      totalExpenseEl.innerText = `-${formatMoney(summary.actualSpending)}`;
      totalExpenseEl.title = `จ่ายกินใช้จริง ฿${formatNumber(summary.actualSpending)} (รวมเงินที่โอนไปออม ฿${formatNumber(summary.totalExpense)})`;
    } else {
      totalExpenseEl.innerText = `-${formatMoney(summary.totalExpense)}`;
    }
  }

  if (totalSavingsEl) {
    totalSavingsEl.innerText = formatMoney(summary.totalSavings);
    if (summary.totalSavingsWithdrawal > 0) {
      totalSavingsEl.title = `เงินออมสะสมคงเหลือ ฿${formatNumber(summary.totalSavings)} (ออมเข้า ฿${formatNumber(summary.totalSavingsDeposited)} - ถอนมาใช้ ฿${formatNumber(summary.totalSavingsWithdrawal)})`;
    } else {
      totalSavingsEl.title = `เงินออมสะสม ฿${formatNumber(summary.totalSavings)}`;
    }
  }

  if (savingsRateBadgeEl) {
    const rate = parseFloat(summary.dedicatedSavingsRate || 0);
    savingsRateBadgeEl.innerText = `${rate}%`;
    if (rate >= 20) {
      savingsRateBadgeEl.className = 'text-[10px] font-bold text-teal-800 bg-teal-100/90 px-1.5 py-0.5 rounded-full';
      savingsRateBadgeEl.title = 'ยอดเยี่ยม! อัตราเงินออมมากกว่า 20% ของรายรับ';
    } else if (rate > 0) {
      savingsRateBadgeEl.className = 'text-[10px] font-bold text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded-full';
    } else {
      savingsRateBadgeEl.className = 'text-[10px] font-medium text-slate-400 bg-slate-200/70 px-1.5 py-0.5 rounded-full';
    }
  }

  if (txCountEl) txCountEl.innerText = `${summary.count} รายการ`;
}

function renderLedger(filteredList = null) {
  const list = filteredList || getFilteredTransactions();
  const container = document.getElementById('ledgerFeedContainer');
  const emptyState = document.getElementById('emptyLedgerNotice');

  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  // จัดกลุ่มตามวันที่ (Group by Date)
  const groups = {};
  list.forEach(tx => {
    if (!groups[tx.date]) {
      groups[tx.date] = [];
    }
    groups[tx.date].push(tx);
  });

  const dateEntries = Object.entries(groups);
  const totalDays = dateEntries.length;
  const visibleEntries = dateEntries.slice(0, state.ledgerVisibleDays);

  const todayStr = formatDateToISO(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateToISO(yesterday);

  let html = '';

  for (const [dateStr, txGroup] of visibleEntries) {
    // คำนวณยอดรวมประจำวัน (แยกเงินออมและถอนเงินออมให้เห็นชัดเจน)
    let dayIncome = 0;
    let dayExpense = 0;
    let daySavings = 0;
    let daySavingsWithdrawal = 0;
    txGroup.forEach(t => {
      if (t.type === 'income') {
        dayIncome += t.amount;
        if (t.category === 'savings_withdrawal') daySavingsWithdrawal += t.amount;
      } else {
        dayExpense += t.amount;
        if (t.category === 'savings') daySavings += t.amount;
      }
    });

    // Friendly date title
    let friendlyDate = formatThaiDate(dateStr);
    let dayBadge = '';
    if (dateStr === todayStr) {
      dayBadge = '<span class="text-[11px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">วันนี้</span>';
    } else if (dateStr === yesterdayStr) {
      dayBadge = '<span class="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-200 text-slate-700">เมื่อวานนี้</span>';
    }

    html += `
      <div class="daily-ledger-card mb-4 animate-fade-in">
        <!-- Daily Header -->
        <div class="daily-ledger-header px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <i class="fa-regular fa-calendar text-slate-400 text-xs"></i>
            <span class="font-bold text-slate-800 text-xs sm:text-sm">${friendlyDate}</span>
            ${dayBadge}
          </div>
          <div class="flex items-center justify-end flex-wrap gap-1 sm:gap-2">
            ${dayIncome > 0 ? `<span class="text-emerald-600 font-semibold text-xs sm:text-sm">+฿${formatNumber(dayIncome)}</span>` : ''}
            ${dayExpense > 0 ? `<span class="text-rose-600 font-semibold text-xs sm:text-sm">-฿${formatNumber(dayExpense)}</span>` : ''}
            ${daySavings > 0 ? `<span class="text-[10px] sm:text-[11px] text-teal-700 font-bold bg-teal-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-teal-200/70 whitespace-nowrap">🐷 ออม ฿${formatNumber(daySavings)}</span>` : ''}
            ${daySavingsWithdrawal > 0 ? `<span class="text-[10px] sm:text-[11px] text-sky-700 font-bold bg-sky-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-sky-200/70 whitespace-nowrap">💸 ดึงออม ฿${formatNumber(daySavingsWithdrawal)}</span>` : ''}
          </div>
        </div>

        <!-- Daily Transactions List -->
        <div class="divide-y divide-slate-100">
          ${txGroup.map(tx => {
            const isIncome = tx.type === 'income';
            const isSavings = tx.category === 'savings';
            const isSavingsWithdrawal = tx.category === 'savings_withdrawal';
            const cat = getCategoryObj(tx.type, tx.category);
            const payment = PAYMENT_METHODS[tx.paymentMethod] || { name: tx.paymentMethod || 'เงินสด', icon: 'fa-wallet' };
            const amountColor = isIncome 
              ? (isSavingsWithdrawal ? 'text-sky-600 font-bold' : 'amount-income') 
              : (isSavings ? 'text-teal-700 font-bold' : 'amount-expense');
            const savingsBadge = isSavings 
              ? '<span class="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-teal-100 text-teal-800 ml-1">🐷 เงินออม</span>' 
              : (isSavingsWithdrawal 
                  ? '<span class="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-sky-100 text-sky-800 ml-1">💸 ถอนเงินออม</span>' 
                  : '');

            return `
              <div class="p-3 sm:p-3.5 hover:bg-slate-50 flex items-center justify-between gap-2 sm:gap-3 transition-colors group">
                
                <!-- Left: Category Icon & Details -->
                <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white text-xs sm:text-sm shadow-sm shrink-0" style="background-color: ${cat?.color || '#64748B'}">
                    <i class="fa-solid ${cat?.icon || 'fa-tag'}"></i>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                      <span class="font-bold text-slate-800 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">${cat?.name || tx.category}</span>
                      ${savingsBadge}
                      <span class="text-[10px] sm:text-[11px] text-slate-400 ml-0.5"><i class="fa-regular fa-clock text-[9px] mr-0.5"></i>${tx.time || '12:00'}</span>
                    </div>
                    <div class="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                      ${tx.note ? `<span class="text-xs text-slate-600 truncate max-w-[120px] sm:max-w-xs">${escapeHtml(tx.note)}</span>` : ''}
                      <span class="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        <i class="fa-solid ${payment.icon} text-[8px] sm:text-[9px] text-slate-400"></i>
                        ${payment.name}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Right: Amount & Actions -->
                <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  <div class="text-right">
                    <div class="font-bold text-sm sm:text-base ${amountColor}">
                      ${isIncome ? '+' : '-'}฿${formatNumber(tx.amount)}
                    </div>
                  </div>

                  <!-- Quick Action Buttons -->
                  <div class="flex items-center gap-0.5 sm:gap-1 opacity-80 sm:opacity-60 group-hover:opacity-100 transition-opacity no-print">
                    <button onclick="duplicateTransaction('${tx.id}')" title="คัดลอกรายการนี้เป็นของวันนี้" class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors">
                      <i class="fa-solid fa-copy text-[10px] sm:text-xs"></i>
                    </button>
                    <button onclick="startEditing('${tx.id}')" title="แก้ไข" class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors">
                      <i class="fa-solid fa-pen text-[10px] sm:text-xs"></i>
                    </button>
                    <button onclick="deleteTransaction('${tx.id}')" title="ลบ" class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors">
                      <i class="fa-solid fa-trash text-[10px] sm:text-xs"></i>
                    </button>
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;

  // Pagination / Load More UI update
  const paginationContainer = document.getElementById('ledgerPaginationContainer');
  const remainingEl = document.getElementById('ledgerRemainingCount');
  if (paginationContainer) {
    if (totalDays > state.ledgerVisibleDays) {
      let remainingTxs = 0;
      for (let i = state.ledgerVisibleDays; i < totalDays; i++) {
        remainingTxs += dateEntries[i][1].length;
      }
      if (remainingEl) remainingEl.innerText = `${remainingTxs} รายการ (${totalDays - state.ledgerVisibleDays} วัน)`;
      paginationContainer.classList.remove('hidden');
    } else {
      paginationContainer.classList.add('hidden');
    }
  }
}

// ==========================================================================
// Collapsible Analytics Section
// ==========================================================================

function toggleAnalyticsView() {
  state.showAnalytics = !state.showAnalytics;
  const section = document.getElementById('analyticsSection');
  const btn = document.getElementById('toggleAnalyticsBtn');

  if (state.showAnalytics) {
    section.classList.remove('hidden');
    btn.innerHTML = '<i class="fa-solid fa-chart-pie"></i> <span>ซ่อนสถิติและกราฟ</span>';
    btn.classList.replace('bg-white', 'bg-indigo-50');
    btn.classList.replace('text-indigo-600', 'text-indigo-700');
    
    // Render charts
    const filtered = getFilteredTransactions();
    const summary = calculateSummary(filtered);
    renderCharts(filtered, summary);
  } else {
    section.classList.add('hidden');
    btn.innerHTML = '<i class="fa-solid fa-chart-pie"></i> <span>ดูกราฟและสถิติ</span>';
    btn.classList.replace('bg-indigo-50', 'bg-white');
    btn.classList.replace('text-indigo-700', 'text-indigo-600');
  }
}

function renderCharts(filteredList, summary) {
  renderCategoryDonutChart(summary.expenseByCategory);
  renderTrendBarChart(filteredList);

  // Update Savings Performance Card
  const totalSavingsText = document.getElementById('analyticsTotalSavingsText');
  const savingsRateText = document.getElementById('analyticsSavingsRateText');
  const progressBar = document.getElementById('analyticsSavingsProgressBar');
  const healthBadge = document.getElementById('analyticsSavingsHealthBadge');

  const rate = parseFloat(summary.dedicatedSavingsRate || 0);
  if (totalSavingsText) {
    if (summary.totalSavingsWithdrawal > 0) {
      totalSavingsText.innerText = `${formatMoney(summary.totalSavings)} (ออมเข้า ${formatMoney(summary.totalSavingsDeposited)} · ถอนมาใช้ ${formatMoney(summary.totalSavingsWithdrawal)})`;
    } else {
      totalSavingsText.innerText = formatMoney(summary.totalSavings);
    }
  }
  if (savingsRateText) savingsRateText.innerText = `${rate}% (${formatMoney(summary.totalSavings)} / ${formatMoney(summary.genuineIncome || summary.totalIncome)})`;
  if (progressBar) {
    progressBar.style.width = `${Math.min(100, Math.max(0, rate))}%`;
  }
  if (healthBadge) {
    if (rate >= 30) {
      healthBadge.innerText = 'สุดยอดวินัยการเงิน 💎';
      healthBadge.className = 'text-[10px] font-bold text-teal-800 bg-teal-200 px-2 py-0.5 rounded-full';
    } else if (rate >= 20) {
      healthBadge.innerText = 'ยอดเยี่ยม (ตามเกณฑ์ 20%) 🌟';
      healthBadge.className = 'text-[10px] font-bold text-teal-800 bg-teal-200 px-2 py-0.5 rounded-full';
    } else if (rate >= 10) {
      healthBadge.innerText = 'กำลังดี มีวินัย 👍';
      healthBadge.className = 'text-[10px] font-bold text-sky-800 bg-sky-200 px-2 py-0.5 rounded-full';
    } else if (rate > 0) {
      healthBadge.innerText = 'เริ่มต้นสะสม 🌱';
      healthBadge.className = 'text-[10px] font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full';
    } else {
      healthBadge.innerText = 'ยังไม่มีเงินออม 🎯';
      healthBadge.className = 'text-[10px] font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full';
    }
  }
}

function renderCategoryDonutChart(expenseByCategory) {
  const canvas = document.getElementById('categoryPieChart');
  const emptyPlaceholder = document.getElementById('chartEmptyNotice');
  if (!canvas) return;

  const entries = Object.entries(expenseByCategory);

  if (entries.length === 0) {
    if (categoryChartInstance) {
      categoryChartInstance.destroy();
      categoryChartInstance = null;
    }
    canvas.classList.add('hidden');
    if (emptyPlaceholder) emptyPlaceholder.classList.remove('hidden');
    return;
  }

  canvas.classList.remove('hidden');
  if (emptyPlaceholder) emptyPlaceholder.classList.add('hidden');

  const labels = [];
  const data = [];
  const backgroundColors = [];

  entries.forEach(([catId, amount]) => {
    const cat = getCategoryObj('expense', catId);
    labels.push(cat ? cat.name : catId);
    data.push(amount);
    backgroundColors.push(cat ? cat.color : '#94A3B8');
  });

  if (categoryChartInstance) categoryChartInstance.destroy();

  categoryChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 10, font: { family: 'Prompt', size: 11 }, padding: 8 }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ฿${formatNumber(val)} (${pct}%)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}

function renderTrendBarChart(transactions) {
  const canvas = document.getElementById('trendBarChart');
  if (!canvas) return;

  const dateMap = {};
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  sorted.forEach(tx => {
    if (!dateMap[tx.date]) dateMap[tx.date] = { income: 0, expense: 0 };
    if (tx.type === 'income') dateMap[tx.date].income += tx.amount;
    else dateMap[tx.date].expense += tx.amount;
  });

  const dates = Object.keys(dateMap).slice(-10);
  const incomeData = dates.map(d => dateMap[d].income);
  const expenseData = dates.map(d => dateMap[d].expense);
  const labels = dates.map(d => {
    const parts = d.split('-');
    return `${parts[2]}/${parts[1]}`;
  });

  if (trendChartInstance) trendChartInstance.destroy();

  trendChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'รายรับ', data: incomeData, backgroundColor: '#10B981', borderRadius: 6 },
        { label: 'รายจ่าย', data: expenseData, backgroundColor: '#F43F5E', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 10, font: { family: 'Prompt', size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ฿${formatNumber(ctx.raw)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (v) => '฿' + formatCompactNumber(v), font: { family: 'Prompt', size: 10 } }
        },
        x: { ticks: { font: { family: 'Prompt', size: 10 } } }
      }
    }
  });
}

// ==========================================================================
// Monthly Summary Dashboard & Expense Ranking System (Tab 2)
// ==========================================================================

let summaryDonutChartInstance = null;
let summaryDailyTrendChartInstance = null;

function switchTab(tabName) {
  state.currentTab = tabName;
  const ledgerView = document.getElementById('ledgerView');
  const summaryView = document.getElementById('summaryView');
  const navTabLedger = document.getElementById('navTabLedger');
  const navTabSummary = document.getElementById('navTabSummary');

  if (tabName === 'summary') {
    if (ledgerView) ledgerView.classList.add('hidden');
    if (summaryView) summaryView.classList.remove('hidden');

    if (navTabLedger) {
      navTabLedger.classList.remove('active', 'bg-white', 'text-indigo-600');
      navTabLedger.classList.add('text-slate-500');
    }
    if (navTabSummary) {
      navTabSummary.classList.add('active', 'bg-white', 'text-indigo-600');
      navTabSummary.classList.remove('text-slate-500');
    }

    renderSummaryView();
  } else {
    if (summaryView) summaryView.classList.add('hidden');
    if (ledgerView) ledgerView.classList.remove('hidden');

    if (navTabSummary) {
      navTabSummary.classList.remove('active', 'bg-white', 'text-indigo-600');
      navTabSummary.classList.add('text-slate-500');
    }
    if (navTabLedger) {
      navTabLedger.classList.add('active', 'bg-white', 'text-indigo-600');
      navTabLedger.classList.remove('text-slate-500');
    }

    // Auto focus smart input
    setTimeout(() => {
      document.getElementById('smartInput')?.focus();
    }, 60);
  }
}

function getThaiMonthLabel(yearMonthStr) {
  if (!yearMonthStr) return '';
  const [yStr, mStr] = yearMonthStr.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const mName = thaiMonthsFull[month - 1] || '';
  const thaiYear = year + 543;
  return `${mName} ${thaiYear}`;
}

function setSummaryMonth(yearMonthStr) {
  state.summaryMonth = yearMonthStr;
  const picker = document.getElementById('summaryMonthPicker');
  if (picker) picker.value = yearMonthStr;
  renderSummaryView();
}

function prevSummaryMonth() {
  if (!state.summaryMonth) {
    const now = new Date();
    state.summaryMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  const [yStr, mStr] = state.summaryMonth.split('-');
  let year = parseInt(yStr, 10);
  let month = parseInt(mStr, 10) - 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  setSummaryMonth(`${year}-${String(month).padStart(2, '0')}`);
}

function nextSummaryMonth() {
  if (!state.summaryMonth) {
    const now = new Date();
    state.summaryMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  const [yStr, mStr] = state.summaryMonth.split('-');
  let year = parseInt(yStr, 10);
  let month = parseInt(mStr, 10) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  setSummaryMonth(`${year}-${String(month).padStart(2, '0')}`);
}

function resetSummaryCurrentMonth() {
  const now = new Date();
  setSummaryMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
}

function toggleCategoryDrilldown(catId) {
  if (state.expandedCategories.has(catId)) {
    state.expandedCategories.delete(catId);
  } else {
    state.expandedCategories.add(catId);
  }
  const data = calculateMonthlySummaryData(state.summaryMonth);
  renderRankedCategories(data);
}

function setSummarySortBy(sortBy) {
  state.summarySortBy = sortBy;
  const btnAmount = document.getElementById('sortRankByAmountBtn');
  const btnCount = document.getElementById('sortRankByCountBtn');
  if (sortBy === 'amount') {
    btnAmount?.classList.add('bg-white', 'text-indigo-600', 'font-bold');
    btnAmount?.classList.remove('font-medium', 'text-slate-500');
    btnCount?.classList.remove('bg-white', 'text-indigo-600', 'font-bold');
    btnCount?.classList.add('font-medium', 'text-slate-500');
  } else {
    btnCount?.classList.add('bg-white', 'text-indigo-600', 'font-bold');
    btnCount?.classList.remove('font-medium', 'text-slate-500');
    btnAmount?.classList.remove('bg-white', 'text-indigo-600', 'font-bold');
    btnAmount?.classList.add('font-medium', 'text-slate-500');
  }
  renderSummaryView();
}

function calculateMonthlySummaryData(yearMonthStr) {
  if (!yearMonthStr) {
    const now = new Date();
    yearMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  const [yStr, mStr] = yearMonthStr.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const now = new Date();
  const isCurrentMonth = (now.getFullYear() === year && (now.getMonth() + 1) === month);
  const isPastMonth = (year < now.getFullYear() || (year === now.getFullYear() && (now.getMonth() + 1) > month));
  
  let daysElapsed = daysInMonth;
  if (isCurrentMonth) {
    daysElapsed = Math.max(1, now.getDate());
  } else if (!isPastMonth) {
    daysElapsed = 0; // future month
  }

  // Filter transactions for this month
  const monthTxList = state.transactions.filter(tx => tx.date && tx.date.startsWith(yearMonthStr));

  let totalIncome = 0;
  let genuineIncome = 0;
  let totalExpense = 0;
  let actualSpending = 0;
  let totalSavings = 0;
  let totalSavingsWithdrawal = 0;

  const expenseByCategory = {};
  const incomeByCategory = {};
  const categoryTxMap = {}; // catId -> array of tx
  const dailyExpenses = {}; // day (1..31) -> amount
  const dailyIncome = {};
  const paymentMethodExpenses = {
    promptpay: 0,
    cash: 0,
    bank: 0,
    credit_card: 0,
    wallet: 0
  };

  for (let d = 1; d <= daysInMonth; d++) {
    dailyExpenses[d] = 0;
    dailyIncome[d] = 0;
  }

  monthTxList.forEach(tx => {
    const dPart = parseInt(tx.date.split('-')[2], 10);
    if (tx.type === 'income') {
      totalIncome += tx.amount;
      incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount;
      if (tx.category === 'savings_withdrawal') {
        totalSavingsWithdrawal += tx.amount;
      } else {
        genuineIncome += tx.amount;
      }
      if (dailyIncome[dPart] !== undefined) {
        dailyIncome[dPart] += tx.amount;
      }
    } else {
      totalExpense += tx.amount;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
      if (tx.category === 'savings') {
        totalSavings += tx.amount;
      } else {
        actualSpending += tx.amount;
      }
      if (dailyExpenses[dPart] !== undefined) {
        dailyExpenses[dPart] += tx.amount;
      }

      // Group tx by category for drilldown
      if (!categoryTxMap[tx.category]) {
        categoryTxMap[tx.category] = [];
      }
      categoryTxMap[tx.category].push(tx);

      // Payment method
      const pm = tx.paymentMethod || 'promptpay';
      if (paymentMethodExpenses[pm] !== undefined) {
        paymentMethodExpenses[pm] += tx.amount;
      } else {
        paymentMethodExpenses[pm] = tx.amount;
      }
    }
  });

  const netSavings = Math.max(0, totalSavings - totalSavingsWithdrawal);
  const netBalance = totalIncome - totalExpense;
  const incomeBase = genuineIncome > 0 ? genuineIncome : totalIncome;
  const dedicatedSavingsRate = incomeBase > 0 ? ((netSavings / incomeBase) * 100) : 0;
  const balancePercentOfIncome = incomeBase > 0 ? ((netBalance / incomeBase) * 100) : 0;

  // Daily Average
  const dailyAverageExpense = daysElapsed > 0 ? (totalExpense / daysElapsed) : 0;

  // Month-end forecast
  const projectedTotalExpense = isCurrentMonth 
    ? (dailyAverageExpense * daysInMonth) 
    : (isPastMonth ? totalExpense : 0);

  // Peak Spending Day
  let peakDay = 0;
  let peakAmount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (dailyExpenses[d] > peakAmount) {
      peakAmount = dailyExpenses[d];
      peakDay = d;
    }
  }

  // Find dominant note or category on peak day
  let peakDayDesc = '';
  if (peakDay > 0) {
    const peakDateStr = `${yearMonthStr}-${String(peakDay).padStart(2, '0')}`;
    const peakTx = monthTxList.filter(t => t.type === 'expense' && t.date === peakDateStr);
    if (peakTx.length > 0) {
      peakTx.sort((a, b) => b.amount - a.amount);
      const topNote = peakTx[0].note || getCategoryObj('expense', peakTx[0].category)?.name || 'รายจ่าย';
      peakDayDesc = `${topNote} (฿${formatNumber(peakTx[0].amount)})${peakTx.length > 1 ? ` และอีก ${peakTx.length - 1} รายการ` : ''}`;
    }
  }

  // Top Payment Method
  let topPmKey = 'promptpay';
  let topPmAmount = 0;
  Object.entries(paymentMethodExpenses).forEach(([pmKey, amt]) => {
    if (amt > topPmAmount) {
      topPmAmount = amt;
      topPmKey = pmKey;
    }
  });
  const topPmObj = PAYMENT_METHODS[topPmKey] || { name: 'พร้อมเพย์', icon: 'fa-qrcode' };
  const topPmPercent = totalExpense > 0 ? ((topPmAmount / totalExpense) * 100).toFixed(0) : 0;

  // Ranking Categories: มากสุด ➔ น้อยสุด
  const rankedCategories = Object.entries(expenseByCategory).map(([catId, amount]) => {
    const cat = getCategoryObj('expense', catId) || { id: catId, name: catId, icon: 'fa-tags', color: '#64748B' };
    const txs = categoryTxMap[catId] || [];
    txs.sort((a, b) => (b.date + ' ' + (b.time || '')).localeCompare(a.date + ' ' + (a.time || '')));
    const count = txs.length;
    const percent = totalExpense > 0 ? ((amount / totalExpense) * 100) : 0;
    return {
      id: catId,
      name: cat.name,
      icon: cat.icon || 'fa-tags',
      color: cat.color || '#6366F1',
      amount,
      count,
      percent,
      transactions: txs
    };
  });

  // Sort ranked categories
  if (state.summarySortBy === 'count') {
    rankedCategories.sort((a, b) => b.count - a.count || b.amount - a.amount);
  } else {
    // Default by amount descending
    rankedCategories.sort((a, b) => b.amount - a.amount || b.count - a.count);
  }

  const topCategory = rankedCategories.length > 0 ? rankedCategories[0] : null;
  const lowestCategory = rankedCategories.length > 1 ? rankedCategories[rankedCategories.length - 1] : null;

  // Top 5 Largest Single Expense Transactions
  const top5SingleExpenses = monthTxList
    .filter(tx => tx.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    yearMonthStr,
    year,
    month,
    daysInMonth,
    daysElapsed,
    isCurrentMonth,
    isPastMonth,
    totalIncome,
    genuineIncome,
    totalExpense,
    actualSpending,
    totalSavings: netSavings,
    totalSavingsDeposited: totalSavings,
    totalSavingsWithdrawal,
    netBalance,
    dedicatedSavingsRate: dedicatedSavingsRate.toFixed(1),
    balancePercentOfIncome: balancePercentOfIncome.toFixed(1),
    dailyAverageExpense,
    projectedTotalExpense,
    peakDay,
    peakAmount,
    peakDayDesc,
    topPmKey,
    topPmObj,
    topPmAmount,
    topPmPercent,
    rankedCategories,
    topCategory,
    lowestCategory,
    dailyExpenses,
    dailyIncome,
    paymentMethodExpenses,
    top5SingleExpenses,
    expenseCount: monthTxList.filter(t => t.type === 'expense').length,
    incomeCount: monthTxList.filter(t => t.type === 'income').length,
    totalCount: monthTxList.length
  };
}

function renderSummaryView() {
  const data = calculateMonthlySummaryData(state.summaryMonth);

  // Month labels & badge
  const monthLabel = getThaiMonthLabel(data.yearMonthStr);
  const monthBadgeEl = document.getElementById('summaryMonthLabelBadge');
  if (monthBadgeEl) {
    monthBadgeEl.innerText = monthLabel;
  }
  const monthPicker = document.getElementById('summaryMonthPicker');
  if (monthPicker && monthPicker.value !== data.yearMonthStr) {
    monthPicker.value = data.yearMonthStr;
  }

  // Card 1: Total Expense
  const totalExpenseEl = document.getElementById('summaryCardTotalExpense');
  const expenseCountBadge = document.getElementById('summaryExpenseCountBadge');
  const dailyAvgEl = document.getElementById('summaryCardDailyAvg');
  if (totalExpenseEl) totalExpenseEl.innerText = formatMoney(data.totalExpense);
  if (expenseCountBadge) expenseCountBadge.innerText = `${data.expenseCount} รายการ`;
  if (dailyAvgEl) dailyAvgEl.innerText = `฿${formatNumber(data.dailyAverageExpense)} / วัน`;

  // Card 2: Total Income
  const totalIncomeEl = document.getElementById('summaryCardTotalIncome');
  const incomeCountBadge = document.getElementById('summaryIncomeCountBadge');
  const genuineIncomeEl = document.getElementById('summaryCardGenuineIncome');
  if (totalIncomeEl) totalIncomeEl.innerText = `+${formatMoney(data.totalIncome)}`;
  if (incomeCountBadge) incomeCountBadge.innerText = `${data.incomeCount} รายการ`;
  if (genuineIncomeEl) genuineIncomeEl.innerText = `+${formatMoney(data.genuineIncome)}`;

  // Card 3: Net Balance
  const netBalanceEl = document.getElementById('summaryCardNetBalance');
  const balanceStatusBadge = document.getElementById('summaryBalanceStatusBadge');
  const balancePercentEl = document.getElementById('summaryCardBalancePercent');
  if (netBalanceEl) {
    netBalanceEl.innerText = formatMoney(data.netBalance);
    netBalanceEl.className = data.netBalance >= 0 
      ? 'text-lg sm:text-2xl font-black text-emerald-600 tracking-tight'
      : 'text-lg sm:text-2xl font-black text-rose-600 tracking-tight';
  }
  if (balanceStatusBadge) {
    if (data.netBalance >= 0) {
      balanceStatusBadge.innerText = 'กระเป๋าเป็นบวก 🟢';
      balanceStatusBadge.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700';
    } else {
      balanceStatusBadge.innerText = 'ติดลบเกินตัว 🔴';
      balanceStatusBadge.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700';
    }
  }
  if (balancePercentEl) {
    balancePercentEl.innerText = `${data.balancePercentOfIncome}% ของรายรับ`;
  }

  // Card 4: Savings
  const totalSavingsEl = document.getElementById('summaryCardTotalSavings');
  const savingsRateBadge = document.getElementById('summaryCardSavingsRateBadge');
  const savingsHealthEl = document.getElementById('summaryCardSavingsHealth');
  if (totalSavingsEl) totalSavingsEl.innerText = formatMoney(data.totalSavings);
  if (savingsRateBadge) savingsRateBadge.innerText = `${data.dedicatedSavingsRate}%`;
  if (savingsHealthEl) {
    const rate = parseFloat(data.dedicatedSavingsRate);
    if (rate >= 30) {
      savingsHealthEl.innerText = 'สุดยอดวินัยการเงิน 💎';
    } else if (rate >= 20) {
      savingsHealthEl.innerText = 'ยอดเยี่ยม (เกณฑ์ 20%) 🌟';
    } else if (rate >= 10) {
      savingsHealthEl.innerText = 'กำลังดี มีวินัย 👍';
    } else if (rate > 0) {
      savingsHealthEl.innerText = 'เริ่มต้นสะสม 🌱';
    } else {
      savingsHealthEl.innerText = 'ยังไม่มีเงินออม 🎯';
    }
  }

  // Insights Banner
  const forecastAmountEl = document.getElementById('insightForecastAmount');
  const forecastDescEl = document.getElementById('insightForecastDesc');
  if (forecastAmountEl) forecastAmountEl.innerText = `~${formatMoney(data.projectedTotalExpense)}`;
  if (forecastDescEl) {
    if (data.isCurrentMonth) {
      forecastDescEl.innerText = `ผ่านมา ${data.daysElapsed}/${data.daysInMonth} วัน เฉลี่ย ฿${formatNumber(data.dailyAverageExpense)}/วัน`;
    } else if (data.isPastMonth) {
      forecastDescEl.innerText = `เดือนที่ผ่านมา ยอดจบที่ ฿${formatNumber(data.totalExpense)}`;
    } else {
      forecastDescEl.innerText = 'เดือนในอนาคต';
    }
  }

  const peakAmountEl = document.getElementById('insightPeakAmount');
  const peakDescEl = document.getElementById('insightPeakDesc');
  if (peakAmountEl) {
    if (data.peakAmount > 0) {
      peakAmountEl.innerText = `วันที่ ${data.peakDay} (${formatMoney(data.peakAmount)})`;
    } else {
      peakAmountEl.innerText = '-';
    }
  }
  if (peakDescEl) {
    peakDescEl.innerText = data.peakDayDesc || 'ไม่มีรายการใช้จ่าย';
  }

  const topPmEl = document.getElementById('insightTopPaymentMethod');
  const topPmDescEl = document.getElementById('insightTopPaymentDesc');
  if (topPmEl) {
    if (data.totalExpense > 0) {
      topPmEl.innerText = `${data.topPmObj.name} (${data.topPmPercent}%)`;
    } else {
      topPmEl.innerText = '-';
    }
  }
  if (topPmDescEl) {
    if (data.totalExpense > 0) {
      topPmDescEl.innerText = `ยอดชำระ ฿${formatNumber(data.topPmAmount)} จากรายจ่ายทั้งหมด`;
    } else {
      topPmDescEl.innerText = 'ไม่มีข้อมูลการจ่าย';
    }
  }

  // Spotlight Top & Lowest Spender
  renderSpotlightSpenders(data);

  // Ranked Categories List
  renderRankedCategories(data);

  // Charts
  renderSummaryCharts(data);

  // Payment methods breakdown
  renderSummaryPaymentMethods(data);

  // Top 5 largest single transactions
  renderSummaryTopTransactions(data);
}

function renderSpotlightSpenders(data) {
  const topCard = document.getElementById('spotlightTopSpenderCard');
  const lowestCard = document.getElementById('spotlightLowestSpenderCard');
  const highlightsContainer = document.getElementById('spotlightHighlightsContainer');

  if (data.rankedCategories.length === 0) {
    if (highlightsContainer) highlightsContainer.classList.add('hidden');
    return;
  }

  if (highlightsContainer) highlightsContainer.classList.remove('hidden');

  // Top Spender
  const topCat = data.topCategory;
  if (topCat) {
    document.getElementById('spotlightTopCatName').innerText = topCat.name;
    document.getElementById('spotlightTopCatDetail').innerText = `${topCat.count} รายการ`;
    document.getElementById('spotlightTopCatAmount').innerText = formatMoney(topCat.amount);
    document.getElementById('spotlightTopCatPercent').innerText = `${topCat.percent.toFixed(1)}% ของรายจ่าย`;
  }

  // Lowest Spender
  const lowestCat = data.lowestCategory;
  if (lowestCat && data.rankedCategories.length > 1) {
    lowestCard.classList.remove('hidden');
    document.getElementById('spotlightLowestCatName').innerText = lowestCat.name;
    document.getElementById('spotlightLowestCatDetail').innerText = `${lowestCat.count} รายการ`;
    document.getElementById('spotlightLowestCatAmount').innerText = formatMoney(lowestCat.amount);
    document.getElementById('spotlightLowestCatPercent').innerText = `${lowestCat.percent.toFixed(1)}% ของรายจ่าย`;
  } else {
    if (lowestCard) lowestCard.classList.add('hidden');
  }
}

function renderRankedCategories(data) {
  const listContainer = document.getElementById('rankedCategoriesList');
  const emptyNotice = document.getElementById('summaryRankEmptyNotice');
  const countBadge = document.getElementById('rankingCategoryCountBadge');

  if (!listContainer) return;

  if (countBadge) {
    countBadge.innerText = `${data.rankedCategories.length} หมวดหมู่`;
  }

  if (data.rankedCategories.length === 0) {
    listContainer.innerHTML = '';
    if (emptyNotice) emptyNotice.classList.remove('hidden');
    return;
  }

  if (emptyNotice) emptyNotice.classList.add('hidden');

  let html = '';
  data.rankedCategories.forEach((cat, index) => {
    const isExpanded = state.expandedCategories.has(cat.id);
    
    // Rank Badge
    let rankBadgeHtml = '';
    if (index === 0) {
      rankBadgeHtml = `<span class="rank-badge rank-badge-1" title="อันดับ 1">🥇1</span>`;
    } else if (index === 1) {
      rankBadgeHtml = `<span class="rank-badge rank-badge-2" title="อันดับ 2">🥈2</span>`;
    } else if (index === 2) {
      rankBadgeHtml = `<span class="rank-badge rank-badge-3" title="อันดับ 3">🥉3</span>`;
    } else {
      rankBadgeHtml = `<span class="rank-badge rank-badge-default font-mono">#${index + 1}</span>`;
    }

    // Top / Lowest badges
    let tagHtml = '';
    if (index === 0) {
      tagHtml = `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">จ่ายเยอะสุด 🔥</span>`;
    } else if (index === data.rankedCategories.length - 1 && data.rankedCategories.length > 1) {
      tagHtml = `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700">จ่ายน้อยสุด 🌱</span>`;
    }

    // Drilldown item rows
    let drilldownRowsHtml = '';
    if (isExpanded) {
      drilldownRowsHtml = cat.transactions.map(t => {
        const pmObj = PAYMENT_METHODS[t.paymentMethod] || { name: 'พร้อมเพย์', icon: 'fa-qrcode' };
        return `
          <div class="flex items-center justify-between py-1.5 px-2.5 bg-white rounded-xl border border-slate-200/60 text-xs hover:border-slate-300 transition-colors">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-[10px] text-slate-400 font-mono shrink-0">${formatThaiDate(t.date)}${t.time ? ' ' + t.time : ''}</span>
              <span class="font-medium text-slate-800 truncate">${escapeHtml(t.note || cat.name)}</span>
              <span class="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">${pmObj.name}</span>
            </div>
            <div class="font-bold text-rose-600 text-xs shrink-0 pl-2">
              -฿${formatNumber(t.amount)}
            </div>
          </div>
        `;
      }).join('');
    }

    html += `
      <div class="ranked-cat-card bg-slate-50/70 hover:bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 transition-all cursor-pointer" onclick="toggleCategoryDrilldown('${cat.id}')">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 min-w-0">
            ${rankBadgeHtml}
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shrink-0 shadow-2xs" style="background-color: ${cat.color};">
              <i class="fa-solid ${cat.icon}"></i>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-bold text-xs sm:text-sm text-slate-900 truncate">${escapeHtml(cat.name)}</span>
                ${tagHtml}
              </div>
              <div class="text-[11px] text-slate-400">
                ${cat.count} รายการ
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <div class="text-right">
              <div class="font-bold text-sm sm:text-base text-rose-600">${formatMoney(cat.amount)}</div>
              <div class="text-[11px] font-semibold text-slate-500">${cat.percent.toFixed(1)}%</div>
            </div>
            <div class="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}">
              <i class="fa-solid fa-chevron-down text-[10px]"></i>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden mt-2.5">
          <div class="progress-fill h-full rounded-full" style="width: ${Math.min(100, Math.max(2, cat.percent))}%; background-color: ${cat.color};"></div>
        </div>

        <!-- Accordion Drilldown -->
        ${isExpanded ? `
          <div class="drilldown-container mt-3 pt-3 border-t border-slate-200/70 space-y-1.5" onclick="event.stopPropagation()">
            <div class="flex items-center justify-between text-[11px] text-slate-500 px-1 pb-1">
              <span class="font-semibold">รายการในหมวดนี้ (${cat.transactions.length} รายการ):</span>
              <button type="button" onclick="toggleCategoryDrilldown('${cat.id}')" class="text-indigo-600 hover:underline text-[10px]">พับเก็บ</button>
            </div>
            ${drilldownRowsHtml}
          </div>
        ` : ''}
      </div>
    `;
  });

  listContainer.innerHTML = html;
}

function renderSummaryCharts(data) {
  // 1. Doughnut Chart: หมวดหมู่
  const donutCanvas = document.getElementById('summaryDonutChart');
  const donutEmpty = document.getElementById('summaryDonutEmptyNotice');

  if (donutCanvas) {
    if (data.rankedCategories.length === 0) {
      if (summaryDonutChartInstance) {
        summaryDonutChartInstance.destroy();
        summaryDonutChartInstance = null;
      }
      donutCanvas.classList.add('hidden');
      if (donutEmpty) donutEmpty.classList.remove('hidden');
    } else {
      donutCanvas.classList.remove('hidden');
      if (donutEmpty) donutEmpty.classList.add('hidden');

      const labels = data.rankedCategories.map(c => c.name);
      const chartData = data.rankedCategories.map(c => c.amount);
      const colors = data.rankedCategories.map(c => c.color);

      if (summaryDonutChartInstance) summaryDonutChartInstance.destroy();

      summaryDonutChartInstance = new Chart(donutCanvas, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: chartData,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10,
                font: { family: 'Prompt', size: 11 },
                padding: 10
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const val = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                  return ` ${context.label}: ฿${formatNumber(val)} (${pct}%)`;
                }
              }
            }
          },
          cutout: '62%'
        }
      });
    }
  }

  // 2. Daily Trend Bar Chart (1..daysInMonth)
  const dailyCanvas = document.getElementById('summaryDailyTrendChart');
  const dailyEmpty = document.getElementById('summaryDailyTrendEmptyNotice');

  if (dailyCanvas) {
    const hasAnyDailyExpense = Object.values(data.dailyExpenses).some(v => v > 0);
    if (!hasAnyDailyExpense) {
      if (summaryDailyTrendChartInstance) {
        summaryDailyTrendChartInstance.destroy();
        summaryDailyTrendChartInstance = null;
      }
      dailyCanvas.classList.add('hidden');
      if (dailyEmpty) dailyEmpty.classList.remove('hidden');
    } else {
      dailyCanvas.classList.remove('hidden');
      if (dailyEmpty) dailyEmpty.classList.add('hidden');

      const days = [];
      const amounts = [];
      for (let d = 1; d <= data.daysInMonth; d++) {
        days.push(`${d}`);
        amounts.push(data.dailyExpenses[d] || 0);
      }

      if (summaryDailyTrendChartInstance) summaryDailyTrendChartInstance.destroy();

      summaryDailyTrendChartInstance = new Chart(dailyCanvas, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            label: 'รายจ่ายรายวัน (฿)',
            data: amounts,
            backgroundColor: '#F43F5E',
            hoverBackgroundColor: '#E11D48',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => `วันที่ ${items[0].label} ${getThaiMonthLabel(data.yearMonthStr)}`,
                label: (ctx) => ` ยอดใช้จ่าย: ฿${formatNumber(ctx.raw)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (v) => '฿' + formatCompactNumber(v),
                font: { family: 'Prompt', size: 10 }
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                font: { family: 'Prompt', size: 9 },
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 16
              }
            }
          }
        }
      });
    }
  }
}

function renderSummaryPaymentMethods(data) {
  const container = document.getElementById('summaryPaymentMethodsContainer');
  if (!container) return;

  const entries = Object.entries(data.paymentMethodExpenses);
  const total = data.totalExpense;

  if (total === 0) {
    container.innerHTML = `
      <div class="text-center py-6 text-slate-400 text-xs">
        ไม่มีรายการใช้จ่ายในเดือนนี้
      </div>
    `;
    return;
  }

  // Sort by amount descending
  entries.sort((a, b) => b[1] - a[1]);

  let html = '';
  entries.forEach(([pmKey, amt]) => {
    const pm = PAYMENT_METHODS[pmKey] || { name: pmKey, icon: 'fa-wallet' };
    const pct = total > 0 ? ((amt / total) * 100).toFixed(1) : 0;
    html += `
      <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <i class="fa-solid ${pm.icon} text-slate-500 w-4 text-center"></i>
            <span class="font-medium text-slate-700">${pm.name}</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="font-bold text-slate-900">฿${formatNumber(amt)}</span>
            <span class="text-[11px] font-semibold text-slate-400">${pct}%</span>
          </div>
        </div>
        <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div class="bg-indigo-600 h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderSummaryTopTransactions(data) {
  const container = document.getElementById('summaryTopTransactionsContainer');
  if (!container) return;

  if (data.top5SingleExpenses.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 text-slate-400 text-xs">
        ไม่มีรายการรายจ่ายในเดือนนี้
      </div>
    `;
    return;
  }

  let html = '';
  data.top5SingleExpenses.forEach((tx, idx) => {
    const cat = getCategoryObj('expense', tx.category) || { name: tx.category, color: '#6366F1' };
    const pm = PAYMENT_METHODS[tx.paymentMethod] || { name: 'พร้อมเพย์' };

    html += `
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-colors text-xs">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-[11px] shrink-0 font-mono">
            #${idx + 1}
          </span>
          <div class="min-w-0">
            <div class="font-bold text-slate-800 truncate">${escapeHtml(tx.note || cat.name)}</div>
            <div class="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span>${formatThaiDate(tx.date)}</span>
              <span>•</span>
              <span class="px-1.5 py-0.2 rounded-md font-medium" style="background-color: ${cat.color}15; color: ${cat.color};">${cat.name}</span>
              <span>•</span>
              <span>${pm.name}</span>
            </div>
          </div>
        </div>
        <div class="font-black text-rose-600 text-sm shrink-0 pl-2">
          -฿${formatNumber(tx.amount)}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function handlePrintSummary() {
  document.body.classList.add('printing-summary');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('printing-summary');
  }, 1000);
}

// ==========================================================================
// Category Management & Modal
// ==========================================================================

function handleAddNewCategory() {
  const nameInput = document.getElementById('newCatName');
  const typeInput = document.getElementById('newCatType');
  const colorInput = document.getElementById('newCatColor');

  const name = nameInput.value.trim();
  const type = typeInput.value;
  const color = colorInput.value || '#6366F1';

  if (!name) {
    alert('กรุณากรอกชื่อหมวดหมู่');
    return;
  }

  const newCat = {
    id: 'custom_' + Date.now(),
    name,
    icon: type === 'income' ? 'fa-wallet' : 'fa-tag',
    color
  };

  state.categories[type].push(newCat);
  state.entryForm.selectedCategoryId = newCat.id;
  state.entryForm.type = type;

  saveToStorage();
  setEntryType(type);
  renderCategoryChips();
  
  nameInput.value = '';
  closeNewCategoryModal();
  showToast(`เพิ่มหมวดหมู่ "${name}" สำเร็จ`, 'success');
}

window.openNewCategoryModal = function() {
  const currentType = state.entryForm.type;
  document.getElementById('newCatType').value = currentType;
  document.getElementById('newCategoryModal').classList.remove('hidden');
  document.getElementById('newCatName').focus();
};

window.closeNewCategoryModal = function() {
  document.getElementById('newCategoryModal').classList.add('hidden');
};

// ==========================================================================
// Export & Backup
// ==========================================================================

function exportToCSV() {
  const filtered = getFilteredTransactions();
  if (filtered.length === 0) {
    alert('ไม่มีข้อมูลรายการในตัวกรองปัจจุบันที่จะส่งออก');
    return;
  }

  let csvContent = '\uFEFF';
  csvContent += 'รหัสรายการ,วันที่,เวลา,ประเภท,หมวดหมู่,จำนวนเงิน(บาท),วิธีชำระ,บันทึกช่วยจำ\n';

  filtered.forEach(tx => {
    const cat = getCategoryObj(tx.type, tx.category);
    const catName = cat ? cat.name : tx.category;
    const payment = PAYMENT_METHODS[tx.paymentMethod]?.name || tx.paymentMethod || '';
    const typeLabel = tx.type === 'income' ? 'รายรับ' : 'รายจ่าย';
    const noteClean = (tx.note || '').replace(/"/g, '""');

    csvContent += `"${tx.id}","${tx.date}","${tx.time || ''}","${typeLabel}","${catName}",${tx.amount},"${payment}","${noteClean}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `moneytracker_ledger_${formatDateToISO(new Date())}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('ส่งออกไฟล์ Excel/CSV สำเร็จ', 'success');
}

function exportToJSON() {
  const backupData = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    transactions: state.transactions,
    categories: state.categories
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `moneytracker_backup_${formatDateToISO(new Date())}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('สำรองข้อมูลเป็น JSON สำเร็จ', 'success');
}

function importFromJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);
      if (Array.isArray(data.transactions)) {
        state.transactions = data.transactions;
        if (data.categories) state.categories = data.categories;
        saveToStorage();
        renderCategoryChips();
        render();
        showToast('นำเข้าข้อมูลสำเร็จเรียบร้อย', 'success');
      } else {
        alert('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
      }
    } catch (err) {
      console.error(err);
      alert('ไฟล์ JSON ไม่ถูกต้อง');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ==========================================================================
// Helpers
// ==========================================================================

function getCategoryObj(type, catId) {
  const list = state.categories[type] || [];
  let found = list.find(c => c.id === catId);
  if (!found) {
    const otherType = type === 'income' ? 'expense' : 'income';
    found = (state.categories[otherType] || []).find(c => c.id === catId);
  }
  return found || { id: catId, name: catId, icon: 'fa-tag', color: '#64748B' };
}

function formatNumber(num) {
  if (isNaN(num)) return '0.00';
  return Number(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMoney(num) {
  const n = Number(num);
  if (isNaN(n)) return '฿0.00';
  if (n < 0) {
    return `-฿${formatNumber(Math.abs(n))}`;
  }
  return `฿${formatNumber(n)}`;
}

function formatCompactNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
}

function formatDateToISO(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatThaiDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  
  const year = parseInt(parts[0], 10) + 543;
  const month = thaiMonths[parseInt(parts[1], 10) - 1] || '';
  const day = parseInt(parts[2], 10);
  
  return `${day} ${month} ${year}`;
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}

function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-slate-800 text-white'
  };
  const icons = {
    success: 'fa-circle-check',
    error: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  toast.className = `${bgColors[type] || bgColors.info} px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in pointer-events-auto transition-all`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> <span>${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}

// ==========================================================================
// Keyboard Shortcuts & Modals
// ==========================================================================

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // If inside modal, handle Esc
    if (e.key === 'Escape') {
      closeDataManagementModal();
      closeShortcutsModal();
      closePresetModal();
      closeNewCategoryModal();
      closeGoogleSheetModal();
      if (state.entryForm.editingId) {
        cancelEditing();
      }
      return;
    }

    const activeEl = document.activeElement;
    const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');

    // Alt + 1..9: Select category chip
    if (e.altKey && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const idx = parseInt(e.key, 10) - 1;
      const categories = state.categories[state.entryForm.type] || [];
      if (categories[idx]) {
        selectCategory(categories[idx].id);
        playClickSound();
        showToast(`เลือกหมวด: ${categories[idx].name}`, 'info');
      }
      return;
    }

    // Alt + E: Switch to Expense
    if (e.altKey && (e.key === 'e' || e.key === 'E')) {
      e.preventDefault();
      setEntryType('expense');
      playClickSound();
      return;
    }

    // Alt + I: Switch to Income
    if (e.altKey && (e.key === 'i' || e.key === 'I')) {
      e.preventDefault();
      setEntryType('income');
      playClickSound();
      return;
    }

    // If typing in any input, do not trigger single letter shortcuts below
    if (isTyping) return;

    // '/' to search
    if (e.key === '/') {
      e.preventDefault();
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      return;
    }

    // 'm' or 'M' to toggle sound
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      toggleSound();
      return;
    }

    // '?' to open shortcuts modal
    if (e.key === '?') {
      e.preventDefault();
      openShortcutsModal();
      return;
    }
  });
}

window.openShortcutsModal = function() {
  document.getElementById('shortcutsModal')?.classList.remove('hidden');
};

window.closeShortcutsModal = function() {
  document.getElementById('shortcutsModal')?.classList.add('hidden');
};

// ==========================================================================
// Data Management Modal (Popup)
// ==========================================================================

window.openDataManagementModal = function() {
  const modal = document.getElementById('dataManagementModal');
  if (!modal) return;

  // Update transaction count summary
  const countEl = document.getElementById('dataModalTxCount');
  if (countEl) {
    const totalCount = (state.transactions && Array.isArray(state.transactions)) ? state.transactions.length : 0;
    countEl.textContent = `${totalCount.toLocaleString()} รายการ`;
  }

  // Update Google Sheet status in modal
  updateGoogleSheetUIStatus();

  modal.classList.remove('hidden');
};

window.closeDataManagementModal = function() {
  const modal = document.getElementById('dataManagementModal');
  if (modal) modal.classList.add('hidden');
};

// ==========================================================================
// Quick Presets Management & Modal
// ==========================================================================

window.openPresetModal = function() {
  renderModalPresetList();
  document.getElementById('presetModal')?.classList.remove('hidden');
};

window.closePresetModal = function() {
  document.getElementById('presetModal')?.classList.add('hidden');
};

function renderModalPresetList() {
  const container = document.getElementById('modalPresetList');
  if (!container) return;

  if (!state.presets || state.presets.length === 0) {
    container.innerHTML = '<div class="text-xs text-slate-400 py-3 text-center">ยังไม่มีรายการด่วน</div>';
    return;
  }

  container.innerHTML = state.presets.map(p => `
    <div class="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs">
      <div class="flex items-center gap-2">
        <span class="text-base">${p.icon || '⚡'}</span>
        <div>
          <span class="font-semibold text-slate-800">${escapeHtml(p.name)}</span>
          <span class="text-slate-400 text-[10px] ml-1">(${p.type === 'income' ? 'รายรับ' : 'รายจ่าย'})</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-bold text-slate-700">฿${formatNumber(p.amount)}</span>
        <button type="button" onclick="deletePreset('${p.id}')" class="text-slate-400 hover:text-rose-600 p-1 transition-colors" title="ลบรายการนี้">
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function handleAddNewPreset() {
  const nameInput = document.getElementById('newPresetName');
  const amountInput = document.getElementById('newPresetAmount');
  const typeInput = document.getElementById('newPresetType');
  const iconInput = document.getElementById('newPresetIcon');

  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value || 'expense';
  const icon = iconInput.value.trim() || '⚡';

  if (!name) {
    alert('กรุณากรอกชื่อรายการด่วน');
    nameInput.focus();
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert('กรุณากรอกยอดเงินที่ถูกต้อง');
    amountInput.focus();
    return;
  }

  const newPreset = {
    id: 'p_' + Date.now(),
    name,
    amount,
    type,
    category: type === 'income' ? 'salary' : 'food',
    icon,
    payment: 'promptpay'
  };

  state.presets.push(newPreset);
  saveToStorage();
  renderQuickPresets();
  renderModalPresetList();

  nameInput.value = '';
  amountInput.value = '';
  showToast(`เพิ่มรายการด่วน "${name}" สำเร็จ`, 'success');
}

function deletePreset(id) {
  state.presets = state.presets.filter(p => p.id !== id);
  saveToStorage();
  renderQuickPresets();
  renderModalPresetList();
  showToast('ลบรายการด่วนแล้ว', 'info');
}

// ==========================================================================
// Google Sheets Integration (Standard Columns A-G)
// ==========================================================================

const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * MoneyTracker - Google Apps Script Backend (Standard Columns A-G)
 */

function setupSheet(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = ['วัน-เวลา', 'ประเภท', 'รายการ', 'หมวดหมู่', 'จำนวนเงิน', 'ช่องทางชำระ', 'รหัสอ้างอิง'];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4F46E5');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    sheet.getRange('E:E').setNumberFormat('#,##0.00');
    sheet.getRange('E:E').setHorizontalAlignment('right');
    sheet.getRange('A:A').setHorizontalAlignment('center');
    sheet.getRange('B:B').setHorizontalAlignment('center');
  }
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'test';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  setupSheet(sheet);

  if (action === 'test') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'เชื่อมต่อกับ Google Sheet เรียบร้อยแล้ว',
      sheetTitle: ss.getName(),
      rowsCount: Math.max(0, sheet.getLastRow() - 1)
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'get_all') {
    var lastRow = sheet.getLastRow();
    var transactions = [];
    if (lastRow > 1) {
      var data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        if (row[0] !== '' || row[4] !== '') {
          var datePart = '', timePart = '';
          if (row[0] instanceof Date) {
            var y = row[0].getFullYear(), m = String(row[0].getMonth() + 1).padStart(2, '0'), d = String(row[0].getDate()).padStart(2, '0');
            var hh = String(row[0].getHours()).padStart(2, '0'), mm = String(row[0].getMinutes()).padStart(2, '0');
            datePart = y + '-' + m + '-' + d;
            timePart = hh + ':' + mm;
          } else {
            var parts = String(row[0]).split(' ');
            datePart = parts[0] || '';
            timePart = parts[1] || '12:00';
          }
          var typeVal = String(row[1]).includes('รับ') ? 'income' : 'expense';
          transactions.push({
            id: String(row[6] || ('gs_' + (i + 1))),
            date: datePart,
            time: timePart,
            type: typeVal,
            note: String(row[2] || ''),
            category: mapCategoryNameToId(String(row[3] || ''), typeVal),
            categoryName: String(row[3] || ''),
            amount: Number(row[4]) || 0,
            paymentMethod: mapPaymentTextToId(String(row[5] || '')),
            paymentText: String(row[5] || ''),
            createdAt: Date.now() - (lastRow - i) * 60000
          });
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', transactions: transactions })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'unknown_action' })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    setupSheet(sheet);
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || 'append';

    if (action === 'append') {
      var tx = payload.transaction;
      sheet.appendRow([
        tx.dateTime || (tx.date + ' ' + (tx.time || '00:00')),
        tx.typeText || (tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'),
        tx.note || '',
        tx.categoryName || tx.category || '',
        Number(tx.amount) || 0,
        tx.paymentText || tx.paymentMethod || '',
        tx.id || ''
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', id: tx.id, totalRows: sheet.getLastRow() - 1 })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'batch_sync') {
      var txList = payload.transactions || [];
      var lastRow = sheet.getLastRow();
      var existingIds = {};
      if (lastRow > 1) {
        var idValues = sheet.getRange(2, 7, lastRow - 1, 1).getValues();
        for (var i = 0; i < idValues.length; i++) {
          var val = String(idValues[i][0]).trim();
          if (val) existingIds[val] = true;
        }
      }
      var newRows = [];
      for (var j = 0; j < txList.length; j++) {
        var t = txList[j];
        if (!existingIds[t.id]) {
          newRows.push([
            t.dateTime || (t.date + ' ' + (t.time || '00:00')),
            t.typeText || (t.type === 'income' ? 'รายรับ' : 'รายจ่าย'),
            t.note || '',
            t.categoryName || t.category || '',
            Number(t.amount) || 0,
            t.paymentText || t.paymentMethod || '',
            t.id || ''
          ]);
        }
      }
      if (newRows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 7).setValues(newRows);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', addedCount: newRows.length, totalRows: sheet.getLastRow() - 1 })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'delete') {
      var delId = String(payload.id).trim();
      var lastR = sheet.getLastRow();
      var found = false;
      if (lastR > 1 && delId) {
        var ids = sheet.getRange(2, 7, lastR - 1, 1).getValues();
        for (var k = ids.length - 1; k >= 0; k--) {
          if (String(ids[k][0]).trim() === delId) {
            sheet.deleteRow(k + 2);
            found = true;
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', deleted: found })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function mapCategoryNameToId(name, type) {
  name = (name || '').toLowerCase();
  if (name.includes('ออม') || name.includes('ลงทุน')) return type === 'income' ? 'savings_withdrawal' : 'savings';
  if (name.includes('อาหาร') || name.includes('กิน') || name.includes('กาแฟ')) return 'food';
  if (name.includes('เดิน') || name.includes('น้ำมัน') || name.includes('รถ')) return 'transport';
  if (name.includes('ช้อป') || name.includes('ของใช้')) return 'shopping';
  if (name.includes('บ้าน') || name.includes('ห้อง') || name.includes('ไฟ') || name.includes('น้ำ')) return 'housing';
  if (name.includes('บันเทิง') || name.includes('เที่ยว') || name.includes('เกม')) return 'entertainment';
  if (name.includes('สุขภาพ') || name.includes('ยา') || name.includes('หมอ')) return 'health';
  if (name.includes('ศึกษา') || name.includes('เรียน')) return 'education';
  if (name.includes('ครอบครัว') || name.includes('พ่อ') || name.includes('แม่')) return 'family';
  if (name.includes('เดือน')) return 'salary';
  if (name.includes('เสริม') || name.includes('ฟรีแลนซ์')) return 'freelance';
  if (name.includes('ธุรกิจ') || name.includes('ค้าขาย')) return 'business';
  if (name.includes('โบนัส')) return 'bonus';
  return type === 'income' ? 'other_income' : 'other_expense';
}

function mapPaymentTextToId(text) {
  text = (text || '').toLowerCase();
  if (text.includes('สด')) return 'cash';
  if (text.includes('บัตร')) return 'credit_card';
  if (text.includes('wallet') || text.includes('เป๋า')) return 'wallet';
  if (text.includes('ธนาคาร')) return 'bank';
  return 'promptpay';
}`;

function openGoogleSheetModal() {
  const modal = document.getElementById('googleSheetModal');
  if (!modal) return;

  const urlInput = document.getElementById('gsheetUrlInput');
  const autoSyncToggle = document.getElementById('gsheetAutoSyncToggle');

  if (urlInput) urlInput.value = state.googleSheet.url || '';
  if (autoSyncToggle) autoSyncToggle.checked = state.googleSheet.autoSync !== false;

  updateGoogleSheetUIStatus();
  modal.classList.remove('hidden');
}

function closeGoogleSheetModal() {
  const modal = document.getElementById('googleSheetModal');
  if (modal) modal.classList.add('hidden');
}

function updateGoogleSheetUIStatus(overrideConnected = null, overrideTitle = null) {
  const isConnected = overrideConnected !== null ? overrideConnected : !!(state.googleSheet.url);
  const title = overrideTitle || state.googleSheet.sheetTitle || '';

  // Header dot
  const dot = document.getElementById('gsheetStatusDot');
  if (dot) {
    if (isConnected) {
      dot.classList.remove('hidden');
    } else {
      dot.classList.add('hidden');
    }
  }

  // Data Management Modal status badge
  const dataGsheetBadge = document.getElementById('dataModalGsheetStatus');
  if (dataGsheetBadge) {
    if (isConnected) {
      dataGsheetBadge.className = 'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800';
      dataGsheetBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>เชื่อมต่อชีตแล้ว</span>';
    } else {
      dataGsheetBadge.className = 'inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-600';
      dataGsheetBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-slate-400"></span><span>ยังไม่ได้เชื่อมต่อ</span>';
    }
  }

  // Modal Status Card
  const badge = document.getElementById('gsheetStatusBadge');
  const text = document.getElementById('gsheetStatusText');
  const titleEl = document.getElementById('gsheetSheetTitle');
  const lastSyncEl = document.getElementById('gsheetLastSyncLabel');

  if (badge && text) {
    if (isConnected) {
      badge.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-200';
      text.innerText = 'เชื่อมต่อแล้ว';
      text.className = 'text-xs font-semibold text-emerald-700';
    } else {
      badge.className = 'w-2.5 h-2.5 rounded-full bg-slate-400 inline-block';
      text.innerText = 'ยังไม่ได้เชื่อมต่อ';
      text.className = 'text-xs font-semibold text-slate-500';
    }
  }

  if (titleEl) {
    titleEl.innerText = title ? `ชีต: ${title}` : '';
  }

  if (lastSyncEl) {
    if (state.googleSheet.lastSync) {
      const d = new Date(state.googleSheet.lastSync);
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      lastSyncEl.innerText = `ซิงค์ล่าสุด: ${timeStr} น.`;
    } else {
      lastSyncEl.innerText = '';
    }
  }
}

function handleSaveGoogleSheetSettings() {
  const urlInput = document.getElementById('gsheetUrlInput');
  const autoSyncToggle = document.getElementById('gsheetAutoSyncToggle');

  const newUrl = urlInput ? urlInput.value.trim() : '';
  const newAutoSync = autoSyncToggle ? autoSyncToggle.checked : true;

  state.googleSheet.url = newUrl;
  state.googleSheet.autoSync = newAutoSync;

  saveToStorage();
  updateGoogleSheetUIStatus();
  showToast('บันทึกการตั้งค่า Google Sheets เรียบร้อยแล้ว', 'success');
  closeGoogleSheetModal();
}

async function testGoogleSheetConnection() {
  const urlInput = document.getElementById('gsheetUrlInput');
  const url = urlInput ? urlInput.value.trim() : state.googleSheet.url;
  if (!url) {
    showToast('กรุณาระบุ Web App URL ของ Google Apps Script', 'error');
    return;
  }

  const testBtn = document.getElementById('testGsheetBtn');
  if (testBtn) {
    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังทดสอบ...';
  }

  try {
    const testUrl = url + (url.includes('?') ? '&' : '?') + 'action=test&_t=' + Date.now();
    const res = await fetch(testUrl, { method: 'GET' });
    const data = await res.json();
    if (data && data.status === 'success') {
      state.googleSheet.sheetTitle = data.sheetTitle || 'Google Sheet';
      state.googleSheet.url = url;
      saveToStorage();
      updateGoogleSheetUIStatus(true, data.sheetTitle);
      showToast(`เชื่อมต่อสำเร็จ: "${data.sheetTitle}" (${data.rowsCount || 0} แถว)`, 'success');
    } else {
      throw new Error(data.message || 'ไม่สามารถเชื่อมต่อได้');
    }
  } catch (err) {
    console.error('Google Sheet test failed:', err);
    showToast('เชื่อมต่อไม่สำเร็จ: โปรดตรวจว่าตั้งสิทธิ์เป็น "ทุกคน (Anyone)" หรือยัง', 'error');
    updateGoogleSheetUIStatus(false);
  } finally {
    if (testBtn) {
      testBtn.disabled = false;
      testBtn.innerHTML = '<i class="fa-solid fa-plug text-slate-500"></i> ทดสอบเชื่อมต่อ';
    }
  }
}

function formatTransactionForSheet(tx) {
  const catObj = getCategoryObj(tx.type, tx.category);
  const paymentObj = PAYMENT_METHODS[tx.paymentMethod] || { name: tx.paymentMethod || 'พร้อมเพย์' };
  return {
    id: tx.id,
    dateTime: `${tx.date} ${tx.time || '12:00'}`,
    date: tx.date,
    time: tx.time || '12:00',
    type: tx.type,
    typeText: tx.type === 'income' ? 'รายรับ' : 'รายจ่าย',
    note: tx.note || catObj.name,
    category: tx.category,
    categoryName: catObj.name,
    amount: Number(tx.amount) || 0,
    paymentMethod: tx.paymentMethod || 'promptpay',
    paymentText: paymentObj.name
  };
}

async function syncSingleTransactionToSheet(tx) {
  if (!state.googleSheet.url || !state.googleSheet.autoSync) return;
  try {
    const payload = {
      action: 'append',
      transaction: formatTransactionForSheet(tx)
    };
    fetch(state.googleSheet.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(res => res.json()).then(data => {
      if (data && data.status === 'success') {
        state.googleSheet.lastSync = Date.now();
        updateGoogleSheetUIStatus();
        saveToStorage();
      }
    }).catch(err => {
      console.warn('Google Sheet background sync notice:', err);
    });
  } catch (e) {
    console.warn('Google Sheet sync error:', e);
  }
}

async function deleteFromGoogleSheet(id) {
  if (!state.googleSheet.url) return;
  try {
    fetch(state.googleSheet.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'delete', id: id })
    }).catch(err => console.warn('Google Sheet delete error:', err));
  } catch (e) {}
}

async function handleBatchUploadGoogleSheet() {
  if (!state.googleSheet.url) {
    showToast('กรุณาตั้งค่าและบันทึก URL ของ Google Sheets ก่อน', 'error');
    return;
  }
  if (!state.transactions || state.transactions.length === 0) {
    showToast('ไม่มีรายการบันทึกในเครื่องให้ส่งขึ้นชีต', 'info');
    return;
  }

  const uploadBtn = document.getElementById('uploadAllGsheetBtn');
  if (uploadBtn) {
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังส่ง...';
  }

  try {
    const formattedList = state.transactions.map(formatTransactionForSheet);
    const res = await fetch(state.googleSheet.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'batch_sync',
        transactions: formattedList
      })
    });
    const data = await res.json();
    if (data && data.status === 'success') {
      state.googleSheet.lastSync = Date.now();
      saveToStorage();
      updateGoogleSheetUIStatus();
      showToast(`ส่งข้อมูลขึ้นชีตสำเร็จ! (เพิ่มใหม่ ${data.addedCount || 0} รายการ, รวม ${data.totalRows || 0})`, 'success');
    } else {
      throw new Error(data.message || 'ไม่สำเร็จ');
    }
  } catch (err) {
    console.error('Batch upload error:', err);
    showToast('เกิดข้อผิดพลาดในการส่งข้อมูลขึ้น Google Sheet', 'error');
  } finally {
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up text-emerald-600"></i> ส่งข้อมูลขึ้นชีต';
    }
  }
}

async function handlePullFromGoogleSheet() {
  if (!state.googleSheet.url) {
    showToast('กรุณาตั้งค่าและบันทึก URL ของ Google Sheets ก่อน', 'error');
    return;
  }

  const pullBtn = document.getElementById('pullAllGsheetBtn');
  if (pullBtn) {
    pullBtn.disabled = true;
    pullBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังดึง...';
  }

  try {
    const getUrl = state.googleSheet.url + (state.googleSheet.url.includes('?') ? '&' : '?') + 'action=get_all&_t=' + Date.now();
    const res = await fetch(getUrl, { method: 'GET' });
    const data = await res.json();
    if (data && data.status === 'success' && Array.isArray(data.transactions)) {
      const pulledList = data.transactions;
      if (pulledList.length === 0) {
        showToast('ไม่พบรายการข้อมูลใน Google Sheet', 'info');
        return;
      }

      // ผสานข้อมูล (Merge) รายการใหม่เข้ากับรายการเดิมในเครื่อง
      const existingMap = new Map();
      state.transactions.forEach(t => existingMap.set(t.id, t));

      let newCount = 0;
      pulledList.forEach(item => {
        if (!existingMap.has(item.id)) {
          existingMap.set(item.id, item);
          newCount++;
        }
      });

      state.transactions = Array.from(existingMap.values()).sort((a, b) => {
        const dtA = `${a.date}T${a.time || '00:00'}`;
        const dtB = `${b.date}T${b.time || '00:00'}`;
        return dtB.localeCompare(dtA);
      });

      state.googleSheet.lastSync = Date.now();
      saveToStorage();
      render();
      updateGoogleSheetUIStatus();
      showToast(`ดึงข้อมูลสำเร็จ! พบ ${pulledList.length} รายการ (นำเข้าเพิ่ม ${newCount} รายการ)`, 'success');
    } else {
      throw new Error(data.message || 'ไม่สามารถดึงข้อมูลได้');
    }
  } catch (err) {
    console.error('Pull from sheet error:', err);
    showToast('เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Sheet', 'error');
  } finally {
    if (pullBtn) {
      pullBtn.disabled = false;
      pullBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down text-emerald-600"></i> ดึงข้อมูลจากชีต';
    }
  }
}

function handleCopyAppsScriptCode() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE).then(() => {
      showToast('คัดลอกโค้ด Google Apps Script เรียบร้อยแล้ว! นำไปวางในชีตได้เลย', 'success');
    }).catch(() => {
      fallbackCopyCode();
    });
  } else {
    fallbackCopyCode();
  }
}

function fallbackCopyCode() {
  const ta = document.createElement('textarea');
  ta.value = GOOGLE_APPS_SCRIPT_TEMPLATE;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('คัดลอกโค้ด Google Apps Script เรียบร้อยแล้ว!', 'success');
  } catch (e) {
    showToast('ไม่สามารถคัดลอกได้อัตโนมัติ กรุณาเปิดไฟล์ google_apps_script.js เพื่อคัดลอก', 'error');
  }
  document.body.removeChild(ta);
}

document.addEventListener('DOMContentLoaded', initApp);
