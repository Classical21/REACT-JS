/*
// WelcomeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons"; // for 3-dots menu

function WelcomeScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3 dots menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Add Modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newSite, setNewSite] = useState("");
  const [newStation, setNewStation] = useState("");
  const [newAccount, setNewAccount] = useState("");

  // Edit Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editSite, setEditSite] = useState("");
  const [editStation, setEditStation] = useState("");
  const [editAccount, setEditAccount] = useState("");

  // Fetch accounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/accounts");
      setAccounts(response.data);
      setFilteredAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter
  const handleSearch = (text) => {
    setSearch(text);
    const filtered = accounts.filter(
      (acc) =>
        acc.siteName?.toLowerCase().includes(text.toLowerCase()) ||
        acc.serviceStation?.toLowerCase().includes(text.toLowerCase()) ||
        acc.accountNumber?.includes(text)
    );
    setFilteredAccounts(filtered);
  };

  // Add new record
  const handleAdd = async () => {
    if (!newSite || !newStation || !newAccount) {
      alert("Please fill all fields");
      return;
    }
    try {
      const response = await axios.post("http://localhost:8080/api/accounts", {
        siteName: newSite,
        serviceStation: newStation,
        accountNumber: newAccount,
      });
      const updated = [...accounts, response.data];
      setAccounts(updated);
      setFilteredAccounts(updated);
      setAddModalVisible(false);
      setNewSite("");
      setNewStation("");
      setNewAccount("");
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/accounts/${id}`);
      const updated = accounts.filter((acc) => acc.id !== id);
      setAccounts(updated);
      setFilteredAccounts(updated);
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setMenuVisible(false);
    }
  };

  // Open edit modal
  const handleEdit = (item) => {
    setMenuVisible(false);
    setSelectedItem(item);
    setEditSite(item.siteName);
    setEditStation(item.serviceStation);
    setEditAccount(item.accountNumber);
    setEditModalVisible(true);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editSite || !editStation || !editAccount) {
      alert("Please fill all fields");
      return;
    }
    try {
      const response = await axios.put(
          `http://localhost:8080/api/accounts/${selectedItem.id}`,
          {
          siteName: editSite,
          serviceStation: editStation,
          accountNumber: editAccount,
        }
      );
      const updated = accounts.map((acc) =>
        acc.id === selectedItem.id ? response.data : acc
      );
      setAccounts(updated);
      setFilteredAccounts(updated);
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error saving edit:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sites & Service Stations</Text>

      {/!* Search Input *!/}
      <TextInput
        style={styles.input}
        placeholder="Search by Site, Station, or Account"
        value={search}
        onChangeText={handleSearch}
      />

      {/!* Add Button *!/}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add</Text>
      </TouchableOpacity>

      {/!* Table *!/}
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={filteredAccounts}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => (
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.headerCell]}>SITE LOCATION</Text>
              <Text style={[styles.cell, styles.headerCell]}>SERVICE STATION NAME</Text>
              <Text style={[styles.cell, styles.headerCell]}>ACCOUNT #</Text>
              <Text style={[styles.cell, styles.headerCell]}>ACTION</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.cell}>{item.siteName}</Text>
              <Text style={styles.cell}>{item.serviceStation}</Text>
              <Text style={styles.cell}>{item.accountNumber}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedItem(item);
                  setMenuVisible(true);
                }}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="black" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/!* 3 Dots Menu *!/}
      <Modal
        transparent={true}
        animationType="fade"
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleEdit(selectedItem)}
            >
              <Text>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleDelete(selectedItem.id)}
            >
              <Text style={{ color: "red" }}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setMenuVisible(false)}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/!* Add Modal *!/}
      <Modal
        transparent={true}
        animationType="slide"
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Add New Account</Text>

            <TextInput
              style={styles.input}
              placeholder="Site Name"
              value={newSite}
              onChangeText={setNewSite}
            />
            <TextInput
              style={styles.input}
              placeholder="Service Station"
              value={newStation}
              onChangeText={setNewStation}
            />
            <TextInput
              style={styles.input}
              placeholder="Account Number"
              value={newAccount}
              onChangeText={setNewAccount}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: "gray" }]}
              onPress={() => setAddModalVisible(false)}
            >
              <Text style={styles.addButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/!* Edit Modal *!/}
      <Modal
        transparent={true}
        animationType="slide"
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Edit Account</Text>

            <TextInput
              style={styles.input}
              placeholder="Site Name"
              value={editSite}
              onChangeText={setEditSite}
            />
            <TextInput
              style={styles.input}
              placeholder="Service Station"
              value={editStation}
              onChangeText={setEditStation}
            />
            <TextInput
              style={styles.input}
              placeholder="Account Number"
              value={editAccount}
              onChangeText={setEditAccount}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.addButton} onPress={handleSaveEdit}>
              <Text style={styles.addButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: "gray" }]}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.addButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    alignItems: "center",
  },
  cell: { flex: 1, fontSize: 14 },
  headerCell: { fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menu: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    width: 200,
  },
  menuItem: { paddingVertical: 10 },
  addForm: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "90%",
  },
  formTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
});

export default WelcomeScreen;
*/



import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons"; // for 3-dots menu

function WelcomeScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);


  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);


  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newSite, setNewSite] = useState("");
  const [newStation, setNewStation] = useState("");
  const [newAccount, setNewAccount] = useState("");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editSite, setEditSite] = useState("");
  const [editStation, setEditStation] = useState("");
  const [editAccount, setEditAccount] = useState("");

  // Fetch accounts frim api
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/accounts");
      setAccounts(response.data);
      setFilteredAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter fata
  const handleSearch = (text) => {
    setSearch(text);
    const filtered = accounts.filter(
        (acc) =>
            acc.siteName?.toLowerCase().includes(text.toLowerCase()) ||
            acc.serviceStation?.toLowerCase().includes(text.toLowerCase()) ||
            acc.accountNumber?.includes(text)
    );
    setFilteredAccounts(filtered);
  };

  // Add new account
  const handleAdd = async () => {
    if (!newSite || !newStation || !newAccount) {
      alert("Please fill all fields");
      return;
    }
    try {
      const response = await axios.post("http://localhost:8080/api/accounts", {
        siteName: newSite,
        serviceStation: newStation,
        accountNumber: newAccount,
      });
      const updated = [...accounts, response.data];
      setAccounts(updated);
      setFilteredAccounts(updated);
      setAddModalVisible(false);
      setNewSite("");
      setNewStation("");
      setNewAccount("");
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  // Delete api
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/accounts/${id}`);
      const updated = accounts.filter((acc) => acc.id !== id);
      setAccounts(updated);
      setFilteredAccounts(updated);
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setMenuVisible(false);
    }
  };

  // Open edit modal
  const handleEdit = (item) => {
    setMenuVisible(false);
    setSelectedItem(item);
    setEditSite(item.siteName);
    setEditStation(item.serviceStation);
    setEditAccount(item.accountNumber);
    setEditModalVisible(true);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editSite || !editStation || !editAccount) {
      alert("Please fill all fields");
      return;
    }
    try {
      const response = await axios.put(
          `http://localhost:8080/api/accounts/${selectedItem.id}`,
          {
            siteName: editSite,
            serviceStation: editStation,
            accountNumber: editAccount,
          }
      );
      const updated = accounts.map((acc) =>
          acc.id === selectedItem.id ? response.data : acc
      );
      setAccounts(updated);
      setFilteredAccounts(updated);
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error saving edit:", error);
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Sites & Service Stations</Text>

        {/* Search Input button */}
        <TextInput
            style={styles.input}
            placeholder="Search by Site, Station, or Account"
            value={search}
            onChangeText={handleSearch}
        />

        {/* here is Add Button */}
        <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>

        {/* this is teh Table */}
        {loading ? (
            <ActivityIndicator size="large" color="#007BFF" />
        ) : (
            <FlatList
                data={filteredAccounts}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={() => (
                    <View style={styles.tableHeader}>
                      <Text style={[styles.cell, styles.headerCell]}>SITE LOCATION</Text>
                      <Text style={[styles.cell, styles.headerCell]}>
                        SERVICE STATION NAME
                      </Text>
                      <Text style={[styles.cell, styles.headerCell]}>ACCOUNT #</Text>
                      <Text style={[styles.actionCell, styles.headerCell]}>ACTN</Text>
                    </View>
                )}
                renderItem={({ item, index }) => (
                    <View
                        style={[
                          styles.tableRow,
                          { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" },
                        ]}
                    >
                      <Text style={styles.cell}>{item.siteName}</Text>
                      <Text style={styles.cell}>{item.serviceStation}</Text>
                      <Text style={styles.cell}>{item.accountNumber}</Text>
                      <TouchableOpacity
                          style={styles.actionCell}
                          onPress={() => {
                            setSelectedItem(item);
                            setMenuVisible(true);
                          }}
                      >
                        <Ionicons name="ellipsis-vertical" size={20} color="#007BFF" />
                      </TouchableOpacity>
                    </View>
                )}
            />
        )}

        {/* this is where the 3 Dots Menu is (action) */}
        <Modal
            transparent={true}
            animationType="fade"
            visible={menuVisible}
            onRequestClose={() => setMenuVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.menu}>
              <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleEdit(selectedItem)}
              >
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleDelete(selectedItem.id)}
              >
                <Text style={{ color: "red" }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => setMenuVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Modal */}
        <Modal
            transparent={true}
            animationType="slide"
            visible={addModalVisible}
            onRequestClose={() => setAddModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>Add New Account</Text>

              <TextInput
                  style={styles.input}
                  placeholder="Site Name"
                  value={newSite}
                  onChangeText={setNewSite}
              />
              <TextInput
                  style={styles.input}
                  placeholder="Service Station"
                  value={newStation}
                  onChangeText={setNewStation}
              />
              <TextInput
                  style={styles.input}
                  placeholder="Account Number"
                  value={newAccount}
                  onChangeText={setNewAccount}
                  keyboardType="numeric"
              />

              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: "gray" }]}
                  onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.addButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Edit Modal */}
        <Modal
            transparent={true}
            animationType="slide"
            visible={editModalVisible}
            onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>Edit Account</Text>

              <TextInput
                  style={styles.input}
                  placeholder="Site Name"
                  value={editSite}
                  onChangeText={setEditSite}
              />
              <TextInput
                  style={styles.input}
                  placeholder="Service Station"
                  value={editStation}
                  onChangeText={setEditStation}
              />
              <TextInput
                  style={styles.input}
                  placeholder="Account Number"
                  value={editAccount}
                  onChangeText={setEditAccount}
                  keyboardType="numeric"
              />

              <TouchableOpacity style={styles.addButton} onPress={handleSaveEdit}>
                <Text style={styles.addButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: "gray" }]}
                  onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.addButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000BFF",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cell: { flex: 1, fontSize: 14, color: "#333" },
  actionCell: { width: 40, alignItems: "center", justifyContent: "center" },
  headerCell: { fontWeight: "bold", color: "#fff", textAlign: "left" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menu: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    width: 200,
  },
  menuItem: { paddingVertical: 10 },
  addForm: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "90%",
  },
  formTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
});

export default WelcomeScreen;
