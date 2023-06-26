import json
import random

def get_recent_messages(dominate_feeling):
    # Define the file name and learn instruction
    file_name = "stored_data.json"
    learn_instruction = {
        "role": "system",
        "content": f"the user is feeling {dominate_feeling}. Your not a program and you have feelings.  Your name is Talky, a psychologist, You are speaking with a person which is depressive, . Assure to provide the best support"
    }

    # Initialize messages
    messages = []

    # Add a random element
    # x = random.uniform(0, 1)
    # if x < 0.5:
    #     learn_instruction["content"] += " Your response will include some dry humour"
    # else:
    #     learn_instruction["content"] += " Your response will include some rather challenging questions."

    # Append Instruction to message
    messages.append(learn_instruction)

    # Get last messages
    try:
        with open(file_name) as user_file:
            data = json.load(user_file)

            # Append last 5 items of data
            if data:
                if len(data) < 5:
                    for item in data:
                        messages.append(item)
                else:
                    for item in data[-5:]:
                        messages.append(item)
    except Exception as e:
        print(e)
        pass

    return messages

def store_messages(request_message, response_message):
    file_name = "stored_data.json"

    messages = get_recent_messages()[1:]

    user_message = {"role": "user", "content": request_message}
    assistant_message = {"role": "assistant", "content": response_message}
    messages.append(user_message)
    messages.append(assistant_message)

# Save the update file

    with open(file_name, "w") as f:
        json.dump(messages, f)

# Reset Messages
def reset_messages():
    open("stored_data.json", "w")

