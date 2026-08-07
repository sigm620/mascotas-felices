/**
 * Habla un texto y retorna una Promise que resuelve cuando termina.
 * Si se llama de nuevo antes de terminar, cancela el anterior.
 */
export function hablar(texto: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(texto);
    utt.lang = 'es-ES';
    utt.rate = 0.82;
    utt.pitch = 1.1;
    utt.onend = () => resolve();
    utt.onerror = () => resolve();
    window.speechSynthesis.speak(utt);
  });
}

/** Pausa en milisegundos */
export function esperar(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
