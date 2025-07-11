const TelegramBot = require('node-telegram-bot-api');
const { getNextVerse, getStats, formatMessage } = require('./app');
const fs = require('fs');
require('dotenv').config();

class FathBot {
    constructor() {
        this.token = process.env.TELEGRAM_BOT_TOKEN;
        this.polling = process.env.TELEGRAM_POLLING === 'true';
        this.bot = new TelegramBot(this.token, { polling: this.polling });
        this.remindersFile = 'reminders.json';
        this.activeTimers = new Map();
        
        this.initializeBot();
        this.loadExistingReminders();
        this.showStartupStats();
    }

    // تنظیمات اولیه بات
    initializeBot() {
        this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
        this.bot.onText(/\/stats/, (msg) => this.handleDetailedStats(msg));
        this.bot.on('message', (msg) => this.handleMessage(msg));
        this.bot.on('error', (error) => this.handleError(error));
        this.bot.on('polling_error', (error) => this.handlePollingError(error));
        
        console.log('🤖 بات تلگرام شروع شد...');
    }

    // کیبورد اصلی
    get mainKeyboard() {
        return {
            keyboard: [
                ['📖 نمایش آیه', '📊 آمار کلی'],
                ['❓ راهنما', '⏰ تنظیم یادآوری']
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        };
    }

    // مدیریت دستور /start
    handleStart(msg) {
        const chatId = msg.chat.id;
        const userName = msg.from.first_name || 'کاربر';
        
        console.log(`کاربر جدید: ${userName} (${chatId})`);
        
        const welcomeText = `
🌹 سلام ${userName} عزیز!

به بات ختم جمعی سوره فتح خوش آمدید

🎯 با این بات می‌توانید:
📖 در ختم جمعی سوره فتح شرکت کنید
📊 آمار کلی و روزانه ختم‌ها را مشاهده کنید  
⏰ یادآوری روزانه تنظیم کنید

💪 به امید فتح و پیروزی`;
        
        this.bot.sendMessage(chatId, welcomeText, {
            reply_markup: this.mainKeyboard
        });
    }

    // مدیریت پیام‌های عادی
    handleMessage(msg) {
        const chatId = msg.chat.id;
        const text = msg.text;
        const userName = msg.from.first_name || 'کاربر';
        
        // نادیده گرفتن دستورات
        if (text.startsWith('/')) return;
        
        switch (text) {
            case '📖 نمایش آیه':
                this.handleVerseRequest(chatId, userName);
                break;
            case '📊 آمار کلی':
                this.handleStatsRequest(chatId);
                break;
            case '⏰ تنظیم یادآوری':
                this.handleReminderSetup(chatId);
                break;
            case '❓ راهنما':
                this.handleHelpRequest(chatId);
                break;
            // default:
                // this.handleUnknownCommand(chatId);
        }
    }

    // درخواست نمایش آیه
    handleVerseRequest(chatId, userName) {
        console.log(`درخواست آیه از: ${userName} (${chatId})`);
        
        const result = getNextVerse(chatId);
        const message = formatMessage(result);
        
        this.bot.sendMessage(chatId, message, {
            reply_markup: this.mainKeyboard
        });
    }

    // درخواست آمار
    handleStatsRequest(chatId) {
        const stats = getStats(chatId);
        const statsText = this.formatTotalStats(stats);
        
        this.bot.sendMessage(chatId, statsText, {
            reply_markup: this.mainKeyboard
        });
    }

    // تنظیم یادآوری
    handleReminderSetup(chatId) {
        const currentReminder = this.getReminderStatus(chatId);
        let reminderText = `⏰ تنظیم یادآوری روزانه\n\n`;
        
        if (currentReminder && currentReminder.active) {
            reminderText += `📅 یادآوری فعلی: ${currentReminder.hours.toString().padStart(2, '0')}:${currentReminder.minutes.toString().padStart(2, '0')}\n\n`;
        }
        
        reminderText += `لطفاً ساعت مورد نظر را به فرمت زیر ارسال کنید:\n`;
        reminderText += `مثال: 08:30 یا 20:15 (به انگلیسی وارد کنید)\n\n`;
        reminderText += `⚠️ از ساعت 00:00 تا 23:59 استفاده کنید\n`;
        reminderText += `💡 برای خاموش کردن یادآوری، "خاموش" بفرستید`;
        
        this.bot.sendMessage(chatId, reminderText);
        
        // منتظر پاسخ کاربر
        this.waitForTimeInput(chatId);
    }

    // منتظر ماندن برای دریافت ساعت
    waitForTimeInput(chatId) {
        // پاک کردن listener های قبلی برای این chatId
        this.bot.removeAllListeners(`waitingForTime_${chatId}`);
        
        const messageHandler = (timeMsg) => {
            if (timeMsg.chat.id !== chatId) return;
            
            const userInput = timeMsg.text.trim();
            
            // بررسی دستور خاموش کردن
            if (this.isDisableCommand(userInput)) {
                this.bot.removeListener('message', messageHandler);
                this.handleDisableReminder(chatId);
                return;
            }
            
            // بررسی فرمت ساعت
            const timePattern = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
            const timeMatch = userInput.match(timePattern);
            
            if (timeMatch) {
                this.bot.removeListener('message', messageHandler);
                const hours = parseInt(timeMatch[1]);
                const minutes = parseInt(timeMatch[2]);
                this.handleSetReminder(chatId, hours, minutes);
            } else {
                this.bot.removeListener('message', messageHandler);
                this.handleInvalidTimeFormat(chatId);
            }
        };
        
        this.bot.on('message', messageHandler);
        
        // حذف خودکار بعد از 5 دقیقه (اختیاری)
        setTimeout(() => {
            this.bot.removeListener('message', messageHandler);
        }, 5 * 60 * 1000);
    }

    // بررسی دستور خاموش کردن
    isDisableCommand(text) {
        const disableCommands = ['خاموش', 'خاموش کن', 'غیرفعال', 'off', 'disable'];
        return disableCommands.includes(text.toLowerCase());
    }

    // خاموش کردن یادآوری
    handleDisableReminder(chatId) {
        const disabled = this.disableReminder(chatId);
        if (disabled) {
            this.bot.sendMessage(chatId, 
                `❌ یادآوری خاموش شد!\n\nدیگر پیام یادآوری دریافت نخواهید کرد.`, 
                { reply_markup: this.mainKeyboard }
            );
        } else {
            this.bot.sendMessage(chatId, 
                `⚠️ هیچ یادآوری فعالی پیدا نشد!`, 
                { reply_markup: this.mainKeyboard }
            );
        }
    }

    // تنظیم یادآوری جدید
    handleSetReminder(chatId, hours, minutes) {
        const currentReminder = this.getReminderStatus(chatId);
        const hadPreviousReminder = currentReminder && currentReminder.active;
        
        this.setReminder(chatId, hours, minutes);
        
        let message = `✅ یادآوری روزانه تنظیم شد!\n\n`;
        message += `⏰ ساعت: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}\n\n`;
        
        if (hadPreviousReminder) {
            message += `📝 یادآوری قبلی (${currentReminder.hours.toString().padStart(2, '0')}:${currentReminder.minutes.toString().padStart(2, '0')}) جایگزین شد.\n\n`;
        }
        
        message += `هر روز در این ساعت پیام یادآوری دریافت خواهید کرد.\n\n`;
        message += `💡 برای خاموش کردن: دوباره این دکمه را بزنید و "خاموش" بفرستید.`;
        
        this.bot.sendMessage(chatId, message, {
            reply_markup: this.mainKeyboard
        });
    }

    // پاسخ به فرمت نامعتبر ساعت
    handleInvalidTimeFormat(chatId) {
        const errorMessage = `
❌ فرمت ساعت اشتباه است!

لطفاً به فرمت صحیح ارسال کنید (به انگلیسی وارد کنید):
مثال: 08:30 یا 20:15

💡 برای خاموش کردن: "خاموش" بفرستید`;
        
        this.bot.sendMessage(chatId, errorMessage, {
            reply_markup: this.mainKeyboard
        });
    }

    // راهنما
    handleHelpRequest(chatId) {
        const helpText = `
🌹 راهنمای بات ختم سوره فتح

📖 نمایش آیه:
هر بار کلیک کنید، آیه بعدی از سوره فتح دریافت می‌کنید

📊 آمار کلی:
نمایش کل ختم‌های کامل شده توسط همه کاربران

⏰ تنظیم یادآوری:
تنظیم یادآوری روزانه برای تلاوت آیه

🎯 هدف:
شرکت در ختم جمعی سوره مبارک فتح و کسب برکات آن

💪 به امید فتح و پیروزی`;
        
        this.bot.sendMessage(chatId, helpText, {
            reply_markup: this.mainKeyboard
        });
    }

    // پیام پیش‌فرض
    // handleUnknownCommand(chatId) {
    //     this.bot.sendMessage(chatId, '🌹 لطفاً از دکمه‌های زیر استفاده کنید:', {
    //         reply_markup: this.mainKeyboard
    //     });
    // }

    // آمار تفصیلی
    handleDetailedStats(msg) {
        const chatId = msg.chat.id;
        const stats = getStats(chatId);
        
        const detailedStats = `
📊 آمار تفصیلی ختم سوره فتح

════════════════════════
📅 تاریخ امروز: ${stats.daily.date}
🌹 آیه فعلی: ${stats.currentVerse} از 29
📈 پیشرفت: ${stats.progress}%

🏆 آمار کلی:
✅ ختم‌های کامل: ${stats.totalCompletions}
📚 کل آیات خوانده شده: ${stats.totalVerses}

📅 آمار امروز:
🔄 ختم‌های کامل شده: ${stats.daily.completions}
📖 آیات خوانده شده: ${stats.daily.verses}

👤 آمار شخصی شما:
📖 آیات خوانده شده: ${stats.userVerses}

════════════════════════
🤲 برای سلامتی و تعجیل در فرج امام زمان صلوات`;
        
        this.bot.sendMessage(chatId, detailedStats, {
            reply_markup: this.mainKeyboard
        });
    }

    // فرمت آمار کلی
    formatTotalStats(stats) {
        const today = new Date().toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        
        return `
📊 آمار کلی ختم سوره فتح

✅ ختم‌های کامل: ${stats.totalCompletions}
📚 کل آیات خوانده شده: ${stats.totalVerses}
👤 آیات خوانده شده توسط شما: ${stats.userVerses}
📖 آیه فعلی: ${stats.currentVerse} از 29
📈 پیشرفت ختم جاری: ${stats.progress}%

📅 آمار امروز - ${today}
🔄 ختم‌های امروز: ${stats.daily.completions}
📖 آیات امروز: ${stats.daily.verses}

🌍 این آمار مربوط به همه کاربران است
🤲 برای سلامتی و تعجیل در فرج امام زمان صلوات`;
    }

    // === مدیریت یادآوری‌ها ===

    loadReminders() {
        try {
            if (fs.existsSync(this.remindersFile)) {
                const data = fs.readFileSync(this.remindersFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.log('خطا در خوندن یادآوری‌ها:', error.message);
        }
        return {};
    }

    saveReminders(reminders) {
        try {
            fs.writeFileSync(this.remindersFile, JSON.stringify(reminders, null, 2));
            return true;
        } catch (error) {
            console.log('خطا در ذخیره یادآوری‌ها:', error.message);
            return false;
        }
    }

    sendReminder(chatId) {
        const reminderText = `
🔔 یادآوری ختم سوره فتح

🌹 وقت تلاوت سوره فتح رسیده!
📖 برای دریافت آیه، روی دکمه "نمایش آیه" کلیک کنید:`;
        
        this.bot.sendMessage(chatId, reminderText, {
            reply_markup: this.mainKeyboard
        });
    }

    setReminder(chatId, hours, minutes) {
        // پاک کردن timer قبلی اگر وجود دارد
        this.clearExistingTimer(chatId);
        
        const reminders = this.loadReminders();
        
        reminders[chatId] = {
            hours: hours,
            minutes: minutes,
            active: true,
            setDate: new Date().toISOString()
        };
        
        this.saveReminders(reminders);
        
        // محاسبه و تنظیم timer جدید
        this.setupNewTimer(chatId, hours, minutes);
        
        console.log(`✅ یادآوری برای ${chatId} تنظیم شد: ${hours}:${minutes}`);
        
        return new Date();
    }

    clearExistingTimer(chatId) {
        if (this.activeTimers.has(chatId)) {
            const timers = this.activeTimers.get(chatId);
            if (timers.timeout) clearTimeout(timers.timeout);
            if (timers.interval) clearInterval(timers.interval);
            this.activeTimers.delete(chatId);
        }
    }

    setupNewTimer(chatId, hours, minutes) {
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        // اگر زمان گذشته، برای فردا تنظیم کن
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        // تنظیم timer اولیه
        const timeout = setTimeout(() => {
            this.sendReminder(chatId);
            
            // تنظیم timer روزانه
            const interval = setInterval(() => {
                this.sendReminder(chatId);
            }, 24 * 60 * 60 * 1000);
            
            this.activeTimers.set(chatId, { timeout: null, interval: interval });
        }, timeUntilReminder);
        
        this.activeTimers.set(chatId, { timeout: timeout, interval: null });
    }

    disableReminder(chatId) {
        this.clearExistingTimer(chatId);
        
        const reminders = this.loadReminders();
        if (reminders[chatId]) {
            reminders[chatId].active = false;
            this.saveReminders(reminders);
            return true;
        }
        return false;
    }

    getReminderStatus(chatId) {
        const reminders = this.loadReminders();
        return reminders[chatId] || null;
    }

    loadExistingReminders() {
        const reminders = this.loadReminders();
        let loadedCount = 0;
        
        Object.keys(reminders).forEach(chatId => {
            const reminder = reminders[chatId];
            if (reminder.active && !this.activeTimers.has(chatId)) {
                this.setupNewTimer(chatId, reminder.hours, reminder.minutes);
                loadedCount++;
                console.log(`✅ یادآوری برای ${chatId} بارگذاری شد: ${reminder.hours}:${reminder.minutes}`);
            }
        });
        
        console.log(`📱 ${loadedCount} یادآوری بارگذاری شد`);
    }

    showStartupStats() {
        const stats = getStats();
        console.log('📊 آمار فعلی بات:');
        console.log(`   🏆 ختم‌های کامل: ${stats.totalCompletions}`);
        console.log(`   📚 کل آیات: ${stats.totalVerses}`);
        console.log(`   📅 آیات امروز: ${stats.daily.verses}`);
        console.log(`   🔄 ختم‌های امروز: ${stats.daily.completions}`);
        console.log(`   🌹 آیه فعلی: ${stats.currentVerse}/29`);
        console.log('');
    }

    handleError(error) {
        console.log('خطای بات:', error.message);
    }

    handlePollingError(error) {
        console.log('خطای polling:', error.message);
    }
}

// راه‌اندازی بات
const fathBot = new FathBot();

console.log('✅ بات آماده دریافت پیام است!');