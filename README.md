#### Chat Assist App

Chat Assist/Support allows for a random customer and the admin to cummunicate via short messages.


---
#### Build with
* [NodeJS](https://nodejs.org/en/about/)
* [Socket.IO](https://socket.io/docs/) 
* [MongoDB](https://www.mongodb.com/what-is-mongodb) 

#### Dependencies


```
"dependencies": {
    "express": "^4.16.4",
    "mongoose": "^5.5.1",
    "socket.io": "^2.2.0",
    "uuid": "^3.3.2"
  }
```
To install all dependecies just *clone* this repository and *npm install* 

---

#### Task list:

- [x] Create a communication channel user <> admin
- [x] Add a database to save chatboxes; *(after this task the new connected admins will read old chat boxes from database)*
- [x] Handlle multiple connection *(ie. an user can opens multiple tabs)*
- [x] Design the chat box and admin panel tab. *(admin panel tab is the place where connected admins respond to clients)*
- [x] Add block conversation event *(ie. at one conversation can respond JUST an admin)*
- [ ] Add isTyping event
- [ ] Data validation

  
