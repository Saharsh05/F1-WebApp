// auth.js
export function saveSession({ access_token, user_id, email }) {
    localStorage.setItem("session", JSON.stringify({ access_token, user_id, email }));
  }
  
  export function getSession() {
    const s = localStorage.getItem("session");
    return s ? JSON.parse(s) : null;
  }
  
  export function clearSession() {
    localStorage.removeItem("session");
  }
  