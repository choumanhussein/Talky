// @ts-ignore

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Questionary from '../pages/questionary';

export interface Question {
  id: number;
  question: string;
  answer: string;
  feeling_predict: [];
}

export interface ConversationState {
  questions: Question[];
  dominate_feeling: string[]; 
}

const initialState: ConversationState = {

  questions: [
    {
      id: 1,
      question: "How are you feeling today ?",
      answer: "",
      feeling_predict: []
    },
    {
      id: 2,
      question: "What's making you feel this way?",
      answer: "",
      feeling_predict: []
    },
    {
      id: 3,
      question: "When you think about why you feel this way, do you often feel stressed or overwhelmed?",
      answer: "",
      feeling_predict: []
    },
    {
      id: 4,
      question: "What do you usually do to feel better when you're stressed or overwhelmed?",
      answer: "",
      feeling_predict: []
    },
    {
      id: 5,
      question: "Do you feel supported by the people closest to you?",
      answer: "",
      feeling_predict: []
    },
    {
      id: 6,
      question: "How confident do you feel when dealing with your biggest source of stress?",
      answer: "",
      feeling_predict: []
    },
    {
      id: 7,
      question: "Overall, how happy are you with your life right now?",
      answer: "",
      feeling_predict: []
    }

  ],
  dominate_feeling: []
};

export const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {

    addAnswer: (state, action: PayloadAction<Question>) => {

      const questionIndex = state.questions.findIndex((question: Question) => question.id === action.payload.id);
      if (questionIndex !== -1) {
        state.questions[questionIndex] = action.payload;
      }
    
    },

    // payload == data

    savePrediction: (state, action: PayloadAction<Question>) => {

      const questionIndex = state.questions.findIndex((question: Question) => question.id === action.payload.id);
      if (questionIndex !== -1) {
        state.questions[questionIndex] = action.payload;
      }
    },
    predictDominateFeeling: (state) => {
      const prediction_array = state.questions.map((question: Question) => question.feeling_predict )
      let feeling_classification= {}
      prediction_array.forEach(prediction => {
          
      const question_feeling = prediction
      
      for (const feeling of question_feeling ) {
          // console.log(feeling)
          // console.log(feeling_classification[feeling.label])
          const current_feeling = feeling
          for (const label of current_feeling){
              if (feeling_classification[label.label]) {
                  feeling_classification[label.label] = [...feeling_classification[label.label], label.score]
                  }
                  else {
                  feeling_classification[label.label] = [label.score]
                  }
          }
          //  
      }
      
      });
      // console.log(feeling_classification)
      const final_state = {};
      for (const key in feeling_classification) {
        const arr = feeling_classification[key];
        const average = arr.reduce((a, b) => a + b, 0) / arr.length;
        final_state[key] = average;
      }
      // console.log(final_state)
      // Step 1: Convert the final_state object into an array of key-value pairs
      const dataArray = Object.entries(final_state);
      
      // Step 2: Sort the array based on the values in descending order
      dataArray.sort((a, b) => b[1] - a[1]);
      
      // Step 3: Retrieve only the keys from the sorted array
      const maxKeys = dataArray.slice(0, 2).map(([key, value]) => key);
      
      // console.log(maxKeys);
      state.dominate_feeling = maxKeys
  

    }
  },
});

// Action creators are generated for each case reducer function
export const { addAnswer, savePrediction, predictDominateFeeling } = conversationSlice.actions;
export default conversationSlice.reducer;

