import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  Image,
  Alert,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import documentService from "../services/documentService";
import { useTheme } from "../context/ThemeContext";
import { getReminderSettings } from "../services/reminderSettingsService";
import { scheduleRemindersForDocuments } from "../services/reminderService";
import { useDocuments } from "../context/DocumentsContext";
import authApiService from "../services/authApiService";

const documentTypes = ["License", "Passport", "Insurance", "Certificate", "ID Card"];

export default function AddDocumentScreen({ navigation, route }) {
  const { theme, isDark } = useTheme();
  const { setAllDocuments } = useDocuments();
  const colors = theme.colors;
  const [documentType, setDocumentType] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [error, setError] = useState("");
  const [documentImage, setDocumentImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getCalculatedStatus = (expiryDateString) => {
    const [day, month, year] = expiryDateString.split("/").map(Number);
    const expDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeDiff = expDate - today;
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (days < 0) return "Expired";
    if (days <= 7) return "Expiring Soon";
    return "Safe";
  };

  const handleAddDocument = () => {
    setError("");
    if (!documentType || !documentName || !documentNumber || !expiryDate) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    saveDocument();
  };

  const saveDocument = async () => {
    try {
      const userData = await authApiService.getCurrentUser();
      const userId = userData?.uid;
      if (!userId) {
        setError("User not authenticated. Please login again.");
        setLoading(false);
        return;
      }

      const expiryDateFormatted = formatDate(expiryDate);

      // Calculate status
      const [day, month, year] = expiryDateFormatted.split("/").map(Number);
      const expDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const timeDiff = expDate - today;
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      let calculatedStatus = 'Safe';
      if (days < 0) calculatedStatus = 'Expired';
      else if (days <= 7) calculatedStatus = 'Expiring Soon';

      const newDocument = {
        name: documentName,
        type: documentType,
        expiryDate: expiryDateFormatted,
        status: calculatedStatus, // Include status
        documentNumber: documentNumber,
        image: documentImage,
      };

      let savedDoc = null;

      // Try backend API first
      const BACKEND_URL = "http://192.168.31.199:3000";
      try {
        // Get auth token
        const token = await authApiService.getAuthToken();
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BACKEND_URL}/api/documents/add`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            document: newDocument,
            userId: userId,
          }),
          timeout: 5000,
        });

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          savedDoc = result.document; // Backend includes calculated status
        } else {
          throw new Error(result.message || 'Backend returned false');
        }
      } catch (backendError) {
        // Fallback to direct Firebase if backend fails
        const result = await documentService.addDocument(newDocument, userId);
        
        if (result.success) {
          savedDoc = {
            id: result.id,
            ...newDocument,
            status: calculatedStatus, // Include calculated status
          };
        } else {
          throw new Error(result.error || 'Direct Firebase failed');
        }
      }

      if (savedDoc) {
        const settings = await getReminderSettings();
        await scheduleRemindersForDocuments([savedDoc], settings, userId);

        // Update context instead of using callback
        setAllDocuments((prevDocuments) => [...prevDocuments, savedDoc]);

        setLoading(false);
        Alert.alert("Success", "Document added successfully!", [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to save document. Try again.");
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Camera roll permission is required to upload images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setDocumentImage(imageUri);
        
        // Try to extract text from image (mock OCR)
        await extractDataFromImage(imageUri);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick image");
      console.log(err);
    }
  };

  const extractDataFromImage = async (imageUri) => {
    try {
      // Simple mock OCR: You can integrate Google Vision or similar later
      // For now, just save the image URI
      Alert.alert("Image Uploaded", "Document image uploaded successfully. You can fill in details manually or we'll auto-detect them in the future.");
    } catch (err) {
      console.log("OCR Error:", err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
     
        {/* Header */}
        <LinearGradient
          colors={isDark ? [colors.surface, colors.surfaceAlt] : ["#7B2FF7", "#A64FFF"]}
          style={styles.header}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={isDark ? colors.text : "#fff"} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: isDark ? colors.text : "#fff" }]}>Add Document</Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? colors.textSecondary : "rgba(255,255,255,0.85)" }]}>
              Track a new document expiry date
            </Text>
          </View>
        </LinearGradient>
        <ScrollView
              contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
              showsVerticalScrollIndicator={false}
            >
              {/* Form */}
            <View style={[styles.form, { backgroundColor: colors.surface }]}>
              {/* Section 1: Document Info */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Document Information</Text>

                {/* Document Type */}
                <Text style={[styles.label, { color: colors.text }]}>
                  <Ionicons name="document-text" size={14} color={colors.primary} /> Document Type
                </Text>
                <Pressable
                  onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                  style={[styles.dropdownButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !documentType && styles.placeholderText,
                      { color: colors.text },
                    ]}
                  >
                    {documentType || "Select document type"}
                  </Text>
                  <Ionicons
                    name={showTypeDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.primary}
                  />
                </Pressable>

                {showTypeDropdown && (
                  <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {documentTypes.map((type) => (
                      <Pressable
                        key={type}
                        onPress={() => {
                          setDocumentType(type);
                          setShowTypeDropdown(false);
                        }}
                        style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                      >
                        <Text style={[styles.dropdownItemText, { color: colors.text }]}>{type}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Document Name */}
                <Text style={[styles.label, { marginTop: 16, color: colors.text }]}>
                  <Ionicons name="create" size={14} color={colors.primary} /> Document Name
                </Text>
                <View style={[styles.inputRow, { backgroundColor: colors.surfaceAlt }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="e.g., Personal Passport"
                    placeholderTextColor={colors.textTertiary}
                    value={documentName}
                    onChangeText={setDocumentName}
                  />
                </View>

                {/* Document Number */}
                <Text style={[styles.label, { marginTop: 16, color: colors.text }]}>
                  <Ionicons name="barcode" size={14} color={colors.primary} /> Document Number
                </Text>
                <View style={[styles.inputRow, { backgroundColor: colors.surfaceAlt }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="e.g., P12345678"
                    placeholderTextColor={colors.textTertiary}
                    value={documentNumber}
                    onChangeText={setDocumentNumber}
                  />
                </View>
              </View>

              {/* Section 2: Expiry Date */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Expiry Details</Text>

                <Text style={[styles.label, { color: colors.text }]}>
                  <Ionicons name="calendar" size={14} color={colors.primary} /> Expiry Date
                </Text>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={[styles.dateButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(expiryDate)}</Text>
                </Pressable>

                {showDatePicker && (
                  <DateTimePicker
                    value={expiryDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                  />
                )}
              </View>

              {/* Section 3: Document Image */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Document Scan</Text>

                <Text style={[styles.label, { color: colors.text }]}>
                  <Ionicons name="image" size={14} color={colors.primary} /> Upload Image (Optional)
                </Text>
                <Pressable style={[styles.uploadBox, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]} onPress={pickImage}>
                  {documentImage ? (
                    <Image
                      source={{ uri: documentImage }}
                      style={styles.uploadedImage}
                    />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
                      <Text style={[styles.uploadText, { color: colors.text }]}>Tap to upload document scan</Text>
                      <Text style={[styles.uploadHint, { color: colors.textSecondary }]}>JPG, PNG or PDF (Max 5MB)</Text>
                    </>
                  )}
                </Pressable>
              </View>

              {/* Error Message */}
              {error ? <Text style={[styles.error, { color: colors.error }]}>⚠ {error}</Text> : null}

              {/* Add Button */}
              <Pressable
                onPress={handleAddDocument}
                style={styles.addButtonWrapper}
                disabled={loading}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addButton}
                >
                  <Text style={[styles.addButtonText, { color: isDark ? "#000" : "#fff" }]}>
                    {loading ? "Adding..." : "Add Document"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 18,
    paddingBottom: 28,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
  },

  form: {
    paddingHorizontal: 18,
    paddingVertical: 24,
    paddingBottom: 100,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  label: {
    marginBottom: 10,
    fontWeight: "650",
    fontSize: 14,
    letterSpacing: -0.2,
  },

  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  dropdownText: {
    fontSize: 15,
    flex: 1,
    fontWeight: "500",
  },

  placeholderText: {
    fontWeight: "400",
  },

  dropdown: {
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 8,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },

  dropdownItemText: {
    fontSize: 15,
    fontWeight: "500",
  },

  inputRow: {
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  input: {
    fontSize: 15,
    flex: 1,
    fontWeight: "500",
  },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  dateText: {
    marginLeft: 12,
    fontSize: 15,
    flex: 1,
    fontWeight: "500",
  },

  uploadBox: {
    borderWidth: 2.2,
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 44,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    shadowColor: "#7B2FF7",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  uploadedImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
  },

  uploadText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "650",
    letterSpacing: -0.2,
  },

  uploadHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "400",
  },

  error: {
    marginTop: 12,
    textAlign: "center",
    fontWeight: "650",
    fontSize: 13,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
  },

  addButtonWrapper: {
    width: "100%",
    marginTop: 32,
  },

  addButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#7B2FF7",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  addButtonText: {
    fontWeight: "750",
    fontSize: 16,
    letterSpacing: -0.3,
  },
});
