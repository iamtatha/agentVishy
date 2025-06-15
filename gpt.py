from langchain.memory import ConversationBufferMemory
from langchain.llms import Ollama
from langchain.chains import ConversationChain
from langchain.chat_models import ChatOpenAI
import time
import sys
import json
import os
import openai


class GPTAgent:
    def __init__(self, model, api_key):
        self.agent = ChatOpenAI(model_name=model, temperature=0.7, openai_api_key=api_key)
        self.memory = ConversationBufferMemory()
        self.conversation = ConversationChain(llm = self.agent, memory = self.memory)


    def startConversation(self):
        message = self.therapist_prompt
        patient_initial = self.conversation_2.predict(input = self.patient_prompt)
        self.memory_2.save_context({"input": self.patient_prompt}, {"output": patient_initial})
        monitor = ConversationMonitor(self.conversation_time)
        iteration = 0
        save_interval = 1
        responses = []

        while(True):
            # print(monitor.time_elapsed, monitor.stop_alert, monitor.force_stop)
            if monitor.force_stop:
                break
            
            if monitor.stop_alert:
                response_1 = self.conversation_1.predict(input=f"{self.therapist_end_prompt}{message}")
            else:
                response_1 = self.conversation_1.predict(input=message)
                
            response_1 = response_1.replace('\n\n', '\n')
            self.memory_1.save_context({"input": message}, {"output": response_1})
            self.output_txt_file.write(f"Therapist: \n{response_1}\n\n")
            monitor.checkStoppingCondition(response_1)
            
            
            # response_2 = input('Agent 2:')
            response_2 = self.conversation_2.predict(input=response_1)
            response_2 = response_2.replace('\n\n', '\n')
            self.memory_2.save_context({"input": response_1}, {"output": response_2})
            
            self.output_txt_file.write(f"Patient: \n{response_2}\n\n\n")
            monitor.checkStoppingCondition(response_2)
            
            json_file = self.output_json_file
            responses.append({'therapist': response_1, 'metric': self.getMetrics(0, message, response_1)})
            responses.append({'patient': response_2, 'metric': self.getMetrics(1, response_1, response_2)})
            
            if iteration % save_interval == 0:
                json.dump(responses, self.output_json_file, indent=4)
                responses = []
            
            message = response_2  
            print('Iteration Done', iteration+1)
            iteration += 1

            # print(f"Agent 1: {response_1}")
            # print(f"Agent 2: {response_2}")
        
        self.getAvgMetrics()
        json.dump(self.avg_metrics, self.output_json_file, indent=4)   
