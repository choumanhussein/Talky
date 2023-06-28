import { useEffect, useState, useRef } from 'react';
import arrow from "../assets/arrow.png"
import bg from '../assets/bg.png';
import axios from 'axios';
import type { RootState } from '../store';
import { Dna } from 'react-loader-spinner';
import Title from '../components/Title';
import { useSelector, useDispatch } from 'react-redux';
import { addAnswer, predictDominateFeeling, savePrediction } from '../slices/conversationSlice';
import { useNavigate } from 'react-router';


function Questionary() {
  const questions1 = useSelector((state: RootState) => state.conversation.questions)
  const dominate_feeling = useSelector((state: RootState) => state.conversation.dominate_feeling)
  console.log(dominate_feeling)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setcurrentQuestion] = useState(0);
  const [messages, setMessages] = useState([
    {
      msg: 'Hello, How can I help you ?',
      fromUser: false,
    },
  ]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const themes = {
    primaryColor: '#475569',
    secondryColor: '#475569',
    primaryFontColor: 'white',
    secondryFontColor: '#2C3333',
    logoColor: '#E7F6F2',
    backgroudImage: bg,
  };

  const sendMessage = async () => {
    if (userInput !== '') {
      setLoading(true);
      const answer_payload = {
        ...questions1[currentQuestion],
        answer: userInput
      };

      try {
        const response = await axios.get(`http://localhost:8000/classify-emotion?text=${userInput}`);
        const payload = {
          id: questions1[currentQuestion].id,
          question: questions1[currentQuestion].question,
          answer: userInput,
          feeling_predict: response.data,
        };
        
        dispatch(addAnswer(answer_payload));
        dispatch(savePrediction(payload));
        
        if (currentQuestion !== 1) {
          setcurrentQuestion(currentQuestion + 1);
        } else {
          alert("We are connecting you to Talkyy, your virtual psychologist !!");
          dispatch(predictDominateFeeling());
          navigate("/chat");
        }
      } catch (error) {
        console.log(error);
      }

      setLoading(false);
      setUserInput("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
 

  // useEffect(() => {
  //   if (dominate_feeling.length > 0) {
  //     const formData = new FormData()
  //     formData.append("dominate_feeling", dominate_feeling[2])
  //     axios
  //       .post('http://localhost:8000/introduction-message', dominate_feeling[2])
  //       .then(response => {
  //         console.log(response.data);
  //       })
  //       .catch(error => {
  //         console.error("error:", error);
  //       });
  //   }
  // }, [dominate_feeling]);
  
  
  return (
    <div
      className="min-h-screen bg-gray-100"
      style={{ background: `url(${themes.backgroudImage})`, backgroundSize: 'cover' }}
    >
      <div
        style={{ backgroundColor: themes.primaryColor }}
        className={`w-full h-18  fixed flex justify-between`}
      >
        <Title setMessages={setMessages} />
      </div>

      <div className="py-32">
        <div
          className="max-w-2xl mx-auto space-y-12 grid grid-cols-1 overflow-y-auto scroll-smooth scrollbar-hide overflow-x-hidden"
          style={{ maxHeight: '30rem' }}
        >
          {loading && (
            <div className="flex justify-center items-center" style={{ height: "60vh" }}>
              <Dna
                visible={true}
                height="100"
                width="100"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
              />
            </div>
          )}

                    {/* <ul>
            {messages &&
              messages.map((message, idx) => {
                return (
                  <div
                    key={idx}
                    className={`mt-3 ${
                      message.fromUser
                        ? 'place-self-end text-right'
                        : 'place-self-start text-left'
                    }`}
                  >
                    <div
                      className="mt-3 p-3 rounded-2xl"
                      style={{
                        backgroundColor: message.fromUser
                          ? themes.primaryColor
                          : 'white',
                        color: message.fromUser
                          ? themes.primaryFontColor
                          : themes.secondryFontColor,
                      }}
                    >
                      <p className="break-words text-md">
                        {message.fromUser ? message.msg : message.msg}
                      </p>
                    </div>
                  </div>
                );
              })}
          </ul> */}

          <div
            className="mt-3 p-3 rounded-2xl"
            style={{
              backgroundColor: "white",
              color: themes.secondryFontColor
            }}
          >
            <p className="font-serif break-words text-md">
              {questions1[currentQuestion].question}
            </p>
          </div>

          {userInput !== "" && loading &&
            <div
              className="mt-3 p-3 rounded-2xl"
              style={{
                backgroundColor: themes.primaryColor,
                color: themes.primaryFontColor
              }}
            >
              <p className="break-words text-md">
                {userInput}
              </p>
            </div>
          }

          <div ref={bottomRef} />
        </div>
      </div>

      <div className={`w-full fixed bottom-0`}>
        <div className="justify-end items-center bg-white rounded-xl flex mx-96 my-3">
          <input
            className="p-3 bg-white w-full rounded-l-md border-0 outline-none"
            placeholder="Ask your question..."
            type="text"
            id="message"
            name="message"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            style={{ backgroundColor: themes.secondryColor }}
            className={`p-4 rounded-r-xl`}
            onClick={sendMessage}
          >
            <img className="w-8" src={arrow} alt="arrow" />
          </button>
        </div>
      </div>
    </div>
  );
  
}

export default Questionary;