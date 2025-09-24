// Firebase Configuration và Database Service
class FirebaseService {
    constructor() {
        this.database = null;
        this.isOnline = navigator.onLine;
        this.initFirebase();
        this.setupOfflineSupport();
    }

    initFirebase() {
        // Firebase config - Thay thế bằng config thực tế của bạn
        const firebaseConfig = {
            apiKey: "demo-api-key",
            authDomain: "attendance-demo.firebaseapp.com",
            databaseURL: "https://attendance-demo-default-rtdb.firebaseio.com",
            projectId: "attendance-demo",
            storageBucket: "attendance-demo.appspot.com",
            messagingSenderId: "123456789",
            appId: "demo-app-id"
        };

        try {
            // Kiểm tra xem Firebase đã được load chưa
            if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== 'demo-api-key') {
                firebase.initializeApp(firebaseConfig);
                this.database = firebase.database();
                console.log('Firebase initialized successfully');
                showNotification('Kết nối Firebase thành công', 'success');
            } else {
                console.warn('Firebase SDK not loaded or using demo config, using fallback storage');
                this.setupFallbackStorage();
                showNotification('Sử dụng chế độ offline', 'info');
            }
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            this.setupFallbackStorage();
            showNotification('Chuyển sang chế độ offline', 'info');
        }
    }

    setupFallbackStorage() {
        // Fallback sử dụng localStorage với sync mechanism
        this.database = {
            ref: (path) => ({
                set: (data) => this.setLocalData(path, data),
                push: (data) => this.pushLocalData(path, data),
                on: (event, callback) => this.onLocalData(path, callback),
                once: (event) => this.onceLocalData(path),
                off: () => {},
                update: (data) => this.updateLocalData(path, data)
            })
        };
    }

    setupOfflineSupport() {
        // Theo dõi trạng thái online/offline
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineData();
            showNotification('Đã kết nối internet - Đồng bộ dữ liệu', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            showNotification('Mất kết nối internet - Chế độ offline', 'info');
        });
    }

    // Fallback methods cho localStorage
    setLocalData(path, data) {
        return new Promise((resolve) => {
            const key = `firebase_${path.replace(/\//g, '_')}`;
            localStorage.setItem(key, JSON.stringify(data));
            
            // Broadcast change to other tabs
            this.broadcastChange(path, data);
            resolve();
        });
    }

    pushLocalData(path, data) {
        return new Promise((resolve) => {
            const key = `firebase_${path.replace(/\//g, '_')}`;
            const existing = JSON.parse(localStorage.getItem(key) || '{}');
            const newId = Date.now().toString();
            existing[newId] = data;
            
            localStorage.setItem(key, JSON.stringify(existing));
            this.broadcastChange(path, existing);
            
            resolve({ key: newId });
        });
    }

    onceLocalData(path) {
        return new Promise((resolve) => {
            const key = `firebase_${path.replace(/\//g, '_')}`;
            const data = JSON.parse(localStorage.getItem(key) || 'null');
            resolve({ val: () => data });
        });
    }

    onLocalData(path, callback) {
        const key = `firebase_${path.replace(/\//g, '_')}`;
        
        // Initial call
        const data = JSON.parse(localStorage.getItem(key) || 'null');
        callback({ val: () => data });

        // Listen for changes
        window.addEventListener('storage', (e) => {
            if (e.key === key) {
                const newData = JSON.parse(e.newValue || 'null');
                callback({ val: () => newData });
            }
        });

        // Listen for broadcast messages
        window.addEventListener('message', (e) => {
            if (e.data.type === 'firebase_change' && e.data.path === path) {
                callback({ val: () => e.data.data });
            }
        });
    }

    updateLocalData(path, data) {
        return new Promise((resolve) => {
            const key = `firebase_${path.replace(/\//g, '_')}`;
            const existing = JSON.parse(localStorage.getItem(key) || '{}');
            const updated = { ...existing, ...data };
            
            localStorage.setItem(key, JSON.stringify(updated));
            this.broadcastChange(path, updated);
            resolve();
        });
    }

    broadcastChange(path, data) {
        // Broadcast to other tabs/windows
        if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('firebase_sync');
            channel.postMessage({
                type: 'firebase_change',
                path: path,
                data: data
            });
        }

        // Fallback for older browsers
        window.postMessage({
            type: 'firebase_change',
            path: path,
            data: data
        }, '*');
    }

    syncOfflineData() {
        // Sync offline data when back online
        if (this.database && typeof firebase !== 'undefined') {
            const offlineData = this.getOfflineData();
            Object.keys(offlineData).forEach(key => {
                const path = key.replace('firebase_', '').replace(/_/g, '/');
                const data = JSON.parse(offlineData[key]);
                
                if (data && typeof data === 'object') {
                    this.database.ref(path).update(data);
                }
            });
        }
    }

    getOfflineData() {
        const offlineData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('firebase_')) {
                offlineData[key] = localStorage.getItem(key);
            }
        }
        return offlineData;
    }

    // Public API methods
    saveRoom(roomData) {
        if (this.database) {
            return this.database.ref(`rooms/${roomData.id}`).set(roomData);
        }
        return Promise.resolve();
    }

    getRooms() {
        if (this.database) {
            return this.database.ref('rooms').once('value');
        }
        return Promise.resolve({ val: () => ({}) });
    }

    getRoom(roomId) {
        if (this.database) {
            return this.database.ref(`rooms/${roomId}`).once('value');
        }
        return Promise.resolve({ val: () => null });
    }

    listenToRoom(roomId, callback) {
        if (this.database) {
            this.database.ref(`rooms/${roomId}`).on('value', callback);
        }
    }

    stopListeningToRoom(roomId) {
        if (this.database) {
            this.database.ref(`rooms/${roomId}`).off();
        }
    }

    addStudentToRoom(roomId, studentData) {
        if (this.database) {
            return this.database.ref(`rooms/${roomId}/students`).push(studentData);
        }
        return Promise.resolve();
    }

    updateRoomStatus(roomId, isActive) {
        if (this.database) {
            return this.database.ref(`rooms/${roomId}/isActive`).set(isActive);
        }
        return Promise.resolve();
    }

    addActivity(activity) {
        if (this.database) {
            return this.database.ref('activities').push(activity);
        }
        return Promise.resolve();
    }

    getActivities(limit = 50) {
        if (this.database) {
            return this.database.ref('activities').limitToLast(limit).once('value');
        }
        return Promise.resolve({ val: () => ({}) });
    }

    // Utility method to check connection
    isConnected() {
        return this.isOnline && this.database !== null;
    }

    // Method to get connection status
    getConnectionStatus() {
        if (this.database && typeof firebase !== 'undefined') {
            return 'Firebase Connected';
        } else if (this.isOnline) {
            return 'Local Storage (Online)';
        } else {
            return 'Local Storage (Offline)';
        }
    }
}

// Khởi tạo Firebase service
const firebaseService = new FirebaseService();

// Export cho các module khác
window.firebaseService = firebaseService;