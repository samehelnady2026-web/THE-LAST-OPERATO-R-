/**
 * إعدادات الاتصال وقاعدة البيانات
 * لا تقم بتغيير أسماء الثوابت لضمان عمل باقي الملفات بشكل صحيح
 */

const CONFIG = {
    SB_URL: 'https://arntndfgzfxnbvttzjzj.supabase.co',
    SB_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnRuZGZnemZ4bmJ2dHR6anpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNTgwNjMsImV4cCI6MjA5NzczNDA2M30.RvOPtVjDgExgWCnAAIclGueOU7A0_3wwXa2L_9rg_Zc',
    BOT_TOKEN: '8919743612:AAHKnaSAFaGnUZ56UfkChNwjfLylIN0z_uo',
    CHAT_ID: '-1003614080639',
    GAME_NAME: 'OPERATOR'
};

// تهيئة عميل Supabase لاستخدامه في باقي الملفات
const supabase = supabase.createClient(CONFIG.SB_URL, CONFIG.SB_KEY);

console.log("Configuration Loaded: " + CONFIG.GAME_NAME);
