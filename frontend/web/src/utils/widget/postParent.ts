export function postParent(event: string, data?: unknown) {
  try {
    window.parent?.postMessage(
      `ultra-widget:${JSON.stringify({ event, data })}`,
      '*',
    );
  } catch {
    // silenciosamente ignora erros de serialização/postMessage
  }
}
