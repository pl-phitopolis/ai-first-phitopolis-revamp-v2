export function hapticTick() {
  if (navigator.vibrate) {
    navigator.vibrate(5);
  }
}
