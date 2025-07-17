
const repo = "manlinh/ts-editor-2025";
const token = "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";
const filePath = "messages.json";
const chatBox = document.getElementById("chat-box");
const emojiMap = { ":smile:": "😄", ":fire:": "🔥", ":heart:": "❤️" };

function parseEmojis(text) {
  return text.replace(/:\w+:/g, m => emojiMap[m] || m);
}
function getUserColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${hash % 360}, 70%, 80%)`;
}

async function fetchMessages() {
  const res = await fetch(`https://raw.githubusercontent.com/${repo}/main/${filePath}`);
  const messages = await res.json();
  renderMessages(messages);
}

function renderMessages(messages) {
  chatBox.innerHTML = "";
  messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  for (const msg of messages) {
    const div = document.createElement("div");
    div.className = "msg";
    div.style.background = getUserColor(msg.user);
    div.innerHTML = `<strong>${msg.user}</strong>: ${parseEmojis(msg.text)} <span class="time">(${msg.timestamp.slice(11,16)})</span>`;
    chatBox.appendChild(div);
  }
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const user = document.getElementById("username").value.trim() || "匿名";
  const text = document.getElementById("message").value.trim();
  if (!text) return;
  const now = new Date().toISOString();
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`);
  const json = await res.json();
  const content = JSON.parse(atob(json.content));
  content.push({ user, text, timestamp: now });

  await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: { Authorization: `token ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `💬 ${user} 留言`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
      sha: json.sha
    })
  });
  document.getElementById("message").value = "";
  fetchMessages();
}

fetchMessages();
setInterval(fetchMessages, 5000);
