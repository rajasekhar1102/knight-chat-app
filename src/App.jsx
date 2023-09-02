import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import io from "socket.io-client";
import ChatWindow from "./component/chat";

const socket = io.connect("https://knight-chat-sever.onrender.com");

function App() {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [chatWindow, setChatWindow] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);

  const joinRoom = async (event) => {
    if (!room || !username) {
      alert("enter valid details");
      return;
    }
    await socket.emit("join_room", { room });
    setChatWindow(true);
  };

  const sendMessage = async (message, file, setMessage, setFile, fileRef) => {
    if (!file && !message) return;
    const date = new Date(Date.now());
    let messageObj = {};
    if (file && message) {
      messageObj = {
        author: username,
        type: "file/text",
        file: file,
        message: message,
        fileType: file.type,
        fileName: file.name,
        time: date.getHours() + ":" + date.getMinutes(),
        room: room,
      };
    } else if (file) {
      messageObj = {
        author: username,
        type: "file",
        file: file,
        fileType: file.type,
        fileName: file.name,
        time: date.getHours() + ":" + date.getMinutes(),
        room: room,
      };
    } else {
      messageObj = {
        author: username,
        type: "text",
        message: message,
        time: date.getHours() + ":" + date.getMinutes(),
        room: room,
      };
    }
    setMessage("");
    setFile("");
    fileRef.current.value = null;
    await socket.emit("send_message", messageObj);
    setMessageHistory((list) => [...list, messageObj]);
  };

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      if (room === msg.room) {
        console.log(msg);
        setMessageHistory((list) => [...list, msg]);
      }
    });
  }, [socket, room]);

  return (
    <div className="d-flex w-100 h-100 justify-content-center bg-body-secondary align-items-center">
      {!chatWindow && (
        <div className="join-window container w-25 text-center bg-info-subtle">
          <h1 className="text-danger">KNIGHT CHAT</h1>
          <div className="row p-2">
            <div className="col">
              <label
                className="text-white bg-black px-3 py-2 rounded-pill"
                htmlFor="room">
                Room ID
              </label>
            </div>
            <div className="col">
              <input
                type="text"
                value={room}
                name="room"
                id="room"
                onChange={(e) => setRoom(e.currentTarget.value)}
                className="room-input"
              />
            </div>
          </div>
          <div className="row">
            <div className="col ">
              <label
                className="text-white bg-black px-3 py-2 rounded-pill"
                htmlFor="username">
                UserName
              </label>
            </div>
            <div className="col">
              <input
                type="text"
                value={username}
                name="username"
                id="username"
                onChange={(e) => setUsername(e.currentTarget.value)}
                className="username-input"
              />
            </div>
          </div>
          <div className="row p-2">
            <div className="col">
              <button onClick={joinRoom} className="join-btn btn btn-primary">
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}
      {chatWindow && (
        <ChatWindow
          messages={messageHistory}
          sendMessage={sendMessage}
          username={username}
        />
      )}
    </div>
  );
}

export default App;
