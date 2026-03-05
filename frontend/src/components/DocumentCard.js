import { View, Text, StyleSheet, Pressable, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

function DocumentCard({ item, onDelete }) {
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const [modalVisible, setModalVisible] = useState(false);
  // Calculate remaining days from expiryDate (DD/MM/YYYY format)
  const calculateDays = () => {
    const [day, month, year] = item.expiryDate.split("/").map(Number);
    const expiryDate = new Date(year, month - 1, day); // month is 0-indexed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeDiff = expiryDate - today;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  // Determine status based on calculated remaining days
  const getStatusFromDays = (days) => {
    if (days < 0) return "Expired";
    if (days <= 7) return "Expiring Soon";
    return "Safe";
  };

  const remainingDays = calculateDays();
  const calculatedStatus = getStatusFromDays(remainingDays);

  const getColor = () => {
    switch (calculatedStatus) {
      case "Expired":
        return "#EF4444";
      case "Expiring Soon":
        return "#F59E0B";
      default:
        return "#22C55E";
    }
  };

  const getTypeIcon = () => {
    const type = item.type.toLowerCase();
    if (type.includes("license")) return "card-outline";
    if (type.includes("passport")) return "document-outline";
    if (type.includes("insurance")) return "shield-outline";
    return "document-text-outline";
  };

  const getIconBackgroundColor = () => {
    switch (calculatedStatus) {
      case "Expired":
        return "#FEE4E2";
      case "Expiring Soon":
        return "#FEF3C7";
      default:
        return "#DCF4E9";
    }
  };

  const getIconColor = () => {
    switch (calculatedStatus) {
      case "Expired":
        return "#EF4444";
      case "Expiring Soon":
        return "#F59E0B";
      default:
        return "#10B981";
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => {
            if (onDelete) {
              onDelete(item.id);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const color = getColor(); // Status-based border color
  const icon = getTypeIcon(); // Document type icon
  // For dark mode use a translucent version of the status color to keep
  // visual cues while matching the dark surface. For light mode preserve
  // the original soft backgrounds.
  const iconBg = isDark ? color + "22" : getIconBackgroundColor(); // Status-based background
  const iconColor = getIconColor(); // Status-based icon color

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)} activeOpacity={0.7}>
        <View
          style={[
            styles.card,
            {
              borderColor: color,
              backgroundColor: colors.surface,
              shadowColor: "#000",
              shadowOpacity: isDark ? 0.4 : 0.08,
            },
          ]}
        >
          <View style={styles.topRow}>
            <View style={styles.leftSection}>
              <View style={[styles.iconBox, { backgroundColor: iconBg }]}> 
                <Ionicons name={icon} size={22} color={iconColor} />
              </View>
              <View style={styles.textSection}>
                <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.sub, { color: colors.textSecondary }]}>{item.type}</Text>
              </View>
            </View>

            <View style={[styles.badge, { backgroundColor: color + "22" }]}> 
              <Text style={[styles.badgeText, { color }]}>{calculatedStatus}</Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.expiry, { color: colors.textSecondary }]}> Expires: {item.expiryDate}</Text>

            {calculatedStatus !== "Expired" && (
              <Text style={[styles.days, { color: colors.text }]}>{remainingDays} days</Text>
            )}

            <Pressable 
              onPress={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={styles.deleteButton}
              hitSlop={10}
            >
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      </Pressable>

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleSection}>
                <View style={[styles.modalIconBox, { backgroundColor: iconBg }]}>
                  <Ionicons name={icon} size={28} color={iconColor} />
                </View>
                <View style={styles.modalTitleText}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>{item.type}</Text>
                </View>
              </View>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Status Badge */}
            <View style={[styles.statusContainer, { backgroundColor: color + "15" }]}>
              <Ionicons name={calculatedStatus === "Expired" ? "alert-circle" : calculatedStatus === "Expiring Soon" ? "warning" : "shield-checkmark"} size={20} color={color} />
              <View style={styles.statusText}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Status</Text>
                <Text style={[styles.statusValue, { color }]}>{calculatedStatus}</Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.detailsContainer}>
              <DetailRow 
                icon="calendar" 
                label="Expiry Date" 
                value={item.expiryDate}
                colors={colors}
              />
              {calculatedStatus !== "Expired" && (
                <DetailRow 
                  icon="timer" 
                  label="Days Remaining" 
                  value={`${remainingDays} days`}
                  colors={colors}
                />
              )}
              <DetailRow 
                icon="document-text" 
                label="Document Number" 
                value={item.documentNumber || "N/A"}
                colors={colors}
              />
              {item.notes && (
                <DetailRow 
                  icon="note" 
                  label="Notes" 
                  value={item.notes}
                  colors={colors}
                  isLastItem={true}
                />
              )}
            </View>

            {/* Close Button */}
            <Pressable 
              onPress={() => setModalVisible(false)}
              style={[styles.closeButton, { backgroundColor: colors.primary || '#7B2FF7' }]}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function DetailRow({ icon, label, value, colors, isLastItem }) {
  return (
    <View style={[styles.detailRow, !isLastItem && { borderBottomWidth: 1, borderBottomColor: colors.border || '#E5E7EB' }]}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon} size={18} color={colors.primary || '#7B2FF7'} />
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

export default DocumentCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },

  deleteButton: {
    marginLeft: "auto",
    padding: 6,
    paddingLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  textSection: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },

  sub: {
    fontSize: 12,
    color: "#6B7280",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    justifyContent: "space-between",
  },

  expiry: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },

  days: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginRight: 8,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  modalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  modalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  modalTitleText: {
    flex: 1,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },

  statusText: {
    marginLeft: 12,
    flex: 1,
  },

  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },

  statusValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  detailsContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
    textAlign: 'right',
  },

  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },

  closeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});