import { useState } from "react";
import Title from "./Title";
import RecordMessage from "./RecordMessage";
import axios from "axios";
import { useSelector} from 'react-redux';
import { RootState } from "../store";

interface Message {
  sender: string;
  blobUrl: string;
}

function Controller() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const dominate_feeling = useSelector((state: RootState) => state.conversation.dominate_feeling)

  const createBlobUrl = (data: any) => {
    const blob = new Blob([data], { type: "audio/mpeg" });
    const url = window.URL.createObjectURL(blob);
    return url;
  };

  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);
    const myMessage = { sender: "me", blobUrl };
    const newMessagesArr = messages.concat(myMessage);

    fetch(blobUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        // Construct Audio To Send file
        const formData = new FormData();
        formData.append("file", blob, "myFile.wav");
        formData.append("dominate_feeling", dominate_feeling)

        // Send form data to API endpoint
        try {
          const res = await axios.post("http://localhost:8000/post-audio", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            responseType: "arraybuffer",

          });

          const responseBlob = res.data;
          const audio = new Audio();
          audio.src = createBlobUrl(responseBlob);

          // Append to audio
          const TalkyyMessage = { sender: "Talky", blobUrl: audio.src };
          const updatedMessagesArr = newMessagesArr.concat(TalkyyMessage);
          setMessages(updatedMessagesArr);

          // Play Audio
          setIsLoading(false);
          audio.play();
        } catch (err: any) {
          console.error("Error:", err); // Log the error object itself
          console.error("Error Message:", err.message); // Log the error message
          console.error("Stack Trace:", err.stack);
        }
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };

  return (
    <div className="h-screen overflow-y-hidden">
      <Title setMessages={setMessages} />
      <div className="flex flex-col justify-between h-full overflow-y-scroll pb-96">
        {/* Conversation */}
        <div className="mt-5 px-5">
          {messages.map((audio, index) => {
            return (
              <div
                key={index + audio.sender}
                className={`flex flex-col ${audio.sender === "me" ? "items-start" : "items-end"}`}
              >
                {/* Sender */}
                <div className="mt-4">
                  <p
                    className={`ml-2 italic text-${audio.sender === "me" ? "blue" : "green"}-500`}
                  >
                    {audio.sender}
                  </p>
                  {/* Audio Message */}
                  <audio src={audio.blobUrl} className="appearance-none" controls />
                </div>
              </div>
            );
          })}
        </div>
        {messages.length === 0 && !isLoading && (
          <div className="text-center font-light italic mt-10">
            Send Talky a message...
          </div>
        )}
        {isLoading && (
          <div className="text-center font-light italic mt-10 animate-pulse">
            Talkyy is recording...
          </div>
        )}
        {/* Recorder */}
        <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-sky-500 to-green-500">
          <div className="flex justify-center items-center w-full">
            <RecordMessage handleStop={handleStop} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controller;
