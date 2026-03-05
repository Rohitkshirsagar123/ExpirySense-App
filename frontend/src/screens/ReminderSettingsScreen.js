import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { getReminderSettings, saveReminderSettings } from "../services/reminderSettingsService";
import documentService from "../services/documentService";
import authApiService from "../services/authApiService";
import { rescheduleRemindersForUser, cancelAllScheduledReminders } from "../services/reminderService";

export default function ReminderSettingsScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const colors = theme.colors;

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminder30Days, setReminder30Days] = useState(true);
  const [reminder7Days, setReminder7Days] = useState(true);
  const [reminder1Day, setReminder1Day] = useState(true);
  const [reminderOnExpiry, setReminderOnExpiry] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [permissionNote, setPermissionNote] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getReminderSettings();
      setRemindersEnabled(settings.remindersEnabled);
      setReminder30Days(settings.days.d30);
      setReminder7Days(settings.days.d7);
      setReminder1Day(settings.days.d1);
      setReminderOnExpiry(settings.days.onExpiry);
      setLoadingSettings(false);
    };

    loadSettings();
  }, []);

  const buildSettingsObject = (nextState = {}) => {
    return {
      remindersEnabled: nextState.remindersEnabled ?? remindersEnabled,
      days: {
        d30: nextState.reminder30Days ?? reminder30Days,
        d7: nextState.reminder7Days ?? reminder7Days,
        d1: nextState.reminder1Day ?? reminder1Day,
        onExpiry: nextState.reminderOnExpiry ?? reminderOnExpiry,
      },
    };
  };

  const persistAndReschedule = async (nextState) => {
    const userId = auth.currentUser?.uid;
    const settings = buildSettingsObject(nextState);
    await saveReminderSettings(settings);

    if (!userId) {
      return;
    }

    if (!settings.remindersEnabled) {
      await cancelAllScheduledReminders(userId);
      return;
    }

    const result = await documentService.getDocuments(userId);
    if (result.success) {
      await rescheduleRemindersForUser(result.documents, settings, userId);
    }
  };

  const Card = ({ children }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {children}
    </View>
  );

  const ToggleRow = ({ title, subtitle, value, onChange }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[
            styles.rowSubtitle,
            { color: colors.textSecondary },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: "#d1d5db",
          true: colors.primary,
        }}
        thumbColor={Platform.OS === "android" ? "#fff" : undefined}
      />
    </View>
  );

  return (
    <View style={styles.container} >
     
        {/* HEADER */}
        <LinearGradient
          colors={isDark ? ["#0F172A", "#1a2a4a"] : ["#5B40F5", "#A16EFF"]}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <Pressable
              style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.2)' }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back-outline"
                size={20}
                color={isDark ? colors.text : "#fff"}
              />
            </Pressable>

            <Text style={[styles.headerTitle, { color: isDark ? colors.text : '#fff' }]}>Reminder Settings</Text>
          </View>

          <Text style={[styles.headerSubtitle, { color: isDark ? colors.textSecondary : 'rgba(255,255,255,0.85)' }]}>Manage your notification preferences</Text>
        </LinearGradient>
         <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.content, { backgroundColor: colors.background }] }>
            {!loadingSettings && (
              <>
            {/* MASTER TOGGLE */}
            <Card>
                <View style={styles.row}>
                <View style={[styles.iconWrapper, { backgroundColor: isDark ? colors.surfaceAlt : '#DBEAFE' }]}> 
                    <Ionicons
                    name="notifications-outline"
                    size={20}
                    color={colors.primary}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>Enable Reminders</Text>
                    <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Receive notifications for expiring documents</Text>
                </View>

                <Switch
                    value={remindersEnabled}
                    onValueChange={async (value) => {
                      setRemindersEnabled(value);
                      await persistAndReschedule({ remindersEnabled: value });
                    }}
                    trackColor={{ false: isDark ? '#374151' : '#d1d5db', true: colors.primary }}
                    thumbColor={Platform.OS === 'android' ? (remindersEnabled ? '#fff' : '#fff') : undefined}
                />
                </View>
            </Card>

            {/* SCHEDULE SECTION */}
            {remindersEnabled && (
                <>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notification Schedule</Text>

                <Card>
                    <ToggleRow
                      title="30 Days Before"
                      subtitle="Early warning notification"
                      value={reminder30Days}
                      onChange={async (value) => {
                        setReminder30Days(value);
                        await persistAndReschedule({ reminder30Days: value });
                      }}
                    />

                    <ToggleRow
                      title="7 Days Before"
                      subtitle="One week warning" 
                      value={reminder7Days}
                      onChange={async (value) => {
                        setReminder7Days(value);
                        await persistAndReschedule({ reminder7Days: value });
                      }}
                    />

                    <ToggleRow
                      title="1 Day Before"
                      subtitle="Final reminder"
                      value={reminder1Day}
                      onChange={async (value) => {
                        setReminder1Day(value);
                        await persistAndReschedule({ reminder1Day: value });
                      }}
                    />

                    <ToggleRow
                      title="On Expiry Date"
                      subtitle="Alert on the day document expires"
                      value={reminderOnExpiry}
                      onChange={async (value) => {
                        setReminderOnExpiry(value);
                        await persistAndReschedule({ reminderOnExpiry: value });
                      }}
                    />
                </Card>
                </>
            )}

            {/* INFO BOX */}
            <View style={[styles.infoBox, { backgroundColor: isDark ? colors.surface : '#EFF6FF', borderColor: colors.border }] }>
                <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: isDark ? colors.surface : '#DBEAFE' }]}>
                    <Ionicons name="checkmark" size={14} color={colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={[styles.infoTitle, { color: colors.primary }]}>Smart Reminders</Text>
                    <Text
                    style={[
                        styles.infoText,
                        { color: colors.textSecondary },
                    ]}
                    >
                    We'll send you push notifications based on
                    your selected schedule. You can customize
                    reminders for each document individually.
                    </Text>
                </View>
                </View>
            </View>

            {/* BENEFITS BOX */}
            <View style={[styles.benefitsBox, { backgroundColor: isDark ? colors.surfaceAlt : '#F9FAFB', borderColor: colors.border }]}>
                <Text style={[styles.benefitsTitle, { color: colors.text }]}>Why Enable Reminders?</Text>
                
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[styles.benefitText, { color: colors.textSecondary }]}>Never miss an expiry date</Text>
                </View>

                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[styles.benefitText, { color: colors.textSecondary }]}>Renew documents on time</Text>
                </View>

                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[styles.benefitText, { color: colors.textSecondary }]}>Stay organized & compliant</Text>
                </View>
            </View>
            </>
            )}
            </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
      container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    // borderBottomLeftRadius: 0,
    // borderBottomRightRadius: 0,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  backBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    marginLeft: 40,
    fontSize: 13,
  },

  content: {
    padding: 20,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },

  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  iconWrapper: {
    backgroundColor: "#DBEAFE",
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },

  infoBox: {
    marginTop: 20,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
  },

  infoRow: {
    flexDirection: "row",
  },

  infoIcon: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginRight: 10,
  },

  infoTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },

  infoText: {
    fontSize: 12,
  },
});