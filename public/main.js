const socket = io();

socket.on("client count", (count) => {
  console.log("Connected clients:", count);

  const clientCountEl = document.getElementById("client-count");
  if (clientCountEl) {
    clientCountEl.textContent = `Connected clients: ${count}`;
  }
});
