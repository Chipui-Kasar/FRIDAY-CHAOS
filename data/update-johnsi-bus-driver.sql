-- Replace Johnsi's character with "Bus driver who doesn't know how to change gears or when to stop" (English + Tamil).
-- Only updates if the assignment has not been claimed yet. Expect: UPDATE 1.

UPDATE assignments
SET content = $en$Bus driver who doesn't know how to change gears or when to stop

Your mission:
Act like a confident bus driver who is clearly clueless. Grind the gears (make the noise!), jerk forward and back in your seat, honk at everything, and never stop at any stop. Announce stops, then drive straight past them. Treat everyone in the meeting as passengers.

Example lines:
- "Next stop... whichever one I can see first. Hold on, everyone!"
- "KRRRRR! That's the gear. Or the bus. One of the two."
- "Sir, you want to get down? Please jump. We are not stopping, we are a very busy bus."

How the meeting plays out:
Host: "You're next. Start acting!"
You: "Everybody inside! Tickets ready! Brakes... I think they are somewhere here."
Guest: "Please stop, this is my stop!"
You: "Madam, I also wish to stop. But the bus has its own plans. HONK HONK!"
Guest: "How long have you been driving?"
You: "Since this morning. And I'm already very tired of this steering wheel."
Everyone: 😂😂😂
Host: "Time's up! Put your guesses in the Teams chat."

Keep this assignment secret!$en$,
    content_ta = $ta$கியர் மாற்றவும் எங்கே நிறுத்தவும் தெரியாத பேருந்து ஓட்டுநர்

உங்கள் பணி:
தன்னம்பிக்கையாக இருக்கும் ஆனால் எதுவுமே தெரியாத பேருந்து ஓட்டுநர் போல நடியுங்கள். கியரை அரைக்கும் சத்தம் போடுங்கள் (கர்ர்ர்!), இருக்கையில் முன்னும் பின்னும் குலுங்குங்கள், எல்லாவற்றுக்கும் ஹாரன் அடியுங்கள், எந்த ஸ்டாப்பிலும் நிறுத்தாதீர்கள். ஸ்டாப்பை அறிவித்துவிட்டு நேராகக் கடந்து போங்கள். கூட்டத்தில் உள்ள எல்லோரையும் பயணிகளாக நடத்துங்கள்.

இப்படிச் சொல்லலாம்:
- "அடுத்த ஸ்டாப்... முதலில் கண்ணில் படுகிற ஸ்டாப். எல்லோரும் பிடித்துக் கொள்ளுங்கள்!"
- "கர்ர்ர்ர்! அது கியர். அல்லது பஸ். இரண்டில் ஒன்று."
- "சார், இறங்கணுமா? தயவுசெய்து குதியுங்கள். நாங்கள் நிறுத்த மாட்டோம், இது ரொம்ப பிஸியான பஸ்."

கூட்டம் எப்படி நடக்கும்:
தொகுப்பாளர்: "அடுத்தது நீங்கள். நடிக்கத் தொடங்குங்கள்!"
நீங்கள்: "எல்லோரும் உள்ளே ஏறுங்கள்! டிக்கெட் தயாரா வையுங்கள்! பிரேக்... இங்கேதான் எங்கோ இருக்கணும்."
விருந்தினர்: "தயவுசெய்து நிறுத்துங்கள், இதுதான் என் ஸ்டாப்!"
நீங்கள்: "மேடம், நானும் நிறுத்தத்தான் விரும்புகிறேன். ஆனால் பஸ்ஸுக்கு வேறு திட்டம் இருக்கிறது. பீப் பீப்!"
விருந்தினர்: "எவ்வளவு நாளாக ஓட்டுகிறீர்கள்?"
நீங்கள்: "இன்று காலையிலிருந்து. இப்போதே இந்த ஸ்டீயரிங் மேல் எனக்கு ரொம்ப சலிப்பு."
அனைவரும்: 😂😂😂
தொகுப்பாளர்: "நேரம் முடிந்தது! உங்கள் யூகங்களை Teams சாட்டில் எழுதுங்கள்."

இந்த ரகசியத்தை வெளியில் சொல்லாதீர்கள்!$ta$
WHERE participant_id = (SELECT id FROM participants WHERE email = 'johnsi.jayasingh@sharepointdesigns.com')
  AND claimed_at IS NULL;
