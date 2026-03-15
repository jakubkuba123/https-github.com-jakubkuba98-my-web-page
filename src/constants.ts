import { GoogleGenAI } from "@google/genai";

export const CHICKEN_TIPS = [
  "Slepice potřebují vápník pro silné skořápky. Přidejte jim drcené vaječné skořápky nebo grit.",
  "Čerstvá voda je základ. V létě ji měňte častěji, aby nebyla teplá.",
  "Kurník by měl být dobře větraný, ale bez průvanu.",
  "Slepice milují popelení – pomáhá jim to zbavit se parazitů.",
  "Dýně a cukety jsou skvělým zdrojem vitamínů pro vaše slepice.",
  "Pravidelné čištění kurníku snižuje riziko nemocí a zápachu.",
  "Slepice snášejí méně vajec, když jsou ve stresu nebo je příliš horko.",
  "Bylinky jako máta nebo levandule v hnízdech odpuzují hmyz.",
  "Kontrolujte pravidelně běháky, zda nemají slepice vápenku.",
  "Mladé kuřice začínají snášet kolem 20. týdne věku."
];

export const INITIAL_CHICKENS = [
  { id: '1', name: 'Pipka', breed: 'Vlaška', ageWeeks: 52, status: 'healthy', medications: [] },
  { id: '2', name: 'Kropenka', breed: 'Maranska', ageWeeks: 40, status: 'healthy', medications: [] }
];
