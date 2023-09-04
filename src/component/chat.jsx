import React, { useEffect, useRef, useState } from "react";
import "../styles/chat.css";
import Image from "./image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImage, faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import Video from "./videoWindow";

const ChatWindow = ({ messages, sendMessage, username, socket, room }) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState("");
  const [videoCall, setVideoCall] = useState(false);
  const fileRef = useRef();
  const [receivingCall, setReceivingCall] = useState(false);

  useEffect(() => {
    socket.on("receiveCall", () => {
      setReceivingCall(true);
    });
  }, []);

  const renderMessage = (msg, index) => {
    if (msg.type === "file/text") {
      const blob = new Blob([msg.file], { type: msg.fileType });
      return (
        <div
          key={index}
          className={`message ${username === msg.author ? "you" : ""}`}>
          <div className="message-content remove-background">
            <Image fileName={msg.fileName} blob={blob} />
          </div>
          <div className="message-content">{msg.message}</div>
          <div className="message-meta">
            <span className="message-time">{msg.time}</span>
            <span className="message-sender">{msg.author}</span>
          </div>
        </div>
      );
    } else if (msg.type === "file") {
      const blob = new Blob([msg.file], { type: msg.fileType });
      return (
        <div
          key={index}
          className={`message ${username === msg.author ? "you" : ""}`}>
          <div className="message-content remove-background">
            <Image fileName={msg.fileName} blob={blob} />
          </div>
          <div className="message-meta">
            <span className="message-time">{msg.time}</span>
            <span className="message-sender">{msg.author}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div
          key={index}
          className={`message ${username === msg.author ? "you" : ""}`}>
          <div className="message-content">{msg.message}</div>
          <div className="message-meta">
            <span className="message-time">{msg.time}</span>
            <span className="message-sender">{msg.author}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="chatwindow">
      <div className="window">
        <div className="chat-header">
          <h3>CHAT LIVE</h3>
          <button
            className="send-btn btn btn-primary m-1"
            onClick={(e) => setVideoCall(true)}>
            <FontAwesomeIcon icon={faVideo} />
          </button>
        </div>
        <div className="messages-window">
          <div className="messages">{messages.map(renderMessage)}</div>
        </div>
        <div className="chat-input">
          <input
            type="text"
            className="text-input"
            name="message"
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="file-input btn btn-dark m-1"
            onClick={(e) => {
              e.currentTarget.querySelector("input").click();
            }}>
            <input
              type="file"
              name="file"
              id="file"
              hidden
              ref={fileRef}
              accept="image/*"
              onChange={(e) => {
                setFile(e.currentTarget.files[0]);
              }}
            />
            <FontAwesomeIcon icon={faFileImage} />
          </button>

          <button
            className="send-btn btn btn-primary m-1"
            onClick={() =>
              sendMessage(message, file, setMessage, setFile, fileRef)
            }>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
        {(videoCall || receivingCall) && (
          <Video
            callEnd={[setVideoCall, setReceivingCall]}
            socket={socket}
            username={username}
            room={room}
          />
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
