const fs = require('fs');
const path = require('path');

class FathApp {
    constructor() {
        this.dataFile = 'data.json';
        this.lockFile = 'data.lock';
        this.verses = this.initializeVerses();
    }

    // آیات سوره فتح (29 آیه کامل)
    initializeVerses() {
        return [
            {
                arabic: "إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا",
                persian: "همانا که ما برای تو فتح آشکاری گشودیم",
                english: "Indeed, We have given you a clear conquest"
            },
            {
                arabic: "لِّيَغْفِرَ لَكَ اللَّهُ مَا تَقَدَّمَ مِن ذَنبِكَ وَمَا تَأَخَّرَ وَيُتِمَّ نِعْمَتَهُ عَلَيْكَ وَيَهْدِيَكَ صِرَاطًا مُّسْتَقِيمًا",
                persian: "تا خداوند گناهان گذشته و آینده تو را بیامرزد و نعمت خود را بر تو تمام کند و تو را به راه راست هدایت نماید",
                english: "That Allah may forgive for you what preceded of your sin and what will follow and complete His favor upon you and guide you to a straight path"
            },
            {
                arabic: "وَيَنصُرَكَ اللَّهُ نَصْرًا عَزِيزًا",
                persian: "و خداوند تو را یاری کند یاری‌ای شکوهمند",
                english: "And that Allah may aid you with a mighty victory"
            },
            {
                arabic: "هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ لِيَزْدَادُوا إِيمَانًا مَّعَ إِيمَانِهِمْ ۗ وَلِلَّهِ جُنُودُ السَّمَاوَاتِ وَالْأَرْضِ ۚ وَكَانَ اللَّهُ عَلِيمًا حَكِيمًا",
                persian: "او کسی است که آرامش را در دل‌های مؤمنان فرو فرستاد تا بر ایمان خود ایمان بیفزایند و لشکرهای آسمان‌ها و زمین از آن خداست و خداوند دانا و حکیم است",
                english: "It is He who sent down tranquillity into the hearts of the believers that they would increase in faith along with their faith. And to Allah belong the soldiers of the heavens and the earth, and ever is Allah Knowing and Wise"
            },
            {
                arabic: "لِّيُدْخِلَ الْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا وَيُكَفِّرَ عَنْهُمْ سَيِّئَاتِهِمْ ۚ وَكَانَ ذَٰلِكَ عِندَ اللَّهِ فَوْزًا عَظِيمًا",
                persian: "تا مردان و زنان مؤمن را در باغ‌هایی وارد کند که نهرها از زیر آن جاری است و در آن جاودانه بمانند و بدی‌هایشان را بپوشاند و این نزد خداوند رستگاری بزرگ است",
                english: "That He may admit the believing men and believing women to gardens beneath which rivers flow to abide therein eternally and remove from them their misdeeds - and ever is that, in the sight of Allah, a great attainment"
            },
            {
                arabic: "وَيُعَذِّبَ الْمُنَافِقِينَ وَالْمُنَافِقَاتِ وَالْمُشْرِكِينَ وَالْمُشْرِكَاتِ الظَّانِّينَ بِاللَّهِ ظَنَّ السَّوْءِ ۚ عَلَيْهِمْ دَائِرَةُ السَّوْءِ ۖ وَغَضِبَ اللَّهُ عَلَيْهِمْ وَلَعَنَهُمْ وَأَعَدَّ لَهُمْ جَهَنَّمَ ۖ وَسَاءَتْ مَصِيرًا",
                persian: "و مردان و زنان منافق و مردان و زنان مشرک را که گمان بد به خدا می‌برند عذاب کند، دایره بدی بر آنان است و خداوند بر آنان خشمگین شده و آنان را لعنت کرده و جهنم را برایشان آماده ساخته و بد سرانجامی است",
                english: "And that He may punish the hypocrite men and hypocrite women and the men and women who associate others with Allah - those who assume about Allah an assumption of evil nature. Upon them is a misfortune of evil nature; and Allah has become angry with them and has cursed them and prepared for them Hell, and evil it is as a destination"
            },
            {
                arabic: "وَلِلَّهِ جُنُودُ السَّمَاوَاتِ وَالْأَرْضِ ۚ وَكَانَ اللَّهُ عَزِيزًا حَكِيمًا",
                persian: "و لشکرهای آسمان‌ها و زمین از آن خداست و خداوند توانا و حکیم است",
                english: "And to Allah belong the soldiers of the heavens and the earth. And ever is Allah Exalted in Might and Wise"
            },
            {
                arabic: "إِنَّا أَرْسَلْنَاكَ شَاهِدًا وَمُبَشِّرًا وَنَذِيرًا",
                persian: "همانا که ما تو را گواه و بشارت دهنده و بیم دهنده فرستادیم",
                english: "Indeed, We have sent you as a witness and a bringer of good tidings and a warner"
            },
            {
                arabic: "لِّتُؤْمِنُوا بِاللَّهِ وَرَسُولِهِ وَتُعَزِّرُوهُ وَتُوَقِّرُوهُ وَتُسَبِّحُوهُ بُكْرَةً وَأَصِيلًا",
                persian: "تا به خدا و پیامبرش ایمان آورید و او را یاری و تعظیم کنید و خدا را صبح و شام تسبیح گویید",
                english: "That you may believe in Allah and His Messenger and honor him and respect the Prophet and exalt Allah morning and afternoon"
            },
            {
                arabic: "إِنَّ الَّذِينَ يُبَايِعُونَكَ إِنَّمَا يُبَايِعُونَ اللَّهَ يَدُ اللَّهِ فَوْقَ أَيْدِيهِمْ ۚ فَمَن نَّكَثَ فَإِنَّمَا يَنكُثُ عَلَىٰ نَفْسِهِ ۖ وَمَنْ أَوْفَىٰ بِمَا عَاهَدَ عَلَيْهُ اللَّهَ فَسَيُؤْتِيهِ أَجْرًا عَظِيمًا",
                persian: "همانا کسانی که با تو بیعت می‌کنند در حقیقت با خدا بیعت می‌کنند، دست خدا بالای دست‌های آنان است، پس کسی که نقض کند تنها به زیان خود نقض می‌کند و کسی که به آنچه با خدا عهد بسته وفا کند خدا پاداش بزرگی به او خواهد داد",
                english: "Indeed, those who pledge allegiance to you - they are actually pledging allegiance to Allah. The hand of Allah is over their hands. So he who breaks his word only breaks it to the detriment of himself. And he who fulfills that which he has promised Allah - He will give him a great reward"
            },
            {
                arabic: "سَيَقُولُ لَكَ الْمُخَلَّفُونَ مِنَ الْأَعْرَابِ شَغَلَتْنَا أَمْوَالُنَا وَأَهْلُونَا فَاسْتَغْفِرْ لَنَا ۚ يَقُولُونَ بِأَلْسِنَتِهِم مَّا لَيْسَ فِي قُلُوبِهِمْ ۚ قُلْ فَمَن يَمْلِكُ لَكُم مِّنَ اللَّهِ شَيْئًا إِنْ أَرَادَ بِكُمْ ضَرًّا أَوْ أَرَادَ بِكُمْ نَفْعًا ۚ بَلْ كَانَ اللَّهُ بِمَا تَعْمَلُونَ خَبِيرًا",
                persian: "به زودی عرب‌های بادیه‌نشین که عقب ماندند به تو خواهند گفت: اموال و خانواده‌هایمان ما را مشغول کرد پس برای ما طلب آمرزش کن، آنان با زبان‌هایشان چیزی می‌گویند که در دل‌هایشان نیست، بگو: پس چه کسی در برابر خدا چیزی برای شما اختیار دارد اگر او برای شما ضرری بخواهد یا سودی بخواهد، بلکه خداوند به آنچه می‌کنید آگاه است",
                english: "Those who remained behind of the bedouins will say to you, 'Our properties and our families occupied us, so ask forgiveness for us.' They say with their tongues what is not in their hearts. Say, 'Then who could prevent Allah at all if He intended for you harm or intended for you benefit? Rather, ever is Allah, with what you do, Acquainted.'"
            },
            {
                arabic: "بَلْ ظَنَنتُمْ أَن لَّن يَنقَلِبَ الرَّسُولُ وَالْمُؤْمِنُونَ إِلَىٰ أَهْلِيهِمْ أَبَدًا وَزُيِّنَ ذَٰلِكَ فِي قُلُوبِكُمْ وَظَنَنتُمْ ظَنَّ السَّوْءِ وَكُنتُمْ قَوْمًا بُورًا",
                persian: "بلکه شما گمان کردید که پیامبر و مؤمنان هرگز به خانواده‌هایشان بازنخواهند گشت و این در دل‌هایتان زینت یافت و گمان بد بردید و قومی هلاک بودید",
                english: "But you thought that the Messenger and the believers would never return to their families, ever, and that was made pleasing in your hearts. And you assumed an assumption of evil, and you became a people ruined"
            },
            {
                arabic: "وَمَن لَّمْ يُؤْمِن بِاللَّهِ وَرَسُولِهِ فَإِنَّا أَعْتَدْنَا لِلْكَافِرِينَ سَعِيرًا",
                persian: "و کسی که به خدا و پیامبرش ایمان نیاورد پس ما برای کافران آتش سوزان آماده کرده‌ایم",
                english: "And whoever has not believed in Allah and His Messenger - then indeed, We have prepared for the disbelievers a blaze"
            },
            {
                arabic: "وَلِلَّهِ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ ۚ يَغْفِرُ لِمَن يَشَاءُ وَيُعَذِّبُ مَن يَشَاءُ ۚ وَكَانَ اللَّهُ غَفُورًا رَّحِيمًا",
                persian: "و فرمانروایی آسمان‌ها و زمین از آن خداست، هر که را بخواهد می‌آمرزد و هر که را بخواهد عذاب می‌کند و خداوند آمرزنده مهربان است",
                english: "And to Allah belongs the dominion of the heavens and the earth. He forgives whom He wills and punishes whom He wills. And ever is Allah Forgiving and Merciful"
            },
            {
                arabic: "سَيَقُولُ الْمُخَلَّفُونَ إِذَا انطَلَقْتُمْ إِلَىٰ مَغَانِمَ لِتَأْخُذُوهَا ذَرُونَا نَتَّبِعْكُمْ ۖ يُرِيدُونَ أَن يُبَدِّلُوا كَلَامَ اللَّهِ ۚ قُل لَّن تَتَّبِعُونَا كَذَٰلِكُمْ قَالَ اللَّهُ مِن قَبْلُ ۖ فَسَيَقُولُونَ بَلْ تَحْسُدُونَنَا ۚ بَلْ كَانُوا لَا يَفْقَهُونَ إِلَّا قَلِيلًا",
                persian: "عقب ماندگان خواهند گفت وقتی به سوی غنائمی که بگیرید حرکت کردید بگذارید ما هم شما را دنبال کنیم، می‌خواهند کلام خدا را تبدیل کنند، بگو: شما ما را دنبال نخواهید کرد، خداوند از پیش چنین گفته است، پس خواهند گفت: بلکه شما بر ما حسد می‌کنید، بلکه آنان جز اندکی نمی‌فهمیدند",
                english: "Those who remained behind will say when you set out toward the war booty to take it, 'Let us follow you.' They wish to change the words of Allah. Say, 'Never will you follow us. Thus did Allah say before.' So they will say, 'Rather, you envy us.' But they were not understanding except a little"
            },
            {
                arabic: "قُل لِّلْمُخَلَّفِينَ مِنَ الْأَعْرَابِ سَتُدْعَوْنَ إِلَىٰ قَوْمٍ أُولِي بَأْسٍ شَدِيدٍ تُقَاتِلُونَهُمْ أَوْ يُسْلِمُونَ ۖ فَإِن تُطِيعُوا يُؤْتِكُمُ اللَّهُ أَجْرًا حَسَنًا ۖ وَإِن تَتَوَلَّوْا كَمَا تَوَلَّيْتُم مِّن قَبْلُ يُعَذِّبْكُمْ عَذَابًا أَلِيمًا",
                persian: "به عقب ماندگان از اعراب بگو: به زودی شما را به سوی قومی دعوت خواهند کرد که دارای قدرت شدید هستند تا با آنان بجنگید یا اسلام آورند، پس اگر اطاعت کنید خداوند پاداش نیکی به شما خواهد داد و اگر سر بپیچید همان طور که از پیش سر پیچیدید خدا شما را عذاب دردناکی خواهد کرد",
                english: "Say to those who remained behind of the bedouins, 'You will be called to a people possessed of great military might; you will fight them, or they will submit. So if you obey, Allah will give you a good reward; but if you turn away as you turned away before, He will punish you with a painful punishment'"
            },
            {
                arabic: "لَّيْسَ عَلَى الْأَعْمَىٰ حَرَجٌ وَلَا عَلَى الْأَعْرَجِ حَرَجٌ وَلَا عَلَى الْمَرِيضِ حَرَجٌ ۗ وَمَن يُطِعِ اللَّهَ وَرَسُولَهُ يُدْخِلْهُ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ ۖ وَمَن يَتَوَلَّ يُعَذِّبْهُ عَذَابًا أَلِيمًا",
                persian: "بر نابینا حرجی نیست و بر شل حرجی نیست و بر بیمار حرجی نیست و کسی که خدا و پیامبرش را اطاعت کند خدا او را در باغ‌هایی وارد می‌کند که نهرها از زیر آن جاری است و کسی که سر بپیچد خدا او را عذاب دردناکی خواهد کرد",
                english: "There is not upon the blind any guilt or upon the lame any guilt or upon the ill any guilt. And whoever obeys Allah and His Messenger - He will admit him to gardens beneath which rivers flow; but whoever turns away - He will punish him with a painful punishment"
            },
            {
                arabic: "لَّقَدْ رَضِيَ اللَّهُ عَنِ الْمُؤْمِنِينَ إِذْ يُبَايِعُونَكَ تَحْتَ الشَّجَرَةِ فَعَلِمَ مَا فِي قُلُوبِهِمْ فَأَنزَلَ السَّكِينَةَ عَلَيْهِمْ وَأَثَابَهُمْ فَتْحًا قَرِيبًا",
                persian: "همانا خداوند از مؤمنان راضی شد هنگامی که زیر درخت با تو بیعت می‌کردند پس آنچه در دل‌هایشان بود دانست و آرامش را بر آنان فرو فرستاد و فتح نزدیکی به آنان پاداش داد",
                english: "Certainly was Allah pleased with the believers when they pledged allegiance to you under the tree, and He knew what was in their hearts, so He sent down tranquillity upon them and rewarded them with an imminent conquest"
            },
            {
                arabic: "وَمَغَانِمَ كَثِيرَةً يَأْخُذُونَهَا ۗ وَكَانَ اللَّهُ عَزِيزًا حَكِيمًا",
                persian: "و غنائم بسیاری که آن را خواهند گرفت و خداوند توانا و حکیم است",
                english: "And much war booty which they will take. And ever is Allah Exalted in Might and Wise"
            },
            {
                arabic: "وَعَدَكُمُ اللَّهُ مَغَانِمَ كَثِيرَةً تَأْخُذُونَهَا فَعَجَّلَ لَكُمْ هَٰذِهِ وَكَفَّ أَيْدِيَ النَّاسِ عَنكُمْ وَلِتَكُونَ آيَةً لِّلْمُؤْمِنِينَ وَيَهْدِيَكُمْ صِرَاطًا مُّسْتَقِيمًا",
                persian: "خداوند غنائم بسیاری را که خواهید گرفت به شما وعده داد پس این را برای شما تعجیل فرمود و دست‌های مردم را از شما باز داشت و تا نشانه‌ای برای مؤمنان باشد و شما را به راه راست هدایت کند",
                english: "Allah has promised you much booty that you will take and has hastened for you this and withheld the hands of people from you - that it may be a sign for the believers and that He may guide you to a straight path"
            },
            {
                arabic: "وَأُخْرَىٰ لَمْ تَقْدِرُوا عَلَيْهَا قَدْ أَحَاطَ اللَّهُ بِهَا ۚ وَكَانَ اللَّهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرًا",
                persian: "و دیگری که بر آن قدرت نداشتید خداوند آن را احاطه کرده است و خداوند بر همه چیز توانا است",
                english: "And [He promises] other [victories] that you were [so far] unable to [realize] which Allah has already encompassed. And ever is Allah, over all things, competent"
            },
            {
                arabic: "وَلَوْ قَاتَلَكُمُ الَّذِينَ كَفَرُوا لَوَلَّوُا الْأَدْبَارَ ثُمَّ لَا يَجِدُونَ وَلِيًّا وَلَا نَصِيرًا",
                persian: "و اگر کسانی که کافر شدند با شما جنگ می‌کردند قطعاً پشت کرده فرار می‌کردند سپس یاور و یاری‌گری نمی‌یافتند",
                english: "And if those who disbelieve had fought you, they would have turned their backs; then they would not find a protector or a helper"
            },
            {
                arabic: "سُنَّةَ اللَّهِ الَّتِي قَدْ خَلَتْ مِن قَبْلُ ۖ وَلَن تَجِدَ لِسُنَّةِ اللَّهِ تَبْدِيلًا",
                persian: "سنت خدایی که از پیش گذشته است و برای سنت خداوند تبدیلی نخواهی یافت",
                english: "[This is] the established way of Allah which has occurred before. And never will you find in the way of Allah any change"
            },
            {
                arabic: "وَهُوَ الَّذِي كَفَّ أَيْدِيَهُمْ عَنكُمْ وَأَيْدِيَكُمْ عَنْهُم بِبَطْنِ مَكَّةَ مِن بَعْدِ أَنْ أَظْفَرَكُمْ عَلَيْهِمْ ۚ وَكَانَ اللَّهُ بِمَا تَعْمَلُونَ بَصِيرًا",
                persian: "و او کسی است که دست‌های آنان را از شما و دست‌های شما را از آنان در درون مکه باز داشت بعد از آن که شما را بر آنان پیروز گردانید و خداوند به آنچه می‌کنید بیناست",
                english: "And it is He who withheld their hands from you and your hands from them within [the area of] Makkah after He caused you to overcome them. And ever is Allah of what you do, Seeing"
            },
            {
                arabic: "هُمُ الَّذِينَ كَفَرُوا وَصَدُّوكُمْ عَنِ الْمَسْجِدِ الْحَرَامِ وَالْهَدْيَ مَعْكُوفًا أَن يَبْلُغَ مَحِلَّهُ ۚ وَلَوْلَا رِجَالٌ مُّؤْمِنُونَ وَنِسَاءٌ مُّؤْمِنَاتٌ لَّمْ تَعْلَمُوهُمْ أَن تَطَئُوهُمْ فَتُصِيبَكُم مِّنْهُم مَّعَرَّةٌ بِغَيْرِ عِلْمٍ ۖ لِّيُدْخِلَ اللَّهُ فِي رَحْمَتِهِ مَن يَشَاءُ ۚ لَوْ تَزَيَّلُوا لَعَذَّبْنَا الَّذِينَ كَفَرُوا مِنْهُمْ عَذَابًا أَلِيمًا",
                persian: "آنان کسانی هستند که کافر شدند و شما را از مسجد الحرام باز داشتند و قربانی را که باز داشته شده بود تا به محل خود برسد و اگر مردان مؤمن و زنان مؤمنی نبودند که آنان را نمی‌شناختید تا آنان را پایمال کنید و از آنان بلایی بدون علم به شما برسد، تا خداوند هر که را بخواهد در رحمت خود وارد کند، اگر آنان جدا می‌شدند قطعاً کسانی را از آنان که کافر شدند عذاب دردناکی می‌کردیم",
                english: "They are the ones who disbelieved and obstructed you from al-Masjid al-Haram and prevented the sacrificial animals from reaching their place of sacrifice. And if not for believing men and believing women whom you did not know - that you might trample them and there would befall you because of them dishonor without knowledge - [you would have been permitted to enter Makkah]. [This was so] that Allah might admit to His mercy whom He willed. If they had been apart [from them], We would have punished those who disbelieved among them with painful punishment"
            },
            {
                arabic: "إِذْ جَعَلَ الَّذِينَ كَفَرُوا فِي قُلُوبِهِمُ الْحَمِيَّةَ حَمِيَّةَ الْجَاهِلِيَّةِ فَأَنزَلَ اللَّهُ سَكِينَتَهُ عَلَىٰ رَسُولِهِ وَعَلَى الْمُؤْمِنِينَ وَأَلْزَمَهُمْ كَلِمَةَ التَّقْوَىٰ وَكَانُوا أَحَقَّ بِهَا وَأَهْلَهَا ۚ وَكَانَ اللَّهُ بِكُلِّ شَيْءٍ عَلِيمًا",
                persian: "آن هنگام که کسانی که کافر شدند در دل‌هایشان تعصب، تعصب جاهلیت قرار دادند پس خداوند آرامش خود را بر پیامبرش و بر مؤمنان فرو فرستاد و آنان را ملزم به کلمه تقوا کرد و آنان سزاوارتر و اهل آن بودند و خداوند به همه چیز داناست",
                english: "When those who disbelieved had put into their hearts chauvinism - the chauvinism of the time of ignorance. But Allah sent down His tranquillity upon His Messenger and upon the believers and imposed upon them the word of righteousness, and they were more deserving of it and worthy of it. And ever is Allah, of all things, Knowing"
            },
            {
                arabic: "لَّقَدْ صَدَقَ اللَّهُ رَسُولَهُ الرُّؤْيَا بِالْحَقِّ ۖ لَتَدْخُلُنَّ الْمَسْجِدَ الْحَرَامَ إِن شَاءَ اللَّهُ آمِنِينَ مُحَلِّقِينَ رُءُوسَكُمْ وَمُقَصِّرِينَ لَا تَخَافُونَ ۖ فَعَلِمَ مَا لَمْ تَعْلَمُوا فَجَعَلَ مِن دُونِ ذَٰلِكَ فَتْحًا قَرِيبًا",
                persian: "همانا خداوند خواب پیامبرش را به حق راست کرد، اگر خدا بخواهد قطعاً به مسجد الحرام وارد خواهید شد در امان، سرهایتان را تراشیده و کوتاه کرده، نمی‌ترسید، پس آنچه شما نمی‌دانستید دانست و پیش از آن فتح نزدیکی قرار داد",
                english: "Certainly has Allah showed to His Messenger the vision in truth. You will surely enter al-Masjid al-Haram, if Allah wills, in safety, with your heads shaved and [hair] shortened, not fearing [anyone]. He knew what you did not know and has arranged before that a conquest near [at hand]"
            },
            {
                arabic: "هُوَ الَّذِي أَرْسَلَ رَسُولَهُ بِالْهُدَىٰ وَدِينِ الْحَقِّ لِيُظْهِرَهُ عَلَى الدِّينِ كُلِّهِ ۚ وَكَفَىٰ بِاللَّهِ شَهِيدًا",
                persian: "او کسی است که پیامبرش را با هدایت و دین حق فرستاد تا آن را بر همه ادیان پیروز گرداند و خداوند به عنوان گواه کافی است",
                english: "It is He who sent His Messenger with guidance and the religion of truth to manifest it over all religion. And sufficient is Allah as Witness"
            },
            {
                arabic: "مُّحَمَّدٌ رَّسُولُ اللَّهِ ۚ وَالَّذِينَ مَعَهُ أَشِدَّاءُ عَلَى الْكُفَّارِ رُحَمَاءُ بَيْنَهُمْ ۖ تَرَاهُمْ رُكَّعًا سُجَّدًا يَبْتَغُونَ فَضْلًا مِّنَ اللَّهِ وَرِضْوَانًا ۖ سِيمَاهُمْ فِي وُجُوهِهِم مِّنْ أَثَرِ السُّجُودِ ۚ ذَٰلِكَ مَثَلُهُمْ فِي التَّوْرَاةِ ۚ وَمَثَلُهُمْ فِي الْإِنجِيلِ كَزَرْعٍ أَخْرَجَ شَطْأَهُ فَآزَرَهُ فَاسْتَغْلَظَ فَاسْتَوَىٰ عَلَىٰ سُوقِهِ يُعْجِبُ الزُّرَّاعَ لِيَغِيظَ بِهِمُ الْكُفَّارَ ۗ وَعَدَ اللَّهُ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ مِنْهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا",
                persian: "محمد پیامبر خداست و کسانی که با او هستند بر کافران سخت و در میان خودشان مهربان هستند، آنان را می‌بینی که رکوع و سجود می‌کنند و فضل و خشنودی خدا را می‌جویند، نشانه‌شان در چهره‌هایشان از اثر سجود است، این مثل آنان در تورات است و مثل آنان در انجیل مانند زراعتی است که جوانه‌اش را بیرون آورد سپس آن را تقویت کرد پس ستبر شد و بر ساقه خود ایستاد که کشاورزان را به شگفتی آورد تا کافران را از آنان به خشم آورد، خداوند کسانی از آنان را که ایمان آوردند و کارهای شایسته کردند آمرزش و پاداش بزرگی وعده داده است",
                english: "Muhammad is the Messenger of Allah; and those with him are forceful against the disbelievers, merciful among themselves. You see them bowing and prostrating, seeking bounty from Allah and [His] pleasure. Their mark is on their faces from the trace of prostration. That is their description in the Torah. And their description in the Gospel is as a plant which produces its offshoots and strengthens them so they grow firm and stand upon their stalks, delighting the sowers - so that Allah may enrage by them the disbelievers. Allah has promised those who believe and do righteous deeds among them forgiveness and a great reward"
            }
        ];
    }

    // تاریخ امروز
    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    // خواندن داده‌ها از فایل
    loadData() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = fs.readFileSync(this.dataFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.log('خطا در خوندن فایل:', error.message);
        }
        
        return this.getDefaultData();
    }

    // داده‌های پیش‌فرض
    getDefaultData() {
        return {
            currentVerse: 0,
            totalCompletions: 0,
            totalVerses: 0,
            userVerses: {},
            lastUpdate: new Date().toISOString(),
            dailyStats: {
                date: this.getTodayDate(),
                completions: 0,
                verses: 0
            }
        };
    }

    // بررسی و آپدیت آمار روزانه
    updateDailyStats(data) {
        const today = this.getTodayDate();
        
        if (!data.dailyStats || data.dailyStats.date !== today) {
            data.dailyStats = {
                date: today,
                completions: 0,
                verses: 0
            };
        }
    }

    // ذخیره داده‌ها
    saveData(data) {
        try {
            data.lastUpdate = new Date().toISOString();
            fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.log('خطا در ذخیره فایل:', error.message);
            return false;
        }
    }

    // قفل فایل
    lockFileSystem() {
        let attempts = 0;
        while (fs.existsSync(this.lockFile) && attempts < 50) {
            const start = Date.now();
            while (Date.now() - start < 100) { /* انتظار */ }
            attempts++;
        }
        
        if (attempts >= 50) {
            throw new Error('نمی‌تونم فایل رو قفل کنم');
        }
        
        fs.writeFileSync(this.lockFile, process.pid.toString());
    }

    // آزاد کردن قفل
    unlockFileSystem() {
        try {
            if (fs.existsSync(this.lockFile)) {
                fs.unlinkSync(this.lockFile);
            }
        } catch (error) {
            console.log('خطا در آزاد کردن قفل:', error.message);
        }
    }

    // گرفتن آیه بعدی (Thread-Safe)
    getNextVerse(chatId = null) {
        try {
            this.lockFileSystem();
            
            const data = this.loadData();
            this.updateDailyStats(data);
            
            // اطمینان از وجود ساختار کامل
            if (!data.userVerses) data.userVerses = {};
            if (!data.totalVerses) data.totalVerses = 0;
            
            // آیه فعلی
            const currentVerse = this.verses[data.currentVerse];
            const currentVerseNumber = data.currentVerse + 1;
            
            // آپدیت داده‌ها
            data.currentVerse++;
            data.totalVerses++;
            data.dailyStats.verses++;
            
            // آپدیت آیات کاربر
            if (chatId) {
                if (!data.userVerses[chatId]) {
                    data.userVerses[chatId] = 0;
                }
                data.userVerses[chatId]++;
            }
            
            let isCompleted = false;
            let completionMessage = '';
            
            // بررسی ختم
            if (data.currentVerse >= this.verses.length) {
                data.currentVerse = 0;
                data.totalCompletions++;
                data.dailyStats.completions++;
                isCompleted = true;
                completionMessage = `🎉 ختم شماره ${data.totalCompletions} تکمیل شد!`;
            }
            
            this.saveData(data);
            this.unlockFileSystem();
            
            return {
                success: true,
                verse: {
                    number: currentVerseNumber,
                    arabic: currentVerse.arabic,
                    persian: currentVerse.persian,
                    english: currentVerse.english
                },
                stats: {
                    totalCompletions: data.totalCompletions,
                    totalVerses: data.totalVerses,
                    userVerses: chatId ? (data.userVerses[chatId] || 0) : 0,
                    nextVerse: data.currentVerse + 1,
                    progress: Math.round((data.currentVerse / this.verses.length) * 100),
                    daily: {
                        date: data.dailyStats.date,
                        completions: data.dailyStats.completions,
                        verses: data.dailyStats.verses
                    }
                },
                completed: isCompleted,
                completionMessage: completionMessage
            };
            
        } catch (error) {
            this.unlockFileSystem();
            return {
                success: false,
                error: error.message
            };
        }
    }

    // فرمت پیام
    formatMessage(result) {
        if (!result.success) {
            return `❌ خطا: ${result.error}`;
        }
        
        let message = `🌹 آیه ${result.verse.number}\n\n`;
        message += `${result.verse.arabic}\n\n`;
        message += `📖 ترجمه فارسی:\n${result.verse.persian}\n\n`;
        message += `🌍 English Translation:\n${result.verse.english}\n\n`;
        message += `👤 آیات قرائت شده توسط شما: ${result.stats.userVerses}\n\n`;
        
        if (result.completed) {
            message += `${result.completionMessage}\n`;
            message += `🔄 ختم جدید شروع شد!\n\n`;
        }
        
        return message;
    }

    // گرفتن آمار بدون حرکت آیه
    getStats(chatId = null) {
        const data = this.loadData();
        this.updateDailyStats(data);
        
        if (!data.userVerses) data.userVerses = {};
        if (!data.totalVerses) data.totalVerses = 0;
        
        return {
            totalCompletions: data.totalCompletions,
            totalVerses: data.totalVerses,
            userVerses: chatId ? (data.userVerses[chatId] || 0) : 0,
            currentVerse: data.currentVerse + 1,
            progress: Math.round((data.currentVerse / this.verses.length) * 100),
            daily: {
                date: data.dailyStats.date,
                completions: data.dailyStats.completions,
                verses: data.dailyStats.verses
            }
        };
    }

    // نمایش آمار تفصیلی
    showDetailedStats() {
        const data = this.loadData();
        this.updateDailyStats(data);
        
        console.log('📊 آمار تفصیلی سوره فتح:');
        console.log('=====================================');
        console.log(`📅 تاریخ امروز: ${data.dailyStats.date}`);
        console.log(`🌹 آیه فعلی: ${data.currentVerse + 1} از ${this.verses.length}`);
        console.log(`📈 پیشرفت: ${Math.round((data.currentVerse / this.verses.length) * 100)}%`);
        console.log('');
        console.log('📊 آمار کلی:');
        console.log(`   ✅ ختم‌های کامل: ${data.totalCompletions}`);
        console.log(`   📚 کل آیات خوانده شده: ${data.totalVerses}`);
        console.log('');
        console.log('📅 آمار امروز:');
        console.log(`   🔄 ختم‌های کامل شده: ${data.dailyStats.completions}`);
        console.log(`   📖 آیات خوانده شده: ${data.dailyStats.verses}`);
        console.log('');
        console.log(`📝 آخرین به‌روزرسانی: ${data.lastUpdate}`);
        console.log('=====================================');
    }

    // نمایش وضعیت فعلی
    showCurrentStatus() {
        const data = this.loadData();
        this.updateDailyStats(data);
        
        console.log('🌹 بات سوره فتح آماده است!');
        console.log('📊 وضعیت فعلی:');
        console.log(`   نمایش آیه: ${data.currentVerse + 1}`);
        console.log(`   ختم‌های کامل: ${data.totalCompletions}`);
        console.log(`   آیات امروز: ${data.dailyStats.verses}`);
        console.log(`   ختم‌های امروز: ${data.dailyStats.completions}`);
        console.log(`   آخرین به‌روزرسانی: ${data.lastUpdate}`);
        console.log('');
    }

    // تست سیستم
    testSystem() {
        console.log('=== تست سیستم ===');
        const testChatId = '12345';
        
        for (let i = 1; i <= 3; i++) {
            console.log(`\n--- درخواست ${i} ---`);
            const result = this.getNextVerse(testChatId);
            console.log(this.formatMessage(result));
        }
    }
}

// ایجاد instance واحد
const fathApp = new FathApp();

// اجرای اصلی برای تست
if (require.main === module) {
    fathApp.showCurrentStatus();
    
    if (process.argv.includes('--test')) {
        fathApp.testSystem();
    } else if (process.argv.includes('--stats')) {
        fathApp.showDetailedStats();
    } else {
        console.log('--- آیه بعدی ---');
        const result = fathApp.getNextVerse('test_user');
        console.log(fathApp.formatMessage(result));
    }
}

// صادرات
module.exports = {
    getNextVerse: (chatId) => fathApp.getNextVerse(chatId),
    getStats: (chatId) => fathApp.getStats(chatId),
    formatMessage: (result) => fathApp.formatMessage(result),
    showCurrentStatus: () => fathApp.showCurrentStatus(),
    showDetailedStats: () => fathApp.showDetailedStats(),
    verses: fathApp.verses,
    loadData: () => fathApp.loadData(),
    getTodayDate: () => fathApp.getTodayDate()
};