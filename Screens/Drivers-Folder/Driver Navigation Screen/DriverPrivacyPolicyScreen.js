import React from "react";
import { ScrollView, Text, StyleSheet, View ,Linking} from "react-native";

const DriverPrivacyPolicyScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>

      <Text style={styles.sectionTitle}>1. Introduction</Text>
      <Text style={styles.text}>
        Welcome to ShareGo! Your privacy is our priority. This policy explains
        how we collect, use, and protect your personal data when you use our
        services.
      </Text>

      <Text style={styles.sectionTitle}>2. Information We Collect</Text>
      <Text style={styles.text}>
        We collect the following data to improve your experience:
      </Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>• Location data for ride tracking</Text>
        <Text style={styles.listItem}>• Contact details for communication</Text>
        <Text style={styles.listItem}>• Payment details for secure transactions</Text>
        <Text style={styles.listItem}>• Device information for security and performance</Text>
      </View>

      <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
      <Text style={styles.text}>
        Your data is used to enhance your ride-sharing experience, including:
      </Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>• Matching you with nearby drivers</Text>
        <Text style={styles.listItem}>• Ensuring safety through identity verification</Text>
        <Text style={styles.listItem}>• Processing payments securely</Text>
        <Text style={styles.listItem}>• Providing customer support</Text>
      </View>

      <Text style={styles.sectionTitle}>4. Data Security</Text>
      <Text style={styles.text}>
        We implement strict security measures to protect your personal data,
        including encryption and secure storage methods.
      </Text>

      <Text style={styles.sectionTitle}>5. Third-Party Sharing</Text>
      <Text style={styles.text}>
        We do not sell your data. However, we may share necessary information
        with:
      </Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>• Law enforcement agencies when required</Text>
        <Text style={styles.listItem}>• Payment providers for transaction processing</Text>
        <Text style={styles.listItem}>• Partners for service improvements</Text>
      </View>

      <Text style={styles.sectionTitle}>6. Your Rights</Text>
      <Text style={styles.text}>
        You have the right to access, update, or delete your data. Contact us
        to manage your privacy preferences.
      </Text>

      <Text style={styles.sectionTitle}>7. Contact Us</Text>
      
<Text style={styles.text}>
  If you have any questions or concerns, reach out to us at{" "}
  <Text
    style={styles.link}
    onPress={() => Linking.openURL("mailto:aiman087.eng@gmail.com")}
  >
    aiman087.eng@gmail.com
  </Text>.
</Text>
      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#FAFAFA", // Softer background color
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      textAlign: "center",
      color: "#222", // Darker but softer black
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600", // Medium boldness for elegance
      color: "#333", // Slightly lighter than black
      marginTop: 18,
      marginBottom: 6,
    },
    text: {
      fontSize: 16,
      color: "#666", // Softer gray for readability
      lineHeight: 26, // Increased for better text spacing
    },
    list: {
      marginLeft: 18,
      marginBottom: 3,
    },
    listItem: {
      fontSize: 16,
      color: "#666",
      marginBottom: 3,
    },
    link: {
      color: "#3399FF", // Softer blue for better visibility
      fontWeight: "600",
    },
    spacer: {
      height: 100, // Creates empty space at the bottom
    },
    
  }
  
);
  
export default DriverPrivacyPolicyScreen;
