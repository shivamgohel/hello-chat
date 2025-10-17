const socket = io();

const clientCountEl = document.getElementById("client-count");
const messagesContainer = document.getElementById("messages");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messageFeedback = document.querySelector(".message-feedback");

socket.on("client count", (count) => {
  if (clientCountEl) {
    clientCountEl.textContent = `Connected clients: ${count}`;
  }
});

socket.on("chat message", (data) => {
  appendMessage(data, false);
  messageFeedback.textContent = "";
});

socket.on("typing", (name) => {
  messageFeedback.textContent = name ? `${name} is typing...` : "";
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameInput.value.trim() || "Anonymous";
  const message = messageInput.value.trim();
  if (!message) return;

  const data = { name, message, dateTime: new Date().toISOString() };

  socket.emit("chat message", data);
  appendMessage(data, true);
  messageInput.value = "";
  socket.emit("typing", "");
});

messageInput.addEventListener("input", () => {
  const name = nameInput.value.trim() || "Anonymous";
  socket.emit("typing", name);
});

messageInput.addEventListener("blur", () => {
  socket.emit("typing", "");
});

function appendMessage({ name, message, dateTime }, isUser) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("chat-line", isUser ? "user" : "other");

  let time = "";
  if (dateTime) {
    const parsedDate = new Date(dateTime);
    if (!isNaN(parsedDate)) {
      time = parsedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  messageEl.innerHTML = `
    <div class="message-name">${name}</div>
    <div class="message-row">
      <div class="message-text">${message}</div>
      <div class="message-time">${time}</div>
    </div>
  `;
  messagesContainer.appendChild(messageEl);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
