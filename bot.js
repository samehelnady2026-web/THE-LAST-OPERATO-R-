const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

// مفاتيح الربط الخاصة بك
const token = '8919743612:AAHKnaSAFaGnUZ56UfkChNwjfLylIN0z_uo';
const supabaseUrl = 'https://arntndfgzfxnbvttzjzj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnRuZGZnemZ4bmJ2dHR6anpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNTgwNjMsImV4cCI6MjA5NzczNDA2M30.RvOPtVjDgExgWCnAAIclGueOU7A0_3wwXa2L_9rg_Zc';

const bot = new TelegramBot(token, { polling: true });
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_ID = "5812257142"; // معرف الآدمن الخاص بك لحمايته من المتطفلين

console.log("🚀 بوت التحكم اليدوي بالرصيد يعمل الآن وجاهز لاستقبال أوامرك...");

bot.on('message', async (msg) => {
    const chatId = msg.chat.id.toString();
    const text = msg.text ? msg.text.trim() : '';

    // التحقق من أن المرسل هو أنت (الآدمن) فقط
    if (chatId !== ADMIN_ID) return;

    // 1. أمر الشحن اليدوي (كوينز أو كاش)
    if (text.startsWith('شحن')) {
        // تقسيم النص: شحن [النوع] [الـ ID] [المبلغ]
        const parts = text.split(' ');
        if (parts.length < 4) {
            return bot.sendMessage(ADMIN_ID, "⚠️ صيغة خاطئة! استخدم:\n`شحن كوينز [ID] [المبلغ]`\nأو\n`شحن كاش [ID] [المبلغ]`", { parse_mode: 'Markdown' });
        }

        const type = parts[1]; // كوينز أو كاش
        const playerId = parts[2]; // ID اللاعب
        const amount = parseInt(parts[3]); // المبلغ

        if (isNaN(amount) || amount <= 0) {
            return bot.sendMessage(ADMIN_ID, "❌ يرجى كتابة مبلغ صحيح أكبر من الصفر.");
        }

        // جلب بيانات اللاعب الحالية
        let { data: player, error: fetchError } = await supabase.from('players').select('*').eq('id', playerId).single();
        if (fetchError || !player) {
            return bot.sendMessage(ADMIN_ID, `❌ لم يتم العثور على لاعب بهذا الـ ID: ${playerId}`);
        }

        let updateData = {};
        let historyName = "";

        if (type === 'كوينز') {
            updateData.coins = (player.coins || 0) + amount;
            historyName = `✅ شحن يدوي: +${amount.toLocaleString()} كوينز`;
        } else if (type === 'كاش') {
            updateData.cash = (player.cash || 0) + amount;
            historyName = `✅ شحن يدوي: +${amount.toLocaleString()} كاش`;
        } else {
            return bot.sendMessage(ADMIN_ID, "❌ النوع غير معروف! اكتب 'كوينز' أو 'كاش'.");
        }

        // تحديث سجل العمليات ليظهر عند اللاعب في الحساب
        let updatedHistory = player.purchase_history || [];
        updatedHistory.unshift({
            name: historyName,
            date: new Date().toLocaleString('ar-EG'),
            cost: "عملية إدارية"
        });
        updateData.purchase_history = updatedHistory;

        // حفظ التعديل في سوبابيز
        const { error: updateError } = await supabase.from('players').update(updateData).eq('id', playerId);
        if (updateError) return bot.sendMessage(ADMIN_ID, "❌ فشل تحديث البيانات في قاعدة البيانات.");

        return bot.sendMessage(ADMIN_ID, `🚀 **تم الشحن بنجاح!**\n👤 اللاعب: ${player.email || 'ضيف'}\n🆔 الـ ID: \`${playerId}\`\n💰 الرصيد الجديد تم إرساله لحظياً للاعب.`);
    }

    // 2. أمر الخصم / السحب اليدوي (كوينز أو كاش)
    if (text.startsWith('خصم')) {
        const parts = text.split(' ');
        if (parts.length < 4) {
            return bot.sendMessage(ADMIN_ID, "⚠️ صيغة خاطئة! استخدم:\n`خصم كوينز [ID] [المبلغ]`\nأو\n`خصم كاش [ID] [المبلغ]`", { parse_mode: 'Markdown' });
        }

        const type = parts[1];
        const playerId = parts[2];
        const amount = parseInt(parts[3]);

        if (isNaN(amount) || amount <= 0) return bot.sendMessage(ADMIN_ID, "❌ يرجى كتابة مبلغ صحيح.");

        let { data: player, error: fetchError } = await supabase.from('players').select('*').eq('id', playerId).single();
        if (fetchError || !player) return bot.sendMessage(ADMIN_ID, `❌ لم يتم العثور على لاعب بهذا الـ ID.`);

        let updateData = {};
        let historyName = "";

        if (type === 'كوينز') {
            if ((player.coins || 0) < amount) return bot.sendMessage(ADMIN_ID, `❌ رصيد كوينز اللاعب الحالي (${player.coins}) أقل من المبلغ المراد خصمه!`);
            updateData.coins = player.coins - amount;
            historyName = `🛑 سحب يدوي: -${amount.toLocaleString()} كوينز`;
        } else if (type === 'كاش') {
            if ((player.cash || 0) < amount) return bot.sendMessage(ADMIN_ID, `❌ رصيد كاش اللاعب الحالي (${player.cash}) أقل من المبلغ المراد خصمه!`);
            updateData.cash = player.cash - amount;
            historyName = `🛑 سحب يدوي: -${amount.toLocaleString()} كاش`;
        } else {
            return bot.sendMessage(ADMIN_ID, "❌ النوع غير معروف! اكتب 'كوينز' أو 'كاش'.");
        }

        let updatedHistory = player.purchase_history || [];
        updatedHistory.unshift({
            name: historyName,
            date: new Date().toLocaleString('ar-EG'),
            cost: "عملية إدارية"
        });
        updateData.purchase_history = updatedHistory;

        const { error: updateError } = await supabase.from('players').update(updateData).eq('id', playerId);
        if (updateError) return bot.sendMessage(ADMIN_ID, "❌ فشل تحديث البيانات.");

        return bot.sendMessage(ADMIN_ID, `📉 **تم الخصم/السحب بنجاح!**\n🆔 الـ ID: \`${playerId}\`\nتحدثت شاشة اللاعب الآن تلقائياً.`);
    }
});
