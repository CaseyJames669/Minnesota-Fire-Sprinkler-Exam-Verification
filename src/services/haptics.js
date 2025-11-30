import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * "Texture" Haptics Service
 * Provides distinct vibration patterns for different app interactions.
 */
export const HapticFeedback = {
    // Basic Interactions
    light: async () => {
        await Haptics.impact({ style: ImpactStyle.Light });
    },
    medium: async () => {
        await Haptics.impact({ style: ImpactStyle.Medium });
    },
    heavy: async () => {
        await Haptics.impact({ style: ImpactStyle.Heavy });
    },

    // Semantic Patterns
    success: async () => {
        // Crisp, positive confirmation
        await Haptics.notification({ type: NotificationType.Success });
    },
    error: async () => {
        // Heavy thud
        await Haptics.notification({ type: NotificationType.Error });
    },
    warning: async () => {
        await Haptics.notification({ type: NotificationType.Warning });
    },

    // "Texture" Patterns (Custom sequences)
    mastery: async () => {
        // "Double Tap" - distinct from standard success
        await Haptics.impact({ style: ImpactStyle.Medium });
        setTimeout(async () => {
            await Haptics.impact({ style: ImpactStyle.Heavy });
        }, 100);
    },

    levelUp: async () => {
        // Rhythmic pulse for high achievements
        await Haptics.impact({ style: ImpactStyle.Medium });
        setTimeout(async () => {
            await Haptics.impact({ style: ImpactStyle.Medium });
        }, 100);
        setTimeout(async () => {
            await Haptics.impact({ style: ImpactStyle.Heavy });
        }, 250);
    }
};
