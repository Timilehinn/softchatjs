import * as ExpoHaptics from 'expo-haptics';

export default class Haptics {
  static success() {
    ExpoHaptics.notificationAsync(
      ExpoHaptics.NotificationFeedbackType.Success
    )
  }

  static light() {
    ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light)
  }

  static medium() {
    ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium)
  }
}