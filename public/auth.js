// Базовая аутентификация (для демо)
class Auth {
    static async login(email, password) {
        // Заглушка для демо
        localStorage.setItem('user', JSON.stringify({ email, loggedIn: true }));
        return true;
    }

    static async register(email, password, username) {
        // Заглушка для демо
        localStorage.setItem('user', JSON.stringify({ email, username, loggedIn: true }));
        return true;
    }

    static logout() {
        localStorage.removeItem('user');
    }

    static isLoggedIn() {
        return localStorage.getItem('user') !== null;
    }

    static getUser() {
        return JSON.parse(localStorage.getItem('user') || '{}');
    }
}