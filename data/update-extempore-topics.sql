-- Extempore Friday: give each person two simple, funny topics to pick from (English + Tamil; Bengali for Sarat).
-- Sarat's second language is Bengali instead of Tamil (stored in the same content_ta column). Safe to re-run. Only changes assignment text; claims and device locks are untouched. Expect: UPDATE 17.

UPDATE assignments a
SET content = t.en, content_ta = t.ta
FROM participants p, (VALUES
  ('aarthi.k@sharepointdesigns.com',
   $en$Pick one topic:
- My cat thinks she is my boss.
- My phone is smarter than me.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- என் பூனை தன்னை என் பாஸ் என்று நினைக்கிறது.
- என் போன் என்னை விட புத்திசாலி.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('agalya@sharepointdesigns.com',
   $en$Pick one topic:
- A crow stole my lunch today.
- Why does my alarm hate me?

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- இன்று ஒரு காகம் என் மதிய உணவை திருடிவிட்டது.
- என் அலாரம் ஏன் என்னை வெறுக்கிறது?

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('ajith@sharepointdesigns.com',
   $en$Pick one topic:
- I went to buy milk and came back with a goat.
- My bike has a mind of its own.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- பால் வாங்கப் போய் ஒரு ஆட்டுடன் திரும்பி வந்தேன்.
- என் பைக்குக்கு சொந்தமாக ஒரு மனம் இருக்கிறது.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('anish@sharepointdesigns.com',
   $en$Pick one topic:
- I became a superhero by mistake.
- The day my shoes ran away.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- நான் தவறுதலாக சூப்பர் ஹீரோ ஆனேன்.
- என் செருப்பு ஓடிப்போன நாள்.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('bharath.r@sharepointdesigns.com',
   $en$Pick one topic:
- My mom knows everything before I tell her.
- I lost my keys, and they were in my hand.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- நான் சொல்வதற்கு முன்பே என் அம்மாவுக்கு எல்லாம் தெரியும்.
- என் சாவியைத் தொலைத்தேன், அது என் கையிலேயே இருந்தது.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('chipui@sharepointdesigns.com',
   $en$Pick one topic:
- My dog took my job at the office.
- I was the boss for one day, and it went badly.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- என் நாய் ஆபிஸில் என் வேலையை எடுத்துக்கொண்டது.
- ஒரு நாள் நான் பாஸ் ஆனேன், அது மோசமாக முடிந்தது.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('jamal@sharepointdesigns.com',
   $en$Pick one topic:
- I found a fish in my bag.
- The day I got lost in my own house.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- என் பையில் ஒரு மீனைக் கண்டேன்.
- என் சொந்த வீட்டிலேயே வழி தவறிய நாள்.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('johnsi.jayasingh@sharepointdesigns.com',
   $en$Pick one topic:
- I talked to a mirror for one hour.
- My best friend is a mosquito.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- ஒரு மணி நேரம் கண்ணாடியுடன் பேசினேன்.
- என் சிறந்த நண்பன் ஒரு கொசு.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('nivetha.m@sharepointdesigns.com',
   $en$Pick one topic:
- My teacher thinks I am a genius, but I am not.
- I cooked a meal and even the dog said no.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- நான் மேதை என்று என் ஆசிரியர் நினைக்கிறார், ஆனால் நான் இல்லை.
- நான் சமைத்தேன், நாய் கூட வேண்டாம் என்றது.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('pradeepkumar.s@sharepointdesigns.com',
   $en$Pick one topic:
- I fell in love with my air conditioner.
- My bike and I had a big fight.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- என் ஏசியுடன் நான் காதலில் விழுந்தேன்.
- எனக்கும் என் பைக்குக்கும் பெரிய சண்டை.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('ramya.j@sharepointdesigns.com',
   $en$Pick one topic:
- The traffic signal never turns green for me.
- I joined a gym just to look at it.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- டிராஃபிக் சிக்னல் எனக்கு ஒருபோதும் பச்சை ஆவதில்லை.
- ஜிம்மை பார்ப்பதற்காகவே அதில் சேர்ந்தேன்.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('razia@sharepointdesigns.com',
   $en$Pick one topic:
- I won a lottery in my dream.
- My shadow is not listening to me.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- கனவில் எனக்கு லாட்டரி விழுந்தது.
- என் நிழல் என் பேச்சைக் கேட்பதில்லை.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('rutramugesh@sharepointdesigns.com',
   $en$Pick one topic:
- I ran after the bus and the bus ran faster.
- I am a lazy person with big dreams.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- பஸ்ஸின் பின்னால் ஓடினேன், பஸ் இன்னும் வேகமாக ஓடியது.
- நான் பெரிய கனவுகள் உள்ள ஒரு சோம்பேறி.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('sarat@sharepointdesigns.com',
   $en$Pick one topic:
- I woke up as a chicken.
- What if cows could talk?

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$একটি বিষয় বেছে নিন:
- আমি একটা মুরগি হয়ে ঘুম থেকে উঠলাম।
- গরু যদি কথা বলতে পারত তাহলে কী হত?

কীভাবে খেলবেন:
এক মিনিট বলুন। আপনার মনে যে বিষয়টি আসে সেটি নিয়ে বলুন। সেরা বক্তব্যের জন্য একটি সারপ্রাইজ উপহার আছে!$ta$),
  ('shanthakumar.t@sharepointdesigns.com',
   $en$Pick one topic:
- My grandma's phone call is longer than a movie.
- The first time I cooked, the kitchen was scared.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- என் பாட்டியின் போன் அழைப்பு ஒரு சினிமாவை விட நீளமானது.
- நான் முதல் முறை சமைத்தபோது சமையலறையே பயந்துவிட்டது.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('swetha@sharepointdesigns.com',
   $en$Pick one topic:
- I got a gift and it was my own old gift.
- A day without Wi-Fi is a day of drama.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- எனக்கு ஒரு பரிசு கிடைத்தது, அது என் பழைய பரிசே.
- Wi-Fi இல்லாத ஒரு நாள் என்றால் ஒரு நாடக நாள்.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$),
  ('venkatmaran@sharepointdesigns.com',
   $en$Pick one topic:
- I fought with a monkey for my banana.
- I became the king of my street.

How to play:
Speak for one minute. Speak about the topic that comes to your mind. The best speech will get a surprise gift!$en$,
   $ta$ஒரு தலைப்பைத் தேர்ந்தெடுங்கள்:
- என் வாழைப்பழத்துக்காக ஒரு குரங்குடன் சண்டை போட்டேன்.
- நான் என் தெருவின் ராஜா ஆனேன்.

எப்படி விளையாடுவது:
ஒரு நிமிடம் பேசுங்கள். உங்கள் மனதில் தோன்றும் தலைப்பைப் பற்றிப் பேசுங்கள். சிறந்த உரைக்கு ஒரு சர்ப்ரைஸ் பரிசு!$ta$)
) AS t(email, en, ta)
WHERE a.participant_id = p.id AND p.email = lower(t.email);
