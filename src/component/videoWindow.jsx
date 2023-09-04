import React from "react";
import { faPhoneSlash, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

const Video = ({ callEnd: stopCall, socket, room, username }) => {
  let localStream = null;
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream = stream;
        setStream(stream);
        if (myVideo.current) myVideo.current.srcObject = stream;
      });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });

    socket.on("callEnd", () => {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });

      stopCall.forEach((f) => f(false));
    });
  }, []);

  const callUser = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        signalData: data,
        from: username,
        room: room,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });
    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        signal: data,
        room: room,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    setReceivingCall(false);
    socket.emit("callEnded", { room: room });

    //connectionRef.current.destroy();
  };

  return (
    <div className="video-window">
      {callAccepted && !callEnded ? (
        <button className="send-btn btn btn-primary m-1" onClick={leaveCall}>
          <FontAwesomeIcon icon={faPhoneSlash} />
        </button>
      ) : (
        <button className="send-btn btn btn-primary m-1" onClick={callUser}>
          <FontAwesomeIcon icon={faPhone} />
        </button>
      )}
      <div className="video">
        {stream && (
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            style={{ width: "300px" }}
          />
        )}
      </div>
      <div className="video">
        {callAccepted && !callEnded ? (
          <video
            playsInline
            ref={userVideo}
            autoPlay
            style={{ width: "300px" }}
          />
        ) : null}
        {receivingCall && !callAccepted ? (
          <div className="caller">
            <h1>{caller} is calling...</h1>
            <input type="button" value="answer call" onClick={answerCall} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Video;
