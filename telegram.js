const TelegramBot = require('node-telegram-bot-api');
const { getNextVerse, getStats, formatMessage } = require('./app');
const fs = require('fs');

// خوندن تنظیمات از config.json
let config;
try {
    config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
} catch (error) {
    console.error('❌ خطا در خوندن config.json:', error.message);
    console.log('💡 لطفاً فایل config.json را بسازید');
    process.exit(1);
}

const token = config.telegram.token;

if (!token || token === 'توکن_بات_تلگرام_اینجا_بذار') {
    console.error('❌ توکن تلگرام در config.json تنظیم نشده است');
    process.exit(1);
}

// ساخت بات
const bot = new TelegramBot(token, { polling: config.telegram.polling });

// کیبورد اصلی
const mainKeyboard = {
    keyboard: [
        ['📖 آیه بعدی', '📊 آمار ختم جمعی'],
        ['⏰ تنظیم یادآوری', '❓ راهنما']
    ],
    resize_keyboard: true,
    one_time_keyboard: false
};

// فایل ذخیره یادآوری ها
const remindersFile = 'reminders.json';

// خوندن یادآوری ها
function loadReminders() {
    try {
        if (fs.existsSync(remindersFile)) {
            const data = fs.readFileSync(remindersFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.log('خطا در خوندن یادآوری ها:', error.message);
    }
    return {};
}

// ذخیره یادآوری ها
function saveReminders(reminders) {
    try {
        fs.writeFileSync(remindersFile, JSON.stringify(reminders, null, 2));
        return true;
    } catch (error) {
        console.log('خطا در ذخیره یادآوری ها:', error.message);
        return false;
    }
}

// ارسال یادآوری به کاربر
function sendReminder(chatId) {
    const reminderText = `
🔔 یادآوری ختم سوره فتح

🌹 وقت تلاوت آیه بعدی رسیده!
📖 برای دریافت آیه، روی دکمه زیر کلیک کنید:
    `;
    
    bot.sendMessage(chatId, reminderText, {
        reply_markup: mainKeyboard
    });
}

// تنظیم یادآوری (Thread-Safe)
function setReminder(chatId, hours, minutes) {
    // اگه timer قبلی وجود داره، پاکش کن
    if (activeTimers.has(chatId)) {
        const oldTimers = activeTimers.get(chatId);
        if (oldTimers.timeout) clearTimeout(oldTimers.timeout);
        if (oldTimers.interval) clearInterval(oldTimers.interval);
        activeTimers.delete(chatId);
    }
    
    const reminders = loadReminders();
    
    reminders[chatId] = {
        hours: hours,
        minutes: minutes,
        active: true,
        setDate: new Date().toISOString()
    };
    
    saveReminders(reminders);
    
    // محاسبه زمان باقی مانده
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    // اگه زمان گذشته، برای فردا تنظیم کن
    if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    // تنظیم timer جدید
    const timeout = setTimeout(() => {
        sendReminder(chatId);
        
        // تنظیم یادآوری روزانه
        const interval = setInterval(() => {
            sendReminder(chatId);
        }, 24 * 60 * 60 * 1000); // هر 24 ساعت
        
        // آپدیت Map
        activeTimers.set(chatId, { timeout: null, interval: interval });
        
    }, timeUntilReminder);
    
    // ذخیره timer در Map
    activeTimers.set(chatId, { timeout: timeout, interval: null });
    
    console.log(`✅ یادآوری برای ${chatId} تنظیم شد: ${hours}:${minutes}`);
    
    return reminderTime;
}

// خاموش کردن یادآوری
function disableReminder(chatId) {
    // پاک کردن timer های فعال
    if (activeTimers.has(chatId)) {
        const timers = activeTimers.get(chatId);
        if (timers.timeout) clearTimeout(timers.timeout);
        if (timers.interval) clearInterval(timers.interval);
        activeTimers.delete(chatId);
    }
    
    // آپدیت فایل
    const reminders = loadReminders();
    if (reminders[chatId]) {
        reminders[chatId].active = false;
        saveReminders(reminders);
        return true;
    }
    return false;
}

// چک کردن وضعیت یادآوری
function getReminderStatus(chatId) {
    const reminders = loadReminders();
    return reminders[chatId] || null;
}

console.log('🤖 بات تلگرام شروع شد...');

// پاسخ به دستور /start
// پاسخ به دستور /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'کاربر';
    
    console.log(`کاربر جدید: ${userName} (${chatId})`);
    
    const welcomeText = `
🌹 سلام ${userName} عزیز!

به بات ختم جمعی سوره فتح خوش آمدید

🎯 با این بات می‌توانید:
📖 در ختم جمعی سوره فتح شرکت کنید
📊 آمار کلی ختم‌ها را مشاهده کنید  
⏰ یادآوری روزانه تنظیم کنید

🤲 برکت این سوره مبارک شامل حال همگی باد
    `;
    
    bot.sendMessage(chatId, welcomeText, {
        reply_markup: mainKeyboard
    });
});

// مدیریت پیام‌های کیبورد
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userName = msg.from.first_name || 'کاربر';
    
    if (text.startsWith('/')) return; // دستورات رو نادیده بگیر
    
    switch (text) {
        case '📖 آیه بعدی':
            console.log(`درخواست آیه از: ${userName} (${chatId})`);
            
            const result = getNextVerse(chatId);
            const message = formatMessage(result);
            
            bot.sendMessage(chatId, message, {
                reply_markup: mainKeyboard
            });
            break;
            
        case '📊 آمار ختم جمعی':
            const stats = getStats(chatId);
            
            const statsText = `
📊 آمار کلی ختم سوره فتح

✅ ختم‌های کامل: ${stats.totalCompletions}
📚 کل آیات خوانده شده: ${stats.totalVerses}
👤 آیات خوانده شده توسط شما: ${stats.userVerses}
📖 آیه فعلی: ${stats.currentVerse} از 29
📈 پیشرفت ختم جاری: ${stats.progress}%

🌍 این آمار مربوط به همه کاربران است
🤲 ما را در دعای خیر یاد کنید
            `;
            
            bot.sendMessage(chatId, statsText, {
                reply_markup: mainKeyboard
            });
            break;
            
        case '⏰ تنظیم یادآوری':
            const currentReminder = getReminderStatus(chatId);
            let reminderText = `⏰ تنظیم یادآوری روزانه\n\n`;
            
            if (currentReminder && currentReminder.active) {
                reminderText += `📅 یادآوری فعلی: ${currentReminder.hours.toString().padStart(2, '0')}:${currentReminder.minutes.toString().padStart(2, '0')}\n\n`;
            }
            
            reminderText += `لطفاً ساعت مورد نظر را به فرمت زیر ارسال کنید:\n`;
            reminderText += `مثال: 08:30 یا 20:15\n\n`;
            reminderText += `⚠️ از ساعت 00:00 تا 23:59 استفاده کنید\n`;
            reminderText += `💡 برای خاموش کردن یادآوری، "خاموش" بفرستید`;
            
            bot.sendMessage(chatId, reminderText);
            
            // منتظر ساعت از کاربر
            bot.once('message', (timeMsg) => {
                if (timeMsg.chat.id === chatId) {
                    
                    // چک کردن دستور خاموش
                    if (timeMsg.text === 'خاموش' || timeMsg.text === 'خاموش کن' || timeMsg.text === 'غیرفعال') {
                        const disabled = disableReminder(chatId);
                        if (disabled) {
                            bot.sendMessage(chatId, `❌ یادآوری خاموش شد!\n\nدیگر پیام یادآوری دریافت نخواهید کرد.`, {
                                reply_markup: mainKeyboard
                            });
                        } else {
                            bot.sendMessage(chatId, `⚠️ هیچ یادآوری فعالی پیدا نشد!`, {
                                reply_markup: mainKeyboard
                            });
                        }
                        return;
                    }
                    
                    const timePattern = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
                    const timeMatch = timeMsg.text.match(timePattern);
                    
                    if (timeMatch) {
                        const hours = parseInt(timeMatch[1]);
                        const minutes = parseInt(timeMatch[2]);
                        
                        const reminderTime = setReminder(chatId, hours, minutes);
                        
                        bot.sendMessage(chatId, `
✅ یادآوری روزانه تنظیم شد!

⏰ ساعت: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}
📅 شروع: از فردا

هر روز در این ساعت پیام یادآوری دریافت خواهید کرد.

💡 برای خاموش کردن: دوباره این دکمه را بزنید و "خاموش" بفرستید.
                        `, {
                            reply_markup: mainKeyboard
                        });
                    } else {
                        bot.sendMessage(chatId, `
❌ فرمت ساعت اشتباه است!

لطفاً به فرمت صحیح ارسال کنید:
مثال: 08:30 یا 20:15

💡 برای خاموش کردن: "خاموش" بفرستید
                        `, {
                            reply_markup: mainKeyboard
                        });
                    }
                }
            });
            break;
            
        case '❓ راهنما':
            const helpText = `
🌹 راهنمای بات ختم سوره فتح

📖 آیه بعدی:
هر بار کلیک کنید، آیه بعدی از سوره فتح دریافت می‌کنید

📊 آمار ختم جمعی:
نمایش تعداد ختم‌های کامل شده توسط همه کاربران

⏰ تنظیم یادآوری:
تنظیم یادآوری روزانه برای تلاوت آیه

🎯 هدف:
شرکت در ختم جمعی سوره مبارک فتح و کسب برکات آن

🤲 برکت سوره فتح شامل حال همگی باد
            `;
            
            bot.sendMessage(chatId, helpText, {
                reply_markup: mainKeyboard
            });
            break;
            
        default:
            bot.sendMessage(chatId, '🌹 لطفاً از دکمه‌های زیر استفاده کنید:', {
                reply_markup: mainKeyboard
            });
    }
});

// بارگذاری یادآوری های موجود هنگام شروع (Thread-Safe)
function loadExistingReminders() {
    const reminders = loadReminders();
    const now = new Date();
    let loadedCount = 0;
    
    Object.keys(reminders).forEach(chatId => {
        const reminder = reminders[chatId];
        if (reminder.active) {
            // اگه قبلاً timer وجود داره، نساز
            if (activeTimers.has(chatId)) {
                console.log(`⚠️ Timer برای ${chatId} قبلاً وجود دارد`);
                return;
            }
            
            const reminderTime = new Date();
            reminderTime.setHours(reminder.hours, reminder.minutes, 0, 0);
            
            // اگه زمان گذشته، برای فردا تنظیم کن
            if (reminderTime <= now) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }
            
            const timeUntilReminder = reminderTime.getTime() - now.getTime();
            
            const timeout = setTimeout(() => {
                sendReminder(parseInt(chatId));
                
                const interval = setInterval(() => {
                    sendReminder(parseInt(chatId));
                }, 24 * 60 * 60 * 1000);
                
                // آپدیت Map
                activeTimers.set(chatId, { timeout: null, interval: interval });
                
            }, timeUntilReminder);
            
            // ذخیره timer در Map
            activeTimers.set(chatId, { timeout: timeout, interval: null });
            
            loadedCount++;
            console.log(`✅ یادآوری برای ${chatId} بارگذاری شد: ${reminder.hours}:${reminder.minutes}`);
        }
    });
    
    console.log(`📱 ${loadedCount} یادآوری بارگذاری شد`);
}

// مدیریت خطاها
bot.on('error', (error) => {
    console.log('خطای بات:', error.message);
});

bot.on('polling_error', (error) => {
    console.log('خطای polling:', error.message);
});

// بارگذاری یادآوری های موجود
loadExistingReminders();

console.log('✅ بات آماده دریافت پیام است!');