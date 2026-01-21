export interface Quote {
    id: number;
    text: string;
    translation: string;
    author: string;
}

export const quotes: Quote[] = [
    {
        id: 1,
        text: "The only way to do great work is to love what you do.",
        translation: "Rian ṭha ṭuan khawh nak lam khat chauh a um, mah na ṭuan mi rian kha dawt a si.",
        author: "Steve Jobs"
    },
    {
        id: 2,
        text: "Believe you can and you're halfway there.",
        translation: "Ka tuah khawh lai tiah na zumh ahcun, a cheu na phan cang.",
        author: "Theodore Roosevelt"
    },
    {
        id: 3,
        text: "It does not matter how slowly you go as long as you do not stop.",
        translation: "Na din lo paoh ahcun, zeizat in dah na kal muan ti a biapi lo.",
        author: "Confucius"
    },
    {
        id: 4,
        text: "Your time is limited, don't waste it living someone else's life.",
        translation: "Na caan a tlawm, midang nun in nung hlah.",
        author: "Steve Jobs"
    },
    {
        id: 5,
        text: "The future belongs to those who believe in the beauty of their dreams.",
        translation: "Hmailei cu an manh a dawhnak a zum mi hna ta a si.",
        author: "Eleanor Roosevelt"
    },
    {
        id: 6,
        text: "Don't watch the clock; do what it does. Keep going.",
        translation: "Nazi zoh hlah; amah nih a tuah mi kha tuah ve. Kal peng.",
        author: "Sam Levenson"
    },
    {
        id: 7,
        text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        translation: "Awn nak hi a donghnak a si lo, sungh nak hi thih nak a si lo: Pehzulh ngam nak lungthin hi a biapi bik mi cu a si.",
        author: "Winston Churchill"
    },
    {
        id: 8,
        text: "You are never too old to set another goal or to dream a new dream.",
        translation: "Hmuitinh thar chiah ding le manh thar man ding in na upa tuk bal lo.",
        author: "C.S. Lewis"
    },
    {
        id: 9,
        text: "Start where you are. Use what you have. Do what you can.",
        translation: "Na um nak hmun in thawk. Na ngeih mi hmang. Na tuah khawh mi tuah.",
        author: "Arthur Ashe"
    },
    {
        id: 10,
        text: "Life is 10% what happens to us and 90% how we react to it.",
        translation: "Nunnak hi kan cung i a tlung mi 10% a si i, kan lehrulh ning hi 90% a si.",
        author: "Charles R. Swindoll"
    },
    {
        id: 11,
        text: "With the new day comes new strength and new thoughts.",
        translation: "Ni thar he thazaang thar le ruahnak thar an ra.",
        author: "Eleanor Roosevelt"
    },
    {
        id: 12,
        text: "Failure will never overtake me if my determination to succeed is strong enough.",
        translation: "Hlawhtlin duhnak lungthin ka ngeih mi a ṭhawn ahcun, sunghnak nih a ka tei bal lai lo.",
        author: "Og Mandino"
    },
    {
        id: 13,
        text: "Quality is not an act, it is a habit.",
        translation: "A ṭhatnak cu tuahnak men a si lo, ziaza tu a si.",
        author: "Aristotle"
    },
    {
        id: 14,
        text: "It always seems impossible until it's done.",
        translation: "Tuah dih hlan paoh cu a si kho lo mi a lo lengmang.",
        author: "Nelson Mandela"
    },
    {
        id: 15,
        text: "Good, better, best. Never let it rest. 'Til your good is better and your better is best.",
        translation: "A ṭha, a ṭha deuh, a ṭha bik. Na ṭha kha ṭha deuh, na ṭha deuh kha ṭha bik a si hlan lo din hlah.",
        author: "St. Jerome"
    },
    {
        id: 16,
        text: "Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence.",
        translation: "A ṭha lei in hmuh nak hi hlawhtlinnak lei hruaitu zumhnak a si. Ruahchannak le i zumhngamnak lo cun zeihmanh tuah khawh a si lo.",
        author: "Helen Keller"
    },
    {
        id: 17,
        text: "Keep your face always toward the sunshine—and shadows will fall behind you.",
        translation: "Ni ceu lei ah na hmai chit zungzal—cun thlaimun cu na hnu lei ah a um lai.",
        author: "Walt Whitman"
    },
    {
        id: 18,
        text: "The secret of getting ahead is getting started.",
        translation: "Hmailei panh khawhnak a biathli cu i/thawk hi a si.",
        author: "Mark Twain"
    },
    {
        id: 19,
        text: "Setting goals is the first step in turning the invisible into the visible.",
        translation: "Hmuitinh chiah cu hmuh khawh lo mi kha hmuh khawh mi ah chuahter nak a step hmasa bik a si.",
        author: "Tony Robbins"
    },
    {
        id: 20,
        text: "You don't have to be great to start, but you have to start to be great.",
        translation: "I thawk ding in na ṭhat a hau lo, asinain ṭha ding in i thawk na hau.",
        author: "Zig Ziglar"
    }
];

export function getDailyQuote(): Quote {
    const today = new Date();
    // Use the day of the year to select a quote so it changes daily
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    return quotes[dayOfYear % quotes.length];
}
