import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

const downloadapi = "http://127.0.0.1:5000/report?uid=651ff734940dedb6ddd87cb3";

const uploadapi = "http://127.0.0.1:5000/upload";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  const [inputText, setInputText] = useState("");

  const handlePdfUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.style.display = "none";
    document.body.appendChild(input);

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("pdfFile", file);

        fetch(uploadapi, {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            if (response.ok) {
              console.log("PDF file uploaded successfully!");
            } else {
              console.error("Failed to upload the PDF file");
            }
          })
          .catch((error) => {
            console.error("Error while uploading the PDF file", error);
          });

        document.body.removeChild(input);
      }
    };

    input.click();
  };

  const handlePdfDownload = async () => {
    try {
      const response = await fetch(downloadapi, {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "report.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to download the PDF");
      }
    } catch (error) {
      console.error("Error while downloading the PDF", error);
    }
  };

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message) {
      chat(text);
      input.current.value = "";
    }
  };
  if (hidden) {
    return null;
  }

  useEffect(() => {
    if (inputText === "") return;
    chat(inputText);
  }, [inputText]);

  const listenAudio = () => {
    setInputText("");
    let SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    let recognition = new SpeechRecognition();
    recognition.lang = "bn-IN";

    recognition.start();
    recognition.onresult = (event) => {
      let word = event.results[0][0].transcript;
      console.log(word);
      setInputText(word);
    };
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl">Sanjeev-Ni</h1>
          <p>AI Healthcare Assistant!</p>
        </div>

        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            <img src="pdf.svg" width={30} height={30} />
          </button>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          {/* <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Type a message..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            // value={}
          /> */}
          <div
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            // placeholder=""
          >
            {inputText == "" ? "Press Mic to ask query" : inputText}
          </div>
          <button
            disabled={loading || message}
            // onClick={sendMessage}
            onClick={listenAudio}
            className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
              loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            <img src="microphone.svg" width={30} height={30} />
          </button>
          <button
            className="absolute top-2 right-2 bg-pink-500 text-white p-2 rounded"
            onClick={props.logOut}
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  );
};
