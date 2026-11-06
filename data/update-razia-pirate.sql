-- Replace Razia's character with "Pirate captain who is afraid of water" (English + Tamil).
-- Only updates if the assignment has not been claimed yet. Expect: UPDATE 1.

UPDATE assignments
SET content = $en$Pirate captain who is afraid of water

Your mission:
Act like a fearless pirate captain who secretly panics around anything wet. Give bold pirate orders, but dodge puddles, rain, and even drinking water.

Example lines:
- "Arrr! I fear no sea! ...Is that a puddle? Everyone stay back."
- "We sail at dawn! Actually, let's walk. On dry land. Very dry."
- "I'll have my rum, but without the liquid part."

How the meeting plays out:
Host: "You're next. Start acting!"
You: "Ahoy, crew! Your captain has arrived. Please keep the water jug far away."
Guest: "Aren't pirates supposed to love the sea?"
You: "Of course! From a distance. A very long distance. Through binoculars."
Guest: "Can you swim?"
You: "I can... stand. Firmly. On the shore."
Everyone: 😂😂😂
Host: "Time's up! Put your guesses in the Teams chat."

Keep this assignment secret!$en$,
    content_ta = $ta$தண்ணீருக்குப் பயப்படும் கடற்கொள்ளைக்காரத் தலைவர்

உங்கள் பணி:
பயமே இல்லாத கடற்கொள்ளைக்காரத் தலைவர் போல நடியுங்கள், ஆனால் உள்ளுக்குள் ஈரமான எதைக் கண்டாலும் நடுங்குபவர். துணிச்சலான கட்டளைகள் கொடுங்கள், ஆனால் குட்டைகள், மழை, குடிநீர் கூட வேண்டாம் என்று ஒதுங்குங்கள்.

இப்படிச் சொல்லலாம்:
- "ஆஹா! எனக்குக் கடல் மேல் பயமே இல்லை! ...அது குட்டையா? எல்லோரும் பின்னால் நில்லுங்கள்."
- "விடியற்காலையில் கப்பல் புறப்படும்! இல்லை, நடந்தே போவோம். காய்ந்த தரையில். நன்றாகக் காய்ந்த தரையில்."
- "எனக்கு ரம் வேண்டும், ஆனால் திரவம் இல்லாமல்."

கூட்டம் எப்படி நடக்கும்:
தொகுப்பாளர்: "அடுத்தது நீங்கள். நடிக்கத் தொடங்குங்கள்!"
நீங்கள்: "ஹலோ குழுவினரே! உங்கள் தலைவர் வந்துவிட்டார். தயவுசெய்து தண்ணீர் ஜாடியைத் தூரமாக வையுங்கள்."
விருந்தினர்: "கடற்கொள்ளைக்காரர்கள் கடலை விரும்புவார்கள் அல்லவா?"
நீங்கள்: "நிச்சயமாக! தூரத்திலிருந்து. மிக மிகத் தூரத்திலிருந்து. தொலைநோக்கி வழியாக."
விருந்தினர்: "நீந்தத் தெரியுமா?"
நீங்கள்: "நான்... நிற்பேன். உறுதியாக. கரையில்."
அனைவரும்: 😂😂😂
தொகுப்பாளர்: "நேரம் முடிந்தது! உங்கள் யூகங்களை Teams சாட்டில் எழுதுங்கள்."

இந்த ரகசியத்தை வெளியில் சொல்லாதீர்கள்!$ta$
WHERE participant_id = (SELECT id FROM participants WHERE email = 'razia@sharepointdesigns.com')
  AND claimed_at IS NULL;
