import { auth } from "./firebase-config";
import { getUserHistory } from "./db";
import { onAuthStateChanged } from "firebase/auth";

const renderHistory = (history) => {
  const tbody = document.getElementById('history-list');
  const noHistory = document.getElementById('no-history');

  if (!history || history.length === 0) {
    tbody.innerHTML = '';
    noHistory.style.display = 'block';
    return;
  }

  noHistory.style.display = 'none';
  tbody.innerHTML = history.map(attempt => {
    const date = new Date(attempt.date).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    // Determine pass/fail (assuming 65% is pass, can be adjusted)
    const isPass = attempt.percentage >= 65;
    const badgeClass = isPass ? 'score-pass' : 'score-fail';
    const badgeText = isPass ? 'Aprobado' : 'Reprobado';
    const examName = attempt.slug ? attempt.slug.replace(/-/g, ' ').toUpperCase() : 'EXAMEN';

    return `
      <tr>
        <td><strong>${examName}</strong></td>
        <td>${date}</td>
        <td>${attempt.score} / ${attempt.totalQuestions} (${attempt.percentage}%)</td>
        <td><span class="score-badge ${badgeClass}">${badgeText}</span></td>
      </tr>
    `;
  }).join('');
};

const initProfile = async (user) => {
  const loading = document.getElementById('profile-loading');
  const content = document.getElementById('profile-content');
  
  // Update User Info
  const name = user.displayName || user.email.split('@')[0];
  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-avatar').textContent = name.charAt(0).toUpperCase();
  
  if (user.metadata.creationTime) {
    const joined = new Date(user.metadata.creationTime).toLocaleDateString('es-ES');
    document.getElementById('profile-joined').textContent = `Miembro desde: ${joined}`;
  }

  // Fetch History
  try {
    const history = await getUserHistory(user.uid);
    renderHistory(history);
  } catch (error) {
    console.error("Error loading history", error);
  } finally {
    loading.style.display = 'none';
    content.style.display = 'block';
  }
};

// Wait for auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    initProfile(user);
  } else {
    // Redirect if not logged in
    window.location.href = '/index.html';
  }
});
